import { Loader2 } from "lucide-react";
import { useWallet } from "./WalletContext";
import Background from "./components/Background";
import Dashboard from "./components/Dashboard";
import Landing from "./components/Landing";
import Logo from "./components/Logo";

function Splash() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <Background />
      <div className="flex animate-fade-up flex-col items-center gap-6">
        <Logo />
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
          Restoring your session…
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const {
    accountId,
    balance,
    loading,
    connecting,
    error,
    signIn,
    signOut,
    clearError,
  } = useWallet();

  if (loading) return <Splash />;

  return (
    <>
      <Background />
      {accountId ? (
        <Dashboard accountId={accountId} balance={balance} onSignOut={signOut} />
      ) : (
        <Landing
          onConnect={signIn}
          connecting={connecting}
          error={error}
          onClearError={clearError}
        />
      )}
    </>
  );
}
