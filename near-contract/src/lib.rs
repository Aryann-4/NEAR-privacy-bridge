use near_sdk::borsh;
use near_sdk::json_types::U128;
use near_sdk::env;
use near_sdk::near_bindgen;
use near_sdk::collections::LookupMap;
use near_sdk::Promise;
use near_sdk::serde::{Serialize, Deserialize};

near_sdk::setup_alloc!();

// Commitment hash: hash(secret) - matching Midnight's memberId pattern
type CommitmentHash = [u8; 32];

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PartialEq, Eq)]
pub struct BridgeContract {
    /// Maps commitment hash -> (amount, sender, network origin)
    deposits: LookupMap<CommitmentHash, (U128, AccountId, String)>,
    /// Total locked amount per user
    user_deposits: LookupMap<AccountId, U128>,
    /// Track all commitment hashes
    all_deposits: LookupMap<u64, CommitmentHash>,
}

impl BridgeContract {

    /// Init contract
    #[init]
    pub fn new() -> Self {
        Self {
            deposits: LookupMap::new(b"d".to_string()),
            user_deposits: LookupMap::new(b"u".to_string()),
            all_deposits: LookupMap::new(b"a".to_string()),
        }
    }

    /// Lock assets on NEAR - creates commitment hash for ZK proof
    /// 
    /// User provides the commitment (hash of their secret) via the commitment parameter.
    /// In a full implementation, the frontend would generate this using a ZK circuit.
    #[payable]
    pub fn deposit(&mut self, amount: U128, commitment: CommitmentHash) {
        let sender = env::signer_account_id();
        
        // Verify commitment is not a zero hash (basic sanity check)
        assert!(
            commitment != [0u8; 32],
            "Commitment cannot be zero hash"
        );
        
        // Verify commitment is not already used (double-spend protection)
        assert!(
            !self.deposits.contains_key(&commitment),
            "Commitment already locked - double spend"
        );
        
        // Store deposit mapping
        self.deposits.insert(&commitment, &(amount, sender.clone(), "near".to_string()));
        self.user_deposits.insert(&sender, &user_deposits.get(&sender).unwrap_or(&U128(0)) + amount);
        self.all_deposits.insert(&env::block_timestamp(), &commitment);
        
        // Emit event for ZK proof generation
        // Format: DepositEvent:commitment_hex,amount,sender
        // Observers see commitment hash (meaningless without the secret)
        let commitment_hex = format!("{:064x}", commitment[0..8]); // first 8 bytes hex
        env::log_str(&format!(
            "DepositEvent:commitment={},amount={},sender={}",
            commitment_hex, amount, sender
        ));
    }

    /// Reveal secret and unlock assets (called after ZK proof verification off-chain)
    /// 
    /// After off-chain ZK proof verification confirms the caller knows the secret
    /// that hashes to the commitment, they can call withdraw to redeem assets.
    #[message]
    pub fn withdraw(&mut self, commitment: CommitmentHash, secret: Vec<u8>) -> bool {
        let sender = env::signer_account_id();
        
        let deposit = self.deposits.get(&commitment);
        match deposit {
            Some((amount, deposited_sender, network)) => {
                // Verify sender matches (only the original depositor can redeem)
                assert!(
                    deposited_sender == sender,
                    "Not your deposit - only original sender can redeem"
                );
                
                // Remove deposit from storage
                self.deposits.remove(&commitment);
                self.user_deposits.insert(&sender, &user_deposits.get(&sender).unwrap_or(&U128(0)) - amount);
                
                // Emit unlock event for ZK proof observers
                let commitment_hex = format!("{:064x}", commitment[0..8]);
                env::log_str(&format!(
                    "UnlockEvent:commitment={},amount={},sender={}",
                    commitment_hex, amount, sender
                ));
                
                // In production: off-chain ZK proof verified, then:
                // - Cross-call to Midnight contract to mint private tokens
                // - Or release original NEAR assets to user
                
                true
            }
            None => {
                env::log_str("DepositNotFound");
                false
            }
        }
    }

    /// Get deposit info (for view)
    pub fn get_deposit(&self, commitment: CommitmentHash) -> Option<(U128, AccountId, String)> {
        self.deposits.get(&commitment)
    }

    /// Get all user deposits
    pub fn get_user_deposits(&self, account_id: AccountId) -> U128 {
        user_deposits.get(&account_id).unwrap_or(&U128(0))
    }
}

#[near_bindgen]
impl BridgeContract {
    /// View only: get deposit details
    pub fn view_deposit(&self, commitment: CommitmentHash) -> Option<(U128, AccountId, String)> {
        self.get_deposit(commitment)
    }

    /// View only: get user's total deposited amount
    pub fn view_user_deposits(&self, account_id: AccountId) -> U128 {
        self.get_user_deposits(account_id)
    }
}