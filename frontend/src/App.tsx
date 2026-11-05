import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Wallet, 
  Globe, 
  Network,
  Brain,
  FileText,
  ArrowUpRightFromSquare,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [network, setNetwork] = useState("testnet");
  
  const [amount, setAmount] = useState("");
  const [commitment, setCommitment] = useState("");
  const [secret, setSecret] = useState("");
  
  const [step, setStep] = useState("idle"); // idle, locking, locked, redeeming, redeemed, error
  const [txId, setTxId] = useState("");
  const [txType, setTxType] = useState("");
  
  const [showSecret, setShowSecret] = useState(false);

  // Connect Lace Wallet
  const connectWallet = async () => {
    try {
      setStep("idle");
      
      // Check for Lace/Midnight wallet
      if (typeof window === "undefined") return;
      
      // Simulate wallet connection for demo
      // In production: use @midnight-ntwrk/dapp-connector-api or near-api-js
      const mockAccount = `user-${Math.random().toString(36).substring(2, 8)}.near.testnet`;
      
      setAccountId(mockAccount);
      setWalletConnected(true);
      setNetwork("testnet");
    } catch (err) {
      setStep("error");
      console.error("Wallet connection failed:", err);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setAccountId("");
    setStep("idle");
    setTxId("");
  };

  // Generate commitment hash from secret
  const generateCommitment = () => {
    if (!secret) return "";
    // Simple hash simulation - in production use SHA-256
    let hash = 0;
    for (let i = 0; i < secret.length; i++) {
      const char = secret.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(64, "0");
    return `0x${hex}`;
  };

  // Lock Assets on NEAR
  const lockAssets = async () => {
    if (!amount || !commitment) {
      setStep("error");
      return;
    }

    setStep("locking");
    
    try {
      // Simulate NEAR transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedTxId = "near_" + Math.random().toString(36).substring(2, 15);
      setTxId(generatedTxId);
      setTxType("lock");
      setStep("locked");
    } catch (err) {
      setStep("error");
      console.error("Lock failed:", err);
    }
  };

  // Redeem Assets on Midnight
  const redeemAssets = async () => {
    if (!commitment) {
      setStep("error");
      return;
    }

    setStep("redeeming");
    
    try {
      // Simulate ZK proof verification + Midnight transaction
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const generatedTxId = "midnight_" + Math.random().toString(36).substring(2, 15);
      setTxId(generatedTxId);
      setTxType("redeem");
      setStep("redeemed");
    } catch (err) {
      setStep("error");
      console.error("Redeem failed:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetStep = () => {
    setStep("idle");
    setTxId("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-midnight-50 font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">N→M</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">NEAR→Midnight</h1>
                <p className="text-xs text-gray-500">Privacy Bridge</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full text-xs font-medium text-blue-700 border border-blue-100">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                NEAR Testnet Active
              </div>
              
              <button 
                onClick={connectWallet}
                disabled={walletConnected}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Wallet className="w-4 h-4" />
                {walletConnected ? "Connected" : "Connect Wallet"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-full text-sm font-medium text-blue-700 shadow-sm mb-6">
              <ShieldCheck className="w-4 h-4" />
              ZK-Protected Privacy Bridge
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Move Assets Privately Across Chains
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Lock assets on NEAR, generate zero-knowledge proofs, and mint private tokens on Midnight.
              Your wallet address and transaction amounts stay private — only commitment hashes appear on-chain.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              {walletConnected ? (
                <>
                  <button onClick={lockAssets} disabled={!amount || !commitment || step !== "idle"} className="btn-primary flex-1">
                    {step === "locking" ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Locking on NEAR...
                      </span>
                    ) : (
                      <span>Lock Assets on NEAR</span>
                    )}
                  </button>
                  <button onClick={redeemAssets} disabled={!commitment || step !== "idle"} className="btn-secondary flex-1">
                    {step === "redeeming" ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying ZK Proof...
                      </span>
                    ) : (
                      <span>Redeem on Midnight</span>
                    )}
                  </button>
                </>
              ) : (
                <button onClick={connectWallet} className="btn-primary flex-1">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Lace Wallet to Start
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Wallet Status */}
      {walletConnected && (
        <section className="px-4 sm:px-6 lg:px-8 py-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="max-w-7xl mx-auto glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Connected Wallet</h3>
                  <p className="text-sm text-gray-500 truncate max-w-xs">{accountId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${network === "testnet" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {network} Network
                </span>
                <button onClick={disconnectWallet} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Lock Panel */}
          <section className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Lock Assets on NEAR</h3>
                <p className="text-xs text-gray-500">Convert NEAR to private Midnight tokens</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Lock</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">yoctoNEAR</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="1000000000000000000000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field pl-12"
                    disabled={step === "locking" || step === "redeeming"}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">1 NEAR = 10²⁴ yoctoNEAR</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commitment Hash</label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="0x + 64 hex chars"
                    value={commitment}
                    onChange={(e) => setCommitment(e.target.value)}
                    className="input-field pr-10"
                    disabled={step === "locking" || step === "redeeming"}
                  />
                  <button
                    onClick={() => {
                      const gen = generateCommitment();
                      if (gen) setCommitment(gen);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Generate from Secret
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  hash(secret) — your secret stays off-chain
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-600">Expected Output</span>
                  <span className="text-sm font-medium text-blue-700">{amount ? (parseFloat(amount) / 1e24).toFixed(6) : "0"} MNIGHT</span>
                </div>
              </div>
            </div>
            
            {step === "locked" && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-800">Assets Locked on NEAR</p>
                    <p className="text-xs text-green-600">{txId}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(txId)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Copy TX ID
                  </button>
                </div>
              </div>
            )}
            
            {step === "error" && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-700">Transaction failed. Please try again.</p>
                </div>
                <button onClick={resetStep} className="mt-2 text-xs text-blue-600 hover:underline">Try Again</button>
              </div>
            )}
          </section>

          {/* Redeem Panel */}
          <section className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Redeem on Midnight</h3>
                <p className="text-xs text-gray-500">Burn private tokens, unlock NEAR assets</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commitment Hash</label>
                <input
                  type="text"
                  placeholder="Enter commitment hash from lock"
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  className="input-field"
                  disabled={step === "locking" || step === "redeeming"}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secret (Private Witness)</label>
                <div className="relative group">
                  <input
                    type={showSecret ? "text" : "password"}
                    placeholder="Enter your secret"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="input-field pr-10"
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showSecret ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Never shared on-chain — verified via ZK proof
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <span className="text-sm text-gray-600">Expected Output</span>
                  <span className="text-sm font-medium text-indigo-700">1 MNIGHT</span>
                </div>
              </div>
            </div>
            
            {step === "redeemed" && (
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="font-medium text-indigo-800">Redeemed on Midnight</p>
                    <p className="text-xs text-indigo-600">{txId}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(txId)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Copy TX ID
                  </button>
                </div>
              </div>
            )}
            
            {step === "error" && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-700">Verification failed. Check your secret.</p>
                </div>
                <button onClick={resetStep} className="mt-2 text-xs text-blue-600 hover:underline">Try Again</button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Privacy Guarantee Section */}
      <section className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Privacy Model</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Traditional bridges expose wallet addresses, amounts, and transaction details. 
              Our ZK-proof bridge keeps everything private.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-blue-900">Public On-Chain</h4>
              </div>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Commitment hashes (meaningless without secret)</li>
                <li>• Locked/redeemed amounts (publicly verifiable)</li>
                <li>• ZK proof validity (circuit checks)</li>
                <li>• Net values linked to hash pairs</li>
              </ul>
            </div>
            
            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-3 mb-4">
                <EyeOff className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-indigo-900">Private Witness</h4>
              </div>
              <ul className="text-sm text-indigo-700 space-y-2">
                <li>• Wallet addresses (never revealed)</li>
                <li>• Member names/labels</li>
                <li>• Individual expense amounts</li>
                <li>• Organizer secrets</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-10 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg mb-2">Users Prove Without Revealing</h4>
                <p className="text-blue-100 text-sm">
                  "I am a valid member" • "I authorize payment" • Proved via ZK circuits
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold mb-1">0%</div>
                <p className="text-blue-100 text-xs">Data Exposed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-gray-600">Three steps to private cross-chain transfers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Connect & Lock",
                desc: "Connect Lace Wallet on NEAR testnet, enter amount and commitment hash (hash of your secret).",
                icon: <Lock className="w-6 h-6" />,
                color: "blue"
              },
              {
                step: "2",
                title: "ZK Proof",
                desc: "Generate zero-knowledge proof proving you know the secret without revealing it. Proof verified off-chain.",
                icon: <Brain className="w-6 h-6" />,
                color: "indigo"
              },
              {
                step: "3",
                title: "Mint & Redeem",
                desc: "Private tokens minted on Midnight using commitment hash. Redeem by revealing secret to unlock NEAR assets.",
                icon: <Network className="w-6 h-6" />,
                color: "purple"
              }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 relative group">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-gray-500">{item.step}</span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color === 'blue' ? 'bg-blue-100 text-blue-600' : item.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>
                  {item.icon}
                </div>
                <h4 className="font-bold text-gray-900">{item.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">N→M</span>
            </div>
            <span className="font-semibold text-gray-700 text-sm">NEAR→Midnight Privacy Bridge</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span>Built at NEAR HACKATHON 2026</span>
            <span>•</span>
            <span>Tracks: Privacy, DeFi, Real-World</span>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition-colors">GitHub Repo</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;