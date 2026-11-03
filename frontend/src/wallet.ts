import { createDappConnector } from "@midnight-ntwrk/dapp-connector-api";

// NEAR network configuration (for wallet UI display only)
const NEAR_NETWORK = "mainnet";

// Initialize DApp connector
const dappConnector = createDappConnector({
  network: NEAR_NETWORK === "mainnet"
    ? "mainnet"
    : "testnet",
});

// Connect wallet (Lace)
export const connectWallet = async () => {
  try {
    await dappConnector.request({
      method: "login",
    });
    return true;
  } catch (error) {
    console.error("Wallet connection failed:", error);
    throw error;
  }
};

// Disconnect wallet
export const disconnectWallet = async () => {
  try {
    await dappConnector.request({
      method: "logout",
    });
    return true;
  } catch (error) {
    console.error("Wallet disconnection failed:", error);
    throw error;
  }
};

// Get current account ID
export const getAccountId = (): string | null => {
  try {
    const account = dappConnector.getAccount();
    return account?.accountId ?? null;
  } catch (error) {
    console.error("Failed to get account:", error);
    return null;
  }
};

// Check if wallet is connected
export const isWalletConnected = (): boolean => {
  try {
    return !!dappConnector.getAccount();
  } catch (error) {
    return false;
  }
};

export default dappConnector;