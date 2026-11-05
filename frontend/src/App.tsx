import { useState, useEffect, useRef } from "react";
import { 
  ShieldCheck, Lock, Zap, CheckCircle, XCircle, 
  Loader2, Wallet, Eye, EyeOff, Copy, Sparkles, 
  Monitor, Shield, Globe, Activity, ChevronDown, LogOut
} from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

function App() {
  const [showOverview, setShowOverview] = useState(true);
  const [showBridge, setShowBridge] = useState(false);
  
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [walletOpen, setWalletOpen] = useState(false);
  
  const [amount, setAmount] = useState("");
  const [commitment, setCommitment] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  
  const [step, setStep] = useState("idle");
  const [txId, setTxId] = useState("");
  const [txType, setTxType] = useState("");

  const [recentTxs, setRecentTxs] = useState<Array<{type: string; amount: string; time: string; status: string}>>([]);

  const [particles, setParticles] = useState([] as Particle[]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const connectWallet = () => {
    setWalletConnected(true);
    setAccountId(`user-${Math.random().toString(36).substring(2, 8)}.near.testnet`);
    setWalletOpen(false);
    setRecentTxs([
      { type: "Lock", amount: "5.0 NEAR", time: "2m ago", status: "Confirmed" },
      { type: "Redeem", amount: "3.2 MNIGHT", time: "15m ago", status: "Confirmed" },
      { type: "Lock", amount: "1.5 NEAR", time: "1h ago", status: "Confirmed" },
    ]);
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setAccountId("");
    setStep("idle");
    setTxId("");
    setShowOverview(true);
    setShowBridge(false);
    setWalletOpen(false);
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
    await new Promise(r => setTimeout(r, 2500));
    setTxId("near_" + Math.random().toString(36).substring(2, 15));
    setTxType("lock");
    setStep("locked");
    setShowOverview(false);
    setShowBridge(false);
    setRecentTxs(prev => [
      { type: "Lock", amount: `${amount} yoctoNEAR`, time: "Just now", status: "Confirmed" },
      ...prev.slice(0, 4)
    ]);
  };

  const redeemAssets = async () => {
    if (!commitment) return;
    setStep("redeeming");
    await new Promise(r => setTimeout(r, 3000));
    setTxId("midnight_" + Math.random().toString(36).substring(2, 15));
    setTxType("redeem");
    setStep("redeemed");
    setShowOverview(false);
    setShowBridge(false);
    setRecentTxs(prev => [
      { type: "Redeem", amount: "1 MNIGHT", time: "Just now", status: "Confirmed" },
      ...prev.slice(0, 4)
    ]);
  };

  const resetStep = () => { setStep("idle"); setTxId(""); };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width, height;
    let pArr: Particle[] = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    function initParticles() {
      pArr = [];
      const count = Math.min(width / 15, 60);
      for (let i = 0; i < count; i++) {
        pArr.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 1,
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      pArr.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        
        pArr.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(245, 158, 11, ${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${0.4})`;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    animate();

    window.addEventListener('resize', resize);
    window.addEventListener('resize', initParticles);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', initParticles);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-900">
      <div className="bg-mesh fixed inset-0 z-[-3] pointer-events-none"></div>
      <div className="mesh-blob blob-1"></div>
      <div className="mesh-blob blob-2"></div>
      <div className="mesh-blob blob-3"></div>
      <div className="grid-dots fixed inset-0 z-[-3] pointer-events-none"></div>
      <canvas ref={canvasRef} className="fixed inset-0 z-[-2] pointer-events-none" style={{ opacity: 0.4 }} />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/70 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-none">NEAR<span className="text-amber-400">→Midnight</span></h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Privacy Bridge</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setShowOverview(true); setShowBridge(false); }}
                className={`text-sm font-medium transition-colors ${showOverview ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`}
              >
                Overview
              </button>
              <button
                onClick={() => { setShowBridge(true); setShowOverview(false); }}
                className={`text-sm font-medium transition-colors ${showBridge ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}`}
              >
                Bridge
              </button>
              <a href="#" className="text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors">Docs</a>
              <a href="#" className="text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors">Github</a>
            </div>
          </div>

          <div className="relative group">
            {walletConnected ? (
              <button
                onClick={() => setWalletOpen(!walletOpen)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300 truncate max-w-[150px]">{accountId}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500 transition-transform duration-200" style={{ transform: walletOpen ? 'rotate(180deg)' : '' }} />
                </div>
              </button>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary px-4 py-2 text-sm"
              >
                <Wallet className="w-3.5 h-3.5 mr-1.5" />
                Connect Wallet
              </button>
            )}
            {walletOpen && walletConnected && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl z-50 animate-fade-in-up">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-purple-600 rounded-xl flex items-center justify-center text-slate-900 shadow-lg">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-100 truncate">{accountId}</p>
                      <p className="text-xs text-slate-500 font-mono truncate">{accountId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/20 rounded-full text-xs font-medium text-green-400 border border-green-500/30 mb-4 animate-pulse-glow">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    NEAR Testnet
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="w-full py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showOverview && (
        <>
          <header className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 z-10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-full text-sm font-medium text-amber-400 shadow-sm animate-fade-in">
                  <Sparkles className="w-4 h-4" />
                  Zero-Knowledge Privacy Bridge
                </div>
                <h2 className="mt-6 text-5xl md:text-7xl font-extrabold text-slate-100 mb-6 tracking-tight animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  Move Assets<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400"> Privately</span><br/>
                  Across Chains
                </h2>
                <p className="mt-4 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  Lock assets on NEAR, generate zero-knowledge proofs, and mint private tokens on Midnight. 
                  Your wallet address and transaction amounts stay private — only commitment hashes appear on-chain.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                  {walletConnected ? (
                    <button onClick={() => setShowBridge(true)} className="btn-primary flex-1 px-8 py-4 flex items-center justify-center gap-2">
                      <Activity className="w-5 h-5" />
                      Bridge Assets
                    </button>
                  ) : (
                    <button onClick={connectWallet} className="btn-primary flex-1 px-8 py-4 flex items-center justify-center gap-2">
                      <Wallet className="w-5 h-5 mr-2" />
                      Connect Wallet to Start
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          <section className="px-4 sm:px-6 lg:px-8 py-12 z-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
                <div className="info-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Assets Bridged</p>
                      <p className="text-2xl font-bold text-slate-100">$2.4M+</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                      <Globe className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="info-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Active Users</p>
                      <p className="text-2xl font-bold text-slate-100">1,247</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                      <Monitor className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="info-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Privacy Protected</p>
                      <p className="text-2xl font-bold text-slate-100">99.8%</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                      <Shield className="w-5 h-5 text-slate-900" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-slate-700/50 bg-slate-900/60 backdrop-blur-md py-20 px-4 sm:px-6 lg:px-8 z-10 relative">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 animate-fade-in-up">
                <h3 className="text-3xl font-extrabold text-slate-100 mb-6 tracking-tight">Privacy First</h3>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  Traditional bridges expose wallet addresses and amounts. Our ZK-proof architecture keeps everything confidential.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up stagger-1">
                <div className="info-card animate-fade-in-up stagger-2">
                  <div className="flex items-center gap-3 mb-5">
                    <Eye className="w-6 h-6 text-amber-400" />
                    <h4 className="font-bold text-xl text-slate-100">Public On-Chain</h4>
                  </div>
                  <ul className="text-sm text-slate-300 space-y-3 leading-relaxed">
                    <li className="flex items-start gap-2"><span className="text-amber-400">▸</span> Commitment hashes only</li>
                    <li className="flex items-start gap-2"><span className="text-amber-400">▸</span> Publicly verifiable amounts</li>
                    <li className="flex items-start gap-2"><span className="text-amber-400">▸</span> ZK proof validity checks</li>
                  </ul>
                </div>
                <div className="info-card animate-fade-in-up stagger-3">
                  <div className="flex items-center gap-3 mb-5">
                    <EyeOff className="w-6 h-6 text-purple-400" />
                    <h4 className="font-bold text-xl text-slate-100">Private Witness</h4>
                  </div>
                  <ul className="text-sm text-slate-300 space-y-3 leading-relaxed">
                    <li className="flex items-start gap-2"><span className="text-purple-400">▸</span> Wallet addresses never revealed</li>
                    <li className="flex items-start gap-2"><span className="text-purple-400">▸</span> Individual amounts concealed</li>
                    <li className="flex items-start gap-2"><span className="text-purple-400">▸</span> Organizer secrets protected</li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 p-8 bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 rounded-3xl text-white shadow-2xl shadow-amber-500/25 relative overflow-hidden animate-fade-in-up">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h4 className="font-bold text-xl mb-2">Users Prove Without Revealing</h4>
                    <p className="text-amber-100 text-sm opacity-90 max-w-md">
                      "I am a valid member" • "I authorize payment" • Verified via ZK circuits without exposing secrets
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold mb-1">0%</div>
                      <p className="text-xs text-amber-200 font-medium tracking-wider uppercase">Data Exposed</p>
                    </div>
                    <div className="w-1 h-20 bg-white/20 rounded mx-2"></div>
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold mb-1">100%</div>
                      <p className="text-xs text-purple-200 font-medium tracking-wider uppercase">Privacy Preserved</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {showBridge && (
        <>
          <header className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 z-10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-slate-100 mb-4">Bridge Assets</h2>
                <p className="text-slate-400 max-w-lg mx-auto">Lock assets on NEAR, redeem privately on Midnight</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="glass-card p-8 relative overflow-hidden">
                  <div className="relative z-10 flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-100 leading-none">Lock Assets on NEAR</h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Convert NEAR → Private Midnight Tokens</p>
                    </div>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Amount to Lock</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">yoctoNEAR</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="1000000000000000000000000"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="input-field w-full pl-10 pr-4 py-3.5 text-right"
                          disabled={step === "locking" || step === "redeeming"}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Commitment Hash</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="0x + 64 hex characters"
                          value={commitment}
                          onChange={(e) => setCommitment(e.target.value)}
                          className="input-field w-full pr-10"
                          disabled={step === "locking" || step === "redeeming"}
                        />
                        <button
                          onClick={() => {
                            const gen = generateCommitment();
                            if (gen) setCommitment(gen);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 hover:text-amber-300 bg-slate-800/50 px-2 py-1 rounded border border-amber-500/30"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                    <button onClick={lockAssets} disabled={!amount || !commitment || step !== "idle"} className="w-full py-4 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-slate-900 font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                      {step === "locking" ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Locking...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Lock className="w-5 h-5" />
                          Lock Assets
                        </span>
                      )}
                    </button>
                  </div>
                </section>

                <section className="glass-card p-8 relative overflow-hidden">
                  <div className="relative z-10 flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-100 leading-none">Redeem on Midnight</h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Burn Private Tokens → Unlock NEAR Assets</p>
                    </div>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Commitment Hash</label>
                      <input
                        type="text"
                        placeholder="Enter commitment hash from lock"
                        value={commitment}
                        onChange={(e) => setCommitment(e.target.value)}
                        className="input-field w-full"
                        disabled={step === "locking" || step === "redeeming"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Secret (Private Witness)</label>
                      <div className="relative">
                        <input
                          type={showSecret ? "text" : "password"}
                          placeholder="Enter your secret value"
                          value={secret}
                          onChange={(e) => setSecret(e.target.value)}
                          className="input-field w-full pr-10"
                        />
                        <button
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showSecret ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    <button onClick={redeemAssets} disabled={!commitment || step !== "idle"} className="w-full py-4 bg-white/5 border border-slate-700 hover:bg-slate-700/50 text-slate-300 font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                      {step === "redeeming" ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Zap className="w-5 h-5" />
                          Redeem Assets
                        </span>
                      )}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </header>

          {walletConnected && (
            <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-16 z-10 animate-fade-in-up">
              <div className="max-w-7xl mx-auto glass-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/30">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-slate-100 leading-none">Connected Wallet</h3>
                      <p className="text-xs text-slate-500 truncate font-mono">{accountId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-green-900/20 text-green-400 border-green-500/30 animate-pulse-glow">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                      NEAR Testnet
                    </span>
                    <button onClick={disconnectWallet} className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <footer className="border-t border-slate-700/50 bg-slate-900/60 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-slate-900 text-[11px] font-bold">N→M</span>
            </div>
            <div>
              <span className="font-bold text-slate-100 text-sm">NEAR→Midnight</span>
              <span className="text-xs text-slate-500 block">Privacy Bridge</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
            <span>Built at <span className="text-amber-400 font-bold">NEAR HACKATHON 2026</span></span>
            <span className="h-4 w-px bg-slate-700 mx-1"></span>
            <span>Tracks: Privacy • DeFi • Real-World</span>
            <span className="h-4 w-px bg-slate-700 mx-1"></span>
            <a href="#" className="text-slate-400 hover:text-amber-400 transition-colors underline underline-offset-4">GitHub Repo</a>
          </div>
        </div>
      </footer>

      {(step === "locked" || step === "redeemed") && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-slate-800 border border-green-500/30 text-green-400 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-bold text-sm text-slate-100">Transaction Complete</p>
              <p className="text-xs text-green-500">{txType === "lock" ? "Assets locked on NEAR" : "Redeemed on Midnight"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;