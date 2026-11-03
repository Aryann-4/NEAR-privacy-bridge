// NEAR contract configuration
const NEAR_CONTRACT_ID = import.meta.env.VITE_NEAR_CONTRACT_ID || "your-near-account.testnet";

// Bridge service with simulated responses for hackathon demo
export const bridgeContract = {
  deposit: async (amount: number, commitmentHex: number) => {
    // Simulate NEAR transaction call
    console.log("Locking on NEAR:", { amount, commitment: commitmentHex });
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      success: true,
      txId: Math.random().toString(36).substring(2, 18),
      amount,
      commitment: commitmentHex,
    };
  },
  
  withdraw: async (secret: string, commitmentHex: number) => {
    console.log("Withdrawing from Midnight:", { secret: secret.substring(0, 16) + "...", commitment: commitmentHex });
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      amount: 1000000,
      txId: Math.random().toString(36).substring(2, 18),
    };
  },
};