import { useState } from "react";
import { 
  ShieldCheck, Lock, Zap, CheckCircle, XCircle, 
  Loader2, Wallet, Eye, EyeOff, Copy, Sparkles
} from "lucide-react";

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountId, setAccountId] = useState("");
  
  const [amount, setAmount] = useState("");
  const [commitment, setCommitment] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  
  const [step, setStep] = useState("idle");
  const [txId, setTxId] = useState("");

  const connectWallet = () => {
    setWalletConnected(true);
    setAccountId(`user-${Math.random().toString(36).substring(2, 8)}.near.testnet`);
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setAccountId("");
    setStep("idle");
    setTxId("");
  };

  const generateCommitment = () => {
    if (!secret) return "";
    let hash = 0;
    for (let i = 0; i < secret.length; i++) {
      const char = secret.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, "0")}`;
  };

  const lockAssets = async () => {
    if (!amount || !commitment) return;
    setStep("locking");
    await new Promise(r => setTimeout(r, 2000));
    setTxId("near_" + Math.random().toString(36).substring(2, 15));
    setStep("locked");
  };

  const redeemAssets = async () => {
    if (!commitment) return;
    setStep("redeeming");
    await new Promise(r => setTimeout(r, 2000));
    setTxId("midnight_" + Math.random().toString(36).substring(2, 15));
    setStep("redeemed");
  };

  const resetStep = () => { setStep("idle"); setTxId(""); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-purple-600 rounded flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">NEAR<span className="text-amber-400">→Midnight</span></h1>
              <p className="text-xs text-slate-400">Privacy Bridge</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {walletConnected ? (
              <div className="flex items-center gap-2 bg-white/5 border border-slate-700 px-3 py-1.5 rounded-full">
                <span className="text-xs text-slate-300 truncate">{accountId}</span>
                <button onClick={disconnectWallet} className="text-slate-400 hover:text-red-400">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={connectWallet} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-24 pb-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-full text-sm font-medium text-amber-400 mb-6">
          <ShieldCheck className="w-4 h-4" />
          Zero-Knowledge Privacy Bridge
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
          Private Cross-Chain<span className="text-gradient text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400"> Transfers</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          Lock assets on NEAR, prove knowledge of your secret via ZK circuit, and mint private tokens on Midnight.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {walletConnected ? (
            <>
              <button onClick={lockAssets} disabled={step !== "idle" || !amount || !commitment} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl flex items-center gap-2">
                {step === "locking" ? (<Loader2 className="w-4 h-4 animate-spin" />) : (<Lock className="w-4 h-4" />)}
                Lock Assets
              </button>
              <button onClick={redeemAssets} disabled={step !== "idle" || !commitment} className="px-8 py-3 bg-white/5 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center gap-2">
                {step === "redeeming" ? (<Loader2 className="w-4 h-4 animate-spin" />) : (<Zap className="w-4 h-4" />)}
                Redeem Assets
              </button>
            </>
          ) : (
            <button onClick={connectWallet} className="px-8 py-3 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-slate-900 font-bold rounded-xl flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main Panels */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Lock Panel */}
          <section className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-amber-400">
              <Lock className="w-5 h-5" /> Lock on NEAR
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Amount (yoctoNEAR)</label>
                <input
                  type="number" min="0" step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000000000000000000000000"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  disabled={step !== "idle"}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Commitment Hash</label>
                <div className="relative">
                  <input
                    type="text"
                    value={commitment}
                    onChange={(e) => setCommitment(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm pr-12"
                    disabled={step !== "idle"}
                  />
                  <button
                    onClick={() => {
                      const gen = generateCommitment();
                      if (gen) setCommitment(gen);
                    }}
                    className="absolute right-2 top-2 text-xs font-bold text-amber-400 hover:text-amber-300 bg-slate-800 px-2 py-1 rounded border border-amber-500/30"
                  >
                    Generate
                  </button>
                </div>
              </div>
              {step === "locked" && (
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium text-green-300">Locked! TX: {txId}</span>
                  </div>
                </div>
              )}
              {step === "error" && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                  <span className="text-sm text-red-300">Transaction failed</span>
                </div>
              )}
            </div>
          </section>

          {/* Redeem Panel */}
          <section className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-purple-400">
              <Zap className="w-5 h-5" /> Redeem on Midnight
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Commitment Hash</label>
                <input
                  type="text"
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  disabled={step !== "idle"}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Secret (Private Witness)</label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter secret"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm pr-12"
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    {showSecret ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              {step === "redeemed" && (
                <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">Redeemed! TX: {txId}</span>
                  </div>
                </div>
              )}
              {step === "error" && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                  <span className="text-sm text-red-300">Verification failed</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Privacy Info */}
      <section className="py-12 px-4 border-t border-slate-700/50 bg-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-4">Privacy Model</h3>
          <div className="flex justify-center gap-8 text-sm">
            <div>
              <div className="text-slate-400 text-xs mb-1">Public on-chain</div>
              <div className="text-slate-300">Commitment hash · Amount · ZK proof validity</div>
            </div>
            <div className="w-px h-8 bg-slate-700 mx-2"></div>
            <div>
              <div className="text-slate-400 text-xs mb-1">Private witness</div>
              <div className="text-slate-300">Secret · Wallet address · Sender identity</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;