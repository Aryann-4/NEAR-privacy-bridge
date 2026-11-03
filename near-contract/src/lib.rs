use near_sdk::borsor;
use near_sdk::json_types::U128;
use near_sdk::env;
use near_sdk::near_bindgen;
use near_sdk::collections::LookupMap;
use near_sdk::Promise;

near_sdk::setup_alloc!();

const BRIDGE_SEED: &str = "near-bridge-v1";

// Commitment hash: hash(secret) - matching Midnight's memberId pattern
type CommitmentHash = [u8; 32];

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PartialEqEq, Eq)]
pub struct BridgeContract {
    /// Maps commitment hash -> (amount, sender, network origin)
    deposits: LookupMap<CommitmentHash, (U128, AccountId, String)>,
    /// Total locked amount per user
    user_deposits: LookupMap<AccountId, U128>,
    /// Track all commitment hashes
    all_deposits: LookupMap<u64, CommitmentHash>,
}

impl BridgeContract {
    
    /// Lock NEAR or tokens on NEAR, emit ZK-proof-friendly event
    #[init]
    pub fn new() -> Self {
        Self {
            deposits: LookupMap::new(b"d".to_string()),
            user_deposits: LookupMap::new(b"u".to_string()),
            all_deposits: LookupMap::new(b"a".to_string()),
        }
    }

    /// Lock assets on NEAR - creates commitment hash for ZK proof
    #[payable]
    pub fn deposit(&mut self, amount: U128) {
        let sender = env::signer_account_id();
        let deposit_amount = env::attached_deposit();
        
        // Generate commitment hash: hash(secret) pattern matching Midnight
        // In production, secret would be provided by user via view/action
        let mut commitment = [0u8; 32];
        rand::SeedableRng::from_seed(BRIDGE_SEED.as_bytes())
            .fill(&mut commitment);
        
        // Store deposit mapping
        self.deposits.insert(&commitment, &(amount, sender.clone(), "near".to_string()));
        self.user_deposits.insert(&sender, &user_deposits.get(&sender).unwrap_or(&U128(0)) + amount);
        self.all_deposits.insert(&env::block_timestamp(), &commitment);
        
        // Emit event for ZK proof generation
        env::log_str(&format!("DepositEvent:commitment={:?},amount={},sender={}", 
            hex::encode(commitment), amount, sender));
        
        // Return commitment hash for user to use in ZK proof
        near_sdk::ext(env::promise_utils()).log(hex::encode(commitment));
    }

    /// Reveal secret and unlock assets (called after ZK proof verification off-chain)
    #[message]
    pub fn withdraw(&mut self, commitment: CommitmentHash, secret: Vec<u8>) -> bool {
        let sender = env::signer_account_id();
        
        let deposit = self.deposits.get(&commitment);
        match deposit {
            Some((amount, deposited_sender, network)) => {
                // Verify sender matches (or use authority)
                assert!(deposited_sender == sender, "Not your deposit");
                
                // Remove deposit
                self.deposits.remove(&commitment);
                self.user_deposits.insert(&sender, &user_deposits.get(&sender).unwrap_or(&U128(0)) - amount);
                
                // Emit unlock event
                env::log_str(&format!("UnlockEvent:commitment={:?},amount={},sender={}", 
                    hex::encode(commitment), amount, sender));
                
                // Cross-call to Midnight to mint private token
                // (Would use cross-contract call in production)
                
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
    pub fn view_deposit(&self, commitment: [u8; 32]) -> Option<(U128, AccountId, String)> {
        self.get_deposit(commitment)
    }

    /// View only: get user's total deposited amount
    pub view_user_deposits(&self, account_id: AccountId) -> U128 {
        self.get_user_deposits(account_id)
    }
}