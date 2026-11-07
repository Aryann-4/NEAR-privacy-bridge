import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NearConnector, type EventMap, type NearWalletBase } from "@hot-labs/near-connect";
import { FailoverRpcProvider, JsonRpcProvider } from "near-api-js";

export const NETWORK = "testnet" as const;

type WalletContextValue = {
  accountId: string;
  wallet: NearWalletBase | null;
  balance: string | null;
  loading: boolean;
  connecting: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const RPC_URLS = ["https://rpc.testnet.near.org", "https://test.rpc.fastnear.com"];

function formatNear(yocto: string): string {
  try {
    const value = BigInt(yocto);
    const base = 10n ** 24n;
    const whole = value / base;
    const fraction = (value % base).toString().padStart(24, "0").slice(0, 4).replace(/0+$/, "");
    return fraction ? `${whole}.${fraction}` : whole.toString();
  } catch {
    return "0";
  }
}

function isCancel(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /cancel|closed|reject|denied|dismiss/i.test(message);
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const connector = useMemo(
    () =>
      new NearConnector({
        network: NETWORK,
        footerBranding: null,
      }),
    []
  );

  const provider = useMemo(
    () =>
      new FailoverRpcProvider(
        RPC_URLS.map((url) => new JsonRpcProvider({ url }))
      ),
    []
  );

  const [accountId, setAccountId] = useState("");
  const [wallet, setWallet] = useState<NearWalletBase | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const onSignIn = (payload: EventMap["wallet:signIn"]) => {
      if (cancelled) return;
      setWallet(payload.wallet);
      setAccountId(payload.accounts[0]?.accountId ?? "");
      setError(null);
    };

    const onSignOut = () => {
      if (cancelled) return;
      setWallet(null);
      setAccountId("");
      setBalance(null);
    };

    connector.on("wallet:signIn", onSignIn);
    connector.on("wallet:signOut", onSignOut);

    const restore = async () => {
      try {
        const connected = await connector.getConnectedWallet();
        if (!cancelled && connected) {
          setWallet(connected.wallet);
          setAccountId(connected.accounts[0]?.accountId ?? "");
        }
      } catch {
        // No restorable session — stay logged out.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void restore();

    return () => {
      cancelled = true;
      connector.off("wallet:signIn", onSignIn);
      connector.off("wallet:signOut", onSignOut);
    };
  }, [connector]);

  const refreshBalance = useCallback(async () => {
    if (!accountId) {
      setBalance(null);
      return;
    }

    try {
      const account = await provider.viewAccount({ accountId });
      setBalance(formatNear(account.amount));
    } catch {
      setBalance(null);
    }
  }, [accountId, provider]);

  useEffect(() => {
    let cancelled = false;

    if (!accountId) {
      setBalance(null);
      return;
    }

    const load = async () => {
      try {
        const account = await provider.viewAccount({ accountId });
        if (!cancelled) setBalance(formatNear(account.amount));
      } catch {
        if (!cancelled) setBalance(null);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [accountId, provider]);

  const signIn = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const connected = await connector.connect();
      const accounts = await connected.getAccounts();
      setWallet(connected);
      setAccountId(accounts[0]?.accountId ?? "");
    } catch (cause) {
      if (!isCancel(cause)) {
        setError("Wallet connection failed. Please try again.");
        console.error("NEAR Connect sign-in failed:", cause);
      }
    } finally {
      setConnecting(false);
    }
  }, [connector]);

  const signOut = useCallback(async () => {
    try {
      if (wallet) await connector.disconnect(wallet);
    } catch (cause) {
      console.error("NEAR Connect sign-out failed:", cause);
    } finally {
      setWallet(null);
      setAccountId("");
      setBalance(null);
      setError(null);
    }
  }, [connector, wallet]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      accountId,
      wallet,
      balance,
      loading,
      connecting,
      error,
      signIn,
      signOut,
      refreshBalance,
      clearError,
    }),
    [
      accountId,
      wallet,
      balance,
      loading,
      connecting,
      error,
      signIn,
      signOut,
      refreshBalance,
      clearError,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside a WalletProvider");
  }
  return context;
}
