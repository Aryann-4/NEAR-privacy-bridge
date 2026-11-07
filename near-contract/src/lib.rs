use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near, require, AccountId, NearSchema, NearToken, PanicOnDefault};
use sha2::{Digest, Sha256};

/// Commitment hash: SHA-256(secret), matching the Midnight bridge model.
pub type CommitmentHash = [u8; 32];

#[derive(
    BorshDeserialize,
    BorshSerialize,
    Serialize,
    Deserialize,
    NearSchema,
    Clone,
    Debug,
    PartialEq,
    Eq,
)]
#[abi(json)]
#[serde(crate = "near_sdk::serde")]
pub struct Deposit {
    pub amount: U128,
    pub sender: AccountId,
    pub network: String,
    pub claimed: bool,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct BridgeContract {
    /// commitment -> locked deposit
    deposits: LookupMap<CommitmentHash, Deposit>,
    /// total currently locked per account
    user_deposits: LookupMap<AccountId, U128>,
    /// number of deposits ever created
    deposit_count: u64,
}

#[near]
impl BridgeContract {
    #[init]
    pub fn new() -> Self {
        Self {
            deposits: LookupMap::new(b"d"),
            user_deposits: LookupMap::new(b"u"),
            deposit_count: 0,
        }
    }

    /// Lock NEAR against a commitment hash.
    ///
    /// The caller must attach exactly `amount` yoctoNEAR. The commitment hash
    /// and deposit are public on NEAR; the secret stays with the user.
    #[payable]
    pub fn deposit(&mut self, amount: U128, commitment: CommitmentHash) {
        require!(amount.0 > 0, "Amount must be greater than zero");
        require!(commitment != [0u8; 32], "Commitment cannot be zero hash");
        require!(
            !self.deposits.contains_key(&commitment),
            "Commitment already locked - double spend"
        );

        let attached = env::attached_deposit();
        require!(
            attached == NearToken::from_yoctonear(amount.0),
            "Attached deposit must equal amount"
        );

        let sender = env::predecessor_account_id();
        self.deposits.insert(
            &commitment,
            &Deposit {
                amount,
                sender: sender.clone(),
                network: "near".to_string(),
                claimed: false,
            },
        );

        let total = self
            .user_deposits
            .get(&sender)
            .unwrap_or(U128(0))
            .0
            .checked_add(amount.0)
            .expect("Deposit total overflow");
        self.user_deposits.insert(&sender, &U128(total));
        self.deposit_count += 1;

        env::log_str(&format!(
            "DepositEvent:commitment={},amount={},sender={}",
            hex::encode(commitment),
            amount.0,
            sender
        ));
    }

    /// Verify the private witness and mark the commitment as claimed.
    ///
    /// Test-only direct path: the secret is passed as a public argument. In the
    /// full bridge this is replaced by Midnight's ZK claim; repeated claims are
    /// rejected and an invalid secret fails the hash check.
    pub fn withdraw(&mut self, commitment: CommitmentHash, secret: Vec<u8>) -> bool {
        let mut deposit = self.deposits.get(&commitment).expect("Deposit not found");

        require!(
            deposit.sender == env::predecessor_account_id(),
            "Not your deposit - only original sender can redeem"
        );
        require!(!deposit.claimed, "Commitment already claimed");
        require!(
            hash_secret(&secret) == commitment,
            "Secret does not match commitment"
        );

        deposit.claimed = true;
        let sender = deposit.sender.clone();
        let amount = deposit.amount.0;
        self.deposits.insert(&commitment, &deposit);

        let total = self
            .user_deposits
            .get(&sender)
            .unwrap_or(U128(0))
            .0
            .checked_sub(amount)
            .expect("Deposit total underflow");
        self.user_deposits.insert(&sender, &U128(total));

        env::log_str(&format!(
            "UnlockEvent:commitment={},amount={},sender={}",
            hex::encode(commitment),
            amount,
            sender
        ));

        true
    }

    pub fn get_deposit(&self, commitment: CommitmentHash) -> Option<Deposit> {
        self.deposits.get(&commitment)
    }

    pub fn view_deposit(&self, commitment: CommitmentHash) -> Option<Deposit> {
        self.get_deposit(commitment)
    }

    pub fn get_user_deposits(&self, account_id: AccountId) -> U128 {
        self.user_deposits.get(&account_id).unwrap_or(U128(0))
    }

    pub fn view_user_deposits(&self, account_id: AccountId) -> U128 {
        self.get_user_deposits(account_id)
    }

    pub fn get_deposit_count(&self) -> u64 {
        self.deposit_count
    }
}

fn hash_secret(secret: &[u8]) -> CommitmentHash {
    let digest = Sha256::digest(secret);
    let mut commitment = [0u8; 32];
    commitment.copy_from_slice(&digest);
    commitment
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    const SECRET: &[u8] = b"correct horse battery staple";
    const ONE_NEAR: u128 = 1_000_000_000_000_000_000_000_000;

    fn commitment() -> CommitmentHash {
        hash_secret(SECRET)
    }

    fn set_context(sender: AccountId, deposit: u128) {
        let mut context = VMContextBuilder::new();
        context
            .predecessor_account_id(sender)
            .attached_deposit(NearToken::from_yoctonear(deposit));
        testing_env!(context.build());
    }

    #[test]
    fn deposit_stores_amount_and_sender() {
        set_context(accounts(0), ONE_NEAR);
        let mut contract = BridgeContract::new();

        contract.deposit(U128(ONE_NEAR), commitment());

        let stored = contract.get_deposit(commitment()).expect("deposit exists");
        assert_eq!(stored.amount.0, ONE_NEAR);
        assert_eq!(stored.sender, accounts(0));
        assert!(!stored.claimed);
        assert_eq!(contract.get_user_deposits(accounts(0)).0, ONE_NEAR);
        assert_eq!(contract.get_deposit_count(), 1);
    }

    #[test]
    fn withdraw_verifies_secret_and_marks_claimed() {
        set_context(accounts(0), ONE_NEAR);
        let mut contract = BridgeContract::new();
        contract.deposit(U128(ONE_NEAR), commitment());

        let result = contract.withdraw(commitment(), SECRET.to_vec());

        assert!(result);
        assert!(contract.get_deposit(commitment()).expect("exists").claimed);
        assert_eq!(contract.get_user_deposits(accounts(0)).0, 0);
    }

    #[test]
    #[should_panic(expected = "Commitment already locked")]
    fn duplicate_commitment_is_rejected() {
        set_context(accounts(0), ONE_NEAR);
        let mut contract = BridgeContract::new();
        contract.deposit(U128(ONE_NEAR), commitment());
        contract.deposit(U128(ONE_NEAR), commitment());
    }

    #[test]
    #[should_panic(expected = "Secret does not match commitment")]
    fn wrong_secret_is_rejected() {
        set_context(accounts(0), ONE_NEAR);
        let mut contract = BridgeContract::new();
        contract.deposit(U128(ONE_NEAR), commitment());
        contract.withdraw(commitment(), b"wrong secret".to_vec());
    }

    #[test]
    #[should_panic(expected = "Attached deposit must equal amount")]
    fn mismatched_deposit_is_rejected() {
        set_context(accounts(0), ONE_NEAR - 1);
        let mut contract = BridgeContract::new();
        contract.deposit(U128(ONE_NEAR), commitment());
    }
}
