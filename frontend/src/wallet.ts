import { useEffect, useState } from "react";
import { 
  createDappConnector,
  DappConnector,
  Networks,
  useWindowSize
} from "@midnight-ntwrk/dapp-connector-api";

// NEAR network configuration
const NEAR_NETWORK = "mainnet"; // or "testnet" for hackathon

// Initialize DApp connector
const dappConnector = createDappConnector({
  network: NEAR_NETWORK === "mainnet" 
    ? Networks.Mainnet 
    : Networks.Testnet,
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