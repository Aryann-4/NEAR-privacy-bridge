import { useState, useEffect, useRef } from "react";
import { 
  ShieldCheck, ShieldAlert, Lock, ArrowRight, Zap, CheckCircle, XCircle, 
  Loader2, Wallet, Eye, EyeOff, Copy, Sparkles, Brain, Network, 
  Monitor, Code, Clock, User, Check, Info, Settings, BarChart3, 
  TrendingUp, Activity, Shield, Globe, Save, Key, Wifi, 
  Layout, Database, Users
} from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

function App() {
  // Mode states
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showOverview, setShowOverview] = useState(true);

  // Wallet state
  const [walletConnected, setWalletConnected] = useState(false);
  const [accountId, setAccountId] = useState("");
  
  // Bridge state
  const [amount, setAmount] = useState("");
  const [commitment, setCommitment] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  
  const [step, setStep] = useState("idle");
  const [txId, setTxId] = useState("");
  const [txType, setTxType] = useState("");

  // Advanced mode settings
  const [gasLimit, setGasLimit] = useState("300000000000000");
  const [circuitType, setCircuitType] = useState("standard");
  const [slippage, setSlippage] = useState("0.5");
  const [autoRedeem, setAutoRedeem] = useState(false);
  const [customSecret, setCustomSecret] = useState("");

  // Overview stats
  const [totalLocked, setTotalLocked] = useState("124.5 MNIGHT");
  const [totalUsers, setTotalUsers] = useState("1,247");
  const [totalVolume, setTotalVolume] = useState("$2.4M");
  const [privacyScore, setPrivacyScore] = useState("99.8%");
  const [recentTxs, setRecentTxs] = useState<Array<{type: string; amount: string; time: string; status: string}>>([]);

  // Background particles
  const [particles, setParticles] = useState([] as Particle[]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Connect Wallet
  const connectWallet = () => {
    setWalletConnected(true);
    setAccountId(`user-${Math.random().toString(36).substring(2, 8)}.near.testnet`);
    // Generate some recent transactions
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
  };

  // Generate commitment hash from secret
  const generateCommitment = () => {
    if (!secret && !customSecret) return "";
    const secretVal = customSecret || secret;
    let hash = 0;
    for (let i = 0; i < secretVal.length; i++) {
      const char = secretVal.charCodeAt(i);
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
    
    // Add to recent transactions
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
    
    setRecentTxs(prev => [
      { type: "Redeem", amount: "1 MNIGHT", time: "Just now", status: "Confirmed" },
      ...prev.slice(0, 4)
    ]);
  };

  const resetStep = () => { setStep("idle"); setTxId(""); };

  // Background particles animation
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
      {/* Background Mesh Gradient */}
      <div className="bg-mesh fixed inset-0 z-[-3] pointer-events-none"></div>
      
      {/* Gradient Blobs */}
      <div className="mesh-blob blob-1"></div>
      <div className="mesh-blob blob-2"></div>
      <div className="mesh-blob blob-3"></div>
      
      {/* Grid Pattern */}
      <div className="grid-dots fixed inset-0 z-[-3] pointer-events-none"></div>
      
      {/* Canvas Particles */}
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 z-[-2] pointer-events-none" 
        style={{ opacity: 0.4 }}
      />

      {/* Navbar */}
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
              <a href="#" className="text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors">Bridge</a>
              <a href="#" className="text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors">Earn</a>
              <a href="#" className="text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors">Docs</a>
            </div>

            {/* Overview / Advanced Toggle */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => { setShowOverview(true); setAdvancedMode(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${showOverview ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-slate-400 hover:text-amber-400'}`}
              >
                <Layout className="w-4 h-4 mr-1.5" /> Overview
              </button>
              <button
                onClick={() => { setAdvancedMode(true); setShowOverview(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${advancedMode ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'text-slate-400 hover:text-purple-400'}`}
              >
                <Settings className="w-4 h-4 mr-1.5" /> Advanced
              </button>
            </div>

            {/* Resources Popup */}
            <div className="relative group">
              <button
                onClick={() => {}}
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors"
              >
                Resources <span className="text-slate-500 text-xs">▾</span>
              </button>
            </div>

            {/* Documentation Popup */}
            <div className="relative group">
              <button
                onClick={() => {}}
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors"
              >
                Documentation <span className="text-slate-500 text-xs">▾</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {walletConnected ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/20 rounded-full text-xs font-medium text-green-400 border border-green-500/30 animate-pulse-glow">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  NEAR Testnet
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <span className="text-xs font-medium text-slate-300 truncate max-w-xs">{accountId}</span>
                  <button
                    onClick={disconnectWallet}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary px-4 py-2 text-sm"
              >
                <Wallet className="w-3.5 h-3.5 mr-1.5" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Close overlay */}
      {false && (
        <div className="fixed inset-0 z-40" />
      )}

      {/* ========== OVERVIEW SECTION ========== */}
      {showOverview && (
        <>
          {/* Hero Section */}
          <header className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 z-10">
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
                    <>
                      <button onClick={lockAssets} disabled={!amount || !commitment || step !== "idle"} className="btn-primary flex-1 px-8 py-4">
                        {step === "locking" ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Locking on NEAR...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Lock className="w-5 h-5" />
                            Lock Assets on NEAR
                          </span>
                        )}
                      </button>
                      <button onClick={redeemAssets} disabled={!commitment || step !== "idle"} className="btn-secondary flex-1 px-8 py-4">
                        {step === "redeeming" ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            ZK Proof Verifying...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5" />
                            Redeem on Midnight
                          </span>
                        )}
                      </button>
                    </>
                  ) : (
                    <button onClick={connectWallet} className="btn-primary flex-1 px-8 py-4">
                      <Wallet className="w-5 h-5 mr-2" />
                      Connect Wallet to Start
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Overview Stats */}
          <section className="px-4 sm:px-6 lg:px-8 py-12 z-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
                <div className="info-card animate-fade-in-up stagger-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Locked</p>
                      <p className="text-2xl font-bold text-slate-100">{totalLocked}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                      <Database className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="info-card animate-fade-in-up stagger-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Active Users</p>
                      <p className="text-2xl font-bold text-slate-100">{totalUsers}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="info-card animate-fade-in-up stagger-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Volume</p>
                      <p className="text-2xl font-bold text-slate-100">{totalVolume}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="info-card animate-fade-in-up">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Privacy Score</p>
                      <p className="text-2xl font-bold text-slate-100">{privacyScore}</p>
                    </div>
                    <div className="w-10 h-10 bg-shield-white rounded-xl flex items-center justify-center text-white">
                      <Shield className="w-5 h-5 text-slate-900" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Overview Activity */}
          <section className="px-4 sm:px-6 lg:px-8 py-12 z-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Recent Activity</h3>
                  <p className="text-sm text-slate-400">Latest bridge transactions</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300">All Networks</span>
                </div>
              </div>
              
              <div className="info-card p-0 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {recentTxs.map((tx, i) => (
                      <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${tx.status === 'Confirmed' ? 'bg-green-400' : 'bg-amber-500'}`}></div>
                            <span className="text-sm text-slate-300">{tx.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300 font-mono">{tx.amount}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{tx.time}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-500/30">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ========== ADVANCED MODE SECTION ========== */}
      {advancedMode && (
        <>
          <header className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 z-10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 backdrop-blur-md border border-purple-500/30 rounded-full text-sm font-medium text-purple-400 shadow-sm animate-fade-in">
                  <Settings className="w-4 h-4" />
                  Advanced Configuration
                </div>
                
                <h2 className="mt-6 text-4xl font-extrabold text-slate-100 mb-6 tracking-tight animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  Expert Controls & ZK Circuit Options
                </h2>
                
                <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  Fine-tune bridge parameters, select proof circuits, and configure advanced settlement options.
                </p>
              </div>
            </div>
          </header>

          <section className="px-4 sm:px-6 lg:px-8 py-12 z-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Advanced Settings */}
                <div className="lg:col-span-2">
                  <section className="glass-card p-8 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-lg">
                          <Settings className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-100 leading-none">ZK Circuit Configuration</h3>
                          <p className="text-xs text-slate-500 mt-1 font-medium">Configure proof verification parameters</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Advanced Mode</label>
                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                          <input type="checkbox" name="switch" checked={advancedMode} className="block absolute w-6 h-6 appearance-none rounded-full border border-slate-600 bg-slate-700 checked:bg-purple-500 checked:border-purple-500 cursor-pointer transition-colors duration-200" onChange={() => setAdvancedMode(!advancedMode)} />
                          <div className="block absolute w-4 h-4 rounded-full bg-white border border-slate-400 checked:border-purple-500 checked:bg-purple-500 checked:translate-x-6 cursor-pointer transition-transform duration-200"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-700/50">
                          <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Gas Limit</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={gasLimit}
                              onChange={(e) => setGasLimit(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm text-slate-200 font-mono"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">gas</span>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-700/50">
                          <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Slippage Tolerance</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={slippage}
                              onChange={(e) => setSlippage(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm text-slate-200 font-mono"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">%</span>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-700/50">
                          <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Circuit Type</label>
                          <select
                            value={circuitType}
                            onChange={(e) => setCircuitType(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm text-slate-200 font-mono"
                          >
                            <option value="standard">Standard Circuit</option>
                            <option value="ultra-honk">UltraHonk (High Privacy)</option>
                            <option value="plonk">Plonk (Fast Verification)</option>
                            <option value="groth16">Groth16 (Minimal Proof)</option>
                          </select>
                        </div>
                        <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-700/50 flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={autoRedeem}
                            onChange={() => setAutoRedeem(!autoRedeem)}
                            className="w-4 h-4 text-purple-600 bg-slate-950 border-slate-700 rounded focus:ring-purple-500"
                          />
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Auto Redeem</label>
                            <p className="text-xs text-slate-500">Automatically redeem on proof validation</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-700/50">
                        <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Custom Secret (Optional)</label>
                        <div className="relative">
                          <input
                            type={showSecret ? "text" : "password"}
                            value={customSecret}
                            onChange={(e) => setCustomSecret(e.target.value)}
                            placeholder="Enter custom secret for commitment generation"
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                          />
                          <button
                            onClick={() => setShowSecret(!showSecret)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            {showSecret ? "Hide" : "Show"}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                          Override the auto-generated secret. Used to compute the commitment hash for ZK verification.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Advanced Actions */}
                <div className="lg:col-span-1">
                  <section className="glass-card p-8 animate-fade-in-up stagger-2">
                    <h3 className="font-bold text-lg text-slate-100 mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-sm font-medium hover:bg-slate-700 hover:border-slate-600 transition-all flex items-center justify-between">
                        <span>Validate Commitment</span>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                      </button>
                      <button className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-sm font-medium hover:bg-slate-700 hover:border-slate-600 transition-all flex items-center justify-between">
                        <span>Export Proof Data</span>
                        <Save className="w-4 h-4 text-slate-500" />
                      </button>
                      <button className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-sm font-medium hover:bg-slate-700 hover:border-slate-600 transition-all flex items-center justify-between">
                        <span>View Circuit Details</span>
                        <Database className="w-4 h-4 text-slate-500" />
                      </button>
                      <button className="w-full px-4 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400 text-sm font-medium hover:bg-purple-500/40 transition-all flex items-center justify-between">
                        <span>Reset to Defaults</span>
                        <Clock className="w-4 h-4 text-purple-500" />
                      </button>
                    </div>
                    
                    <div className="mt-8 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30">
                      <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-xs font-bold text-amber-300 mb-1">Security Notice</p>
                          <p className="text-xs text-amber-200">
                            Advanced settings affect ZK proof verification. Incorrect configuration may cause transaction failures.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Wallet Status */}
      {walletConnected && showOverview && (
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
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== LOCK / REDEEM PANELS (Only show when not in overview/advanced) ========== */}
      {!showOverview && !advancedMode && walletConnected && (
        <>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Lock Panel */}
              <section className="glass-card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-900/10 rounded-full blur-xl opacity-40 -mr-8 -mt-8"></div>
                
                <div className="relative z-10 flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-100 leading-none">Lock Assets on NEAR</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Convert NEAR → Private Midnight Tokens</p>
                  </div>
                </div>
                
                <div className="space-y-5 relative z-10">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2.5 uppercase tracking-wider">Amount to Lock</label>
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
                    <p className="text-[10px] text-slate-500 mt-1.5 font-medium">1 NEAR = 10²⁴ yoctoNEAR</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2.5 uppercase tracking-wider">Commitment Hash</label>
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="0x + 64 hex characters"
                        value={commitment}
                        onChange={(e) => setCommitment(e.target.value)}
                        className="input-field w-full px-5 py-4 pr-12"
                        disabled={step === "locking" || step === "redeeming"}
                      />
                      <button
                        onClick={() => {
                          const gen = generateCommitment();
                          if (gen) setCommitment(gen);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors bg-slate-800/50 px-2 py-1 rounded border border-amber-500/30"
                      >
                        Generate
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5 font-medium flex items-center gap-1">
                      <span className="w-1 h-1 bg-amber-500 rounded-full"></span> hash(secret) — secret stays off-chain
                    </p>
                  </div>
                  
                  <div className="pt-5 border-t border-slate-700/50">
                    <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30">
                      <span className="text-sm text-slate-400 font-medium">Expected Output</span>
                      <span className="text-sm font-bold text-amber-400">{amount ? (parseFloat(amount) / 1e24).toFixed(6) : "0.000000"} MNIGHT</span>
                    </div>
                  </div>
                </div>
                
                {step === "locked" && (
                  <div className="mt-6 p-5 bg-green-900/10 border border-green-500/30 rounded-2xl animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-green-400 leading-none">Assets Locked Successfully</p>
                        <p className="text-xs text-green-500 mt-1 font-mono truncate max-w-xs">{txId}</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(txId)}
                        className="ml-auto text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy TX
                      </button>
                    </div>
                  </div>
                )}
                
                {step === "error" && (
                  <div className="mt-4 p-5 bg-red-900/10 border border-red-500/30 rounded-2xl animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-red-400 leading-none">Transaction Failed</p>
                        <p className="text-xs text-red-500 mt-1">Please check your inputs and try again.</p>
                      </div>
                    </div>
                    <button onClick={resetStep} className="mt-3 text-xs font-bold text-amber-400 hover:text-amber-300">Try Again →</button>
                  </div>
                )}
              </section>

              {/* Redeem Panel */}
              <section className="glass-card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900/10 rounded-full blur-xl opacity-40 -mr-8 -mt-8"></div>
                
                <div className="relative z-10 flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-100 leading-none">Redeem on Midnight</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Burn Private Tokens → Unlock NEAR Assets</p>
                  </div>
                </div>
                
                <div className="space-y-5 relative z-10">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2.5 uppercase tracking-wider">Commitment Hash</label>
                    <input
                      type="text"
                      placeholder="Enter commitment hash from lock"
                      value={commitment}
                      onChange={(e) => setCommitment(e.target.value)}
                      className="input-field w-full px-5 py-4"
                      disabled={step === "locking" || step === "redeeming"}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2.5 uppercase tracking-wider">Secret (Private Witness)</label>
                    <div className="relative group">
                      <input
                        type={showSecret ? "text" : "password"}
                        placeholder="Enter your secret value"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        className="input-field w-full px-5 py-4 pr-12"
                      />
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showSecret ? "Hide" : "Show"}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1.5 font-medium flex items-center gap-1">
                      <span className="w-1 h-1 bg-purple-500 rounded-full"></span> Verified via ZK proof, never on-chain
                    </p>
                  </div>
                  
                  <div className="pt-5 border-t border-slate-700/50">
                    <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-2xl border border-purple-500/30">
                      <span className="text-sm text-slate-400 font-medium">Expected Output</span>
                      <span className="text-sm font-bold text-purple-400">1 MNIGHT</span>
                    </div>
                  </div>
                </div>
                
                {step === "redeemed" && (
                  <div className="mt-6 p-5 bg-purple-900/10 border border-purple-500/30 rounded-2xl animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-purple-400 leading-none">Redeemed Successfully</p>
                        <p className="text-xs text-purple-500 mt-1 font-mono truncate max-w-xs">{txId}</p>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(txId)}
                        className="ml-auto text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy TX
                      </button>
                    </div>
                  </div>
                )}
                
                {step === "error" && (
                  <div className="mt-4 p-5 bg-red-900/10 border border-red-500/30 rounded-2xl animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-red-400 leading-none">Verification Failed</p>
                        <p className="text-xs text-red-500 mt-1">Check your secret or commitment hash.</p>
                      </div>
                    </div>
                    <button onClick={resetStep} className="mt-3 text-xs font-bold text-amber-400 hover:text-amber-300">Try Again →</button>
                  </div>
                )}
              </section>
            </div>
          </main>
        </>
      )}

      {/* Privacy Info Section */}
      {!advancedMode && (
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
                  <li className="flex items-start gap-2"><span className="text-amber-400">▸</span> Net values linked to hash pairs</li>
                </ul>
              </div>
              
              <div className="info-card animate-fade-in-up stagger-3">
                <div className="flex items-center gap-3 mb-5">
                  <EyeOff className="w-6 h-6 text-purple-400" />
                  <h4 className="font-bold text-xl text-slate-100">Private Witness</h4>
                </div>
                <ul className="text-sm text-slate-300 space-y-3 leading-relaxed">
                  <li className="flex items-start gap-2"><span className="text-purple-400">▸</span> Wallet addresses never revealed</li>
                  <li className="flex items-start gap-2"><span className="text-purple-400">▸</span> Member names & labels hidden</li>
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
      )}

      {/* How It Works */}
      {!advancedMode && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 z-10 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="flex items-center justify-center gap-2 text-amber-400 mb-4">
                <Sparkles className="w-6 h-6 animate-bounce" />
                <span className="font-bold text-lg">Three Steps to Privacy</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-100 mb-6">How the Bridge Works</h3>
              <p className="text-slate-400 max-w-lg mx-auto">From NEAR lock to Midnight redeem in minutes</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Connect & Lock",
                  desc: "Connect Lace Wallet on NEAR testnet, enter amount and generate commitment hash from your secret.",
                  icon: <Lock className="w-7 h-7" />,
                  color: "from-amber-500 to-purple-600"
                },
                {
                  step: "02",
                  title: "ZK Proof",
                  desc: "Generate zero-knowledge proof proving you know the secret without revealing it. Verified off-chain.",
                  icon: <Brain className="w-7 h-7" />,
                  color: "from-purple-500 to-pink-500"
                },
                {
                  step: "03",
                  title: "Mint & Redeem",
                  desc: "Private tokens minted on Midnight using commitment. Redeem secret to unlock original NEAR assets.",
                  icon: <Network className="w-7 h-7" />,
                  color: "from-purple-500 to-indigo-500"
                }
              ].map((item, i) => (
                <div key={i} className="info-card relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b {item.color}"></div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-slate-800/50 border border-slate-700/50">
                    <div className={`w-full h-full rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 ${item.color}`}>
                      {item.icon}
                    </div>
                  </div>
                  <h4 className="font-bold text-lg text-slate-100 mb-3 leading-none">{item.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  
                  <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span>{item.step}</span>
                    <ArrowRight className="w-3 h-3 opacity-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
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

      {/* Success Toast */}
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