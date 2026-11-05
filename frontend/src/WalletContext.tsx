import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const WalletContext = createContext<any>(null);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedAccountId = localStorage.getItem("near-account-id");
    if (storedAccountId) {
      setAccount(storedAccountId);
    }
  }, []);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const accountId = `user-${Math.random().toString(36).substring(2, 8)}.testnet`;
      setAccount(accountId);
      localStorage.setItem("near-account-id", accountId);
    } catch (e) {
      console.error("signIn failed", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setAccount("");
    localStorage.removeItem("near-account-id");
  }, []);

  return (
    <WalletContext.Provider value={{ account, isLoading, signIn, signOut, isSignedIn: !!account }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
