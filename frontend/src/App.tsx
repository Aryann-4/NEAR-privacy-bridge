import { useState, useEffect, useRef } from "react";
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
  EyeOff,
  Monitor,
  Shield,
  Code,
  Clock,
  Mail,
  GitBranch,
  RotateCcw,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Hexagon,
  Cube,
  Atom,
  Wifi,
  ShieldCheck as ShieldCheck2
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
  const [particles, setParticles] = useState<Array<{x: number, y: number, vx: number, vy: number, size: number, color: string}>>([]);
  
  const mouseRef = useRef({ x: 0, y: 0 });

  // Connect Lace Wallet
  const connectWallet = async () => {
    setStep("idle");
    
    try {
      // Simulate wallet connection
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
      setTimeout(() => setStep("idle"), 2000);
      return;
    }

    setStep("locking");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
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
      setTimeout(() => setStep("idle"), 2000);
      return;
    }

    setStep("redeeming");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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

  // Background particles effect
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width, height;
    let particles: Array<{x: number, y: number, vx: number, vy: number, size: number, color: string}> = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    function initParticles() {
      particles = [];
      const count = Math.min(width / 10, 50);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 0.5})`
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        
        // Draw connection lines
        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
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
      document.body.removeChild(canvas);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-blue-200 selection:text-blue-900 font-sans">
      {/* Background Mesh Gradient */}
      <div className="bg-mesh fixed inset-0 z-[-2] pointer-events-none"></div>
      
      {/* Gradient Blobs */}
      <div className="mesh-blob blob-1"></div>
      <div className="mesh-blob blob-2"></div>
      <div className="mesh-blob blob-3"></div>
      
      {/* Grid Pattern */}
      <div className="grid-dots fixed inset-0 z-[-2] pointer-events-none"></div>
      
      {/* Canvas Particles */}
      <canvas 
        className="fixed inset-0 z-[-1] pointer-events-none" 
        style={{ opacity: 0.3 }}
      />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 px-2 sm:px-4">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-xs font-bold tracking-wider">N→M</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">NEAR<span className="text-blue-600">→Midnight</span></h1>
                <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Privacy Bridge</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 hidden sm:flex">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-xs font-medium text-blue-700 border border-blue-100 animate-pulse-glow">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>NEAR Testnet Active</span>
              </div>
              
              <button 
                onClick={connectWallet}
                disabled={walletConnected}
                className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-blue-500/40 transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Wallet className="w-4 h-4" />
                {walletConnected ? "Connected" : "Connect Wallet"}
              </button>
            </div>
            
            {/* Mobile wallet button */}
            <button 
              onClick={connectWallet}
              disabled={walletConnected}
              className="sm:hidden px-4 py-2 bg-white/50 backdrop-blur-md border border-white/40 text-gray-700 font-medium rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {walletConnected ? "Connected" : "Connect"}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-white/60 rounded-full text-sm font-medium text-blue-700 shadow-sm animate-fade-in-up">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Knowledge Privacy Bridge</span>
            </div>
            
            <h2 className="mt-6 text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Move Assets<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Privately</span><br/>
              Across Chains
            </h2>
            
            <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              Lock assets on NEAR, generate zero-knowledge proofs, and mint private tokens on Midnight. 
              Your wallet address and transaction amounts stay private — only commitment hashes appear on-chain.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              {walletConnected ? (
                <>
                  <button onClick={lockAssets} disabled={!amount || !commitment || step !== "idle"} className="btn-primary flex-1">
                    {step === "locking" ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Locking on NEAR...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Lock className="w-5 h-5" />
                        Lock Assets on NEAR
                      </span>
                    )}
                  </button>
                  <button onClick={redeemAssets} disabled={!commitment || step !== "idle"} className="btn-secondary flex-1">
                    {step === "redeeming" ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>ZK Proof Verifying...</span>
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
                <button onClick={connectWallet} className="btn-primary flex-1">
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Lace Wallet to Start
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Wallet Status */}
      {walletConnected && (
        <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-16 z-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <div className="max-w-7xl mx-auto glass-card p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200/30">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-900 leading-none">Connected Wallet</h3>
                  <p className="text-xs text-gray-500 truncate font-mono">{accountId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${network === "testnet" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                  {network} Network
                </span>
                <button onClick={disconnectWallet} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Lock Panel */}
          <section className="glass-card p-8 hover-lift feature-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-xl opacity-50 -mr-6 -mt-6 group-hover:opacity-75 transition-all duration-500"></div>
            
            <div className="relative z-10 flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-blue-100/40">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 leading-none">Lock Assets on NEAR</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium">Convert NEAR → Private Midnight Tokens</p>
              </div>
            </div>
            
            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Amount to Lock</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">yoctoNEAR</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="1000000000000000000000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field pl-16"
                    disabled={step === "locking" || step === "redeeming"}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 font-medium">1 NEAR = 10²⁴ yoctoNEAR</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Commitment Hash</label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="0x + 64 hex characters"
                    value={commitment}
                    onChange={(e) => setCommitment(e.target.value)}
                    className="input-field pr-12"
                    disabled={step === "locking" || step === "redeeming"}
                  />
                  <button
                    onClick={() => {
                      const gen = generateCommitment();
                      if (gen) setCommitment(gen);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-white/50 px-2 py-1 rounded-lg border border-blue-100"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 font-medium flex items-center gap-1">
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span> hash(secret) — secret stays off-chain
                </p>
              </div>
              
              <div className="pt-5 border-t border-gray-50/50">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <span className="text-sm text-gray-600 font-medium">Expected Output</span>
                  <span className="text-sm font-bold text-blue-700">{amount ? (parseFloat(amount) / 1e24).toFixed(6) : "0.000000"} MNIGHT</span>
                </div>
              </div>
            </div>
            
            {step === "locked" && (
              <div className="mt-6 p-5 bg-green-50 border border-green-100 rounded-2xl animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-green-800 leading-none">Assets Locked Successfully</p>
                    <p className="text-xs text-green-600 mt-1 font-mono truncate max-w-xs">{txId}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(txId)}
                    className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy TX
                  </button>
                </div>
              </div>
            )}
            
            {step === "error" && (
              <div className="mt-4 p-5 bg-red-50 border border-red-100 rounded-2xl animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-red-800 leading-none">Transaction Failed</p>
                    <p className="text-xs text-red-600 mt-1">Please check your inputs and try again.</p>
                  </div>
                </div>
                <button onClick={resetStep} className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800">Try Again →</button>
              </div>
            )}
          </section>

          {/* Redeem Panel */}
          <section className="glass-card p-8 hover-lift feature-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-xl opacity-50 -mr-6 -mt-6 group-hover:opacity-75 transition-all duration-500"></div>
            
            <div className="relative z-10 flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shadow-indigo-100/40">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 leading-none">Redeem on Midnight</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium">Burn Private Tokens → Unlock NEAR Assets</p>
              </div>
            </div>
            
            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Commitment Hash</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">Secret (Private Witness)</label>
                <div className="relative group">
                  <input
                    type={showSecret ? "text" : "password"}
                    placeholder="Enter your secret value"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="input-field pr-12"
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showSecret ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 font-medium flex items-center gap-1">
                  <span className="w-1 h-1 bg-indigo-500 rounded-full"></span> Verified via ZK proof, never on-chain
                </p>
              </div>
              
              <div className="pt-5 border-t border-gray-50/50">
                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <span className="text-sm text-gray-600 font-medium">Expected Output</span>
                  <span className="text-sm font-bold text-indigo-700">1 MNIGHT</span>
                </div>
              </div>
            </div>
            
            {step === "redeemed" && (
              <div className="mt-6 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-indigo-800 leading-none">Redeemed Successfully</p>
                    <p className="text-xs text-indigo-600 mt-1 font-mono truncate max-w-xs">{txId}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(txId)}
                    className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy TX
                  </button>
                </div>
              </div>
            )}
            
            {step === "error" && (
              <div className="mt-4 p-5 bg-red-50 border border-red-100 rounded-2xl animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-red-800 leading-none">Verification Failed</p>
                    <p className="text-xs text-red-600 mt-1">Check your secret or commitment hash.</p>
                  </div>
                </div>
                <button onClick={resetStep} className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-800">Try Again →</button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Privacy Guarantee Section */}
      <section className="border-t border-white/50 bg-white/60 backdrop-blur-md py-20 px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/40 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Privacy First</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Traditional bridges expose wallet addresses and amounts. Our ZK-proof architecture keeps everything confidential.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 hover-lift relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="flex items-center gap-3 mb-5">
                <Eye className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-xl text-blue-900">Public On-Chain</h4>
              </div>
              <ul className="text-sm text-blue-700 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">▹</span>
                  Commitment hashes only
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">▹</span>
                  Publicly verifiable amounts
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">▹</span>
                  ZK proof validity checks
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">▹</span>
                  Net values linked to hash pairs
                </li>
              </ul>
            </div>
            
            <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100 hover-lift relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <div className="flex items-center gap-3 mb-5">
                <EyeOff className="w-6 h-6 text-indigo-600" />
                <h4 className="font-bold text-xl text-indigo-900">Private Witness</h4>
              </div>
              <ul className="text-sm text-indigo-700 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">▹</span>
                  Wallet addresses never revealed
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">▹</span>
                  Member names & labels hidden
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">▹</span>
                  Individual amounts concealed
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">▹</span>
                  Organizer secrets protected
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl text-white shadow-2xl shadow-blue-500/25 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%25%22 height=%22100%25%22 viewBox=%220 0 100 100%22><path d=%22M10 10h5v5h-5zM50 50h5v5h-5zM90 90h5v5h-5z%22 fill=%22rgba(255,255,255,0.05)%22 fill-opacity=%220.05%22/%3E</svg>')"], opacity: 0.3"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h4 className="font-bold text-xl mb-2">Users Prove Without Revealing</h4>
                <p className="text-blue-100 text-sm opacity-90 max-w-md">
                  "I am a valid member" • "I authorize payment" • Verified via ZK circuits without exposing secrets
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold mb-1">0%</li>
                  <p className="text-xs text-blue-100 font-medium tracking-wider uppercase">Data Exposed</p>
                </div>
                <div className="w-1 h-20 bg-white/20 rounded-full mx-2"></div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold mb-1">100%</li>
                  <p className="text-xs text-indigo-100 font-medium tracking-wider uppercase">Privacy Preserved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
              <Sparkles className="w-6 h-6 animate-bounce-subtle" />
              <span className="font-bold text-lg">Three Steps to Privacy</span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-6">How the Bridge Works</h3>
            <p className="text-gray-600 max-w-lg mx-auto">From NEAR lock to Midnight redeem in minutes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-child animate-fade-in-up">
            {[
              {
                step: "01",
                title: "Connect & Lock",
                desc: "Connect Lace Wallet on NEAR testnet, enter amount and generate commitment hash from your secret.",
                icon: <Lock className="w-7 h-7" />,
                color: "from-blue-500 to-indigo-500"
              },
              {
                step: "02",
                title: "ZK Proof",
                desc: "Generate zero-knowledge proof proving you know the secret without revealing it. Verified off-chain.",
                icon: <Brain className="w-7 h-7" />,
                color: "from-indigo-500 to-purple-500"
              },
              {
                step: "03",
                title: "Mint & Redeem",
                desc: "Private tokens minted on Midnight using commitment. Redeem secret to unlock original NEAR assets.",
                icon: <Network className="w-7 h-7" />,
                color: "from-purple-500 to-pink-500"
              }
            ].map((item, i) => (
              <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-500 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b {item.color}"></div>
                
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gray-50 group-hover:bg-blue-50 transition-colors border border-gray-100">
                  <div className={`w-full h-full rounded-xl flex items-center justify-center shadow-lg ${item.color}`}>
                    {item.icon}
                  </div>
                </div>
                
                <h4 className="font-bold text-lg text-gray-900 mb-3 leading-none">{item.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                
                <div className="mt-6 pt-6 border-t border-gray-50/50 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>{item.step}</span>
                  <ArrowRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-[11px] font-bold tracking-wider">N→M</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">NEAR→Midnight</span>
              <span className="text-xs text-gray-500 block mt-0.5">Privacy Bridge</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400 font-medium">
            <span>Built at <span className="text-gray-600 font-bold">NEAR HACKATHON 2026</span></span>
            <span className="h-4 w-px bg-gray-300 mx-1"></span>
            <span>Tracks: Privacy • DeFi • Real-World</span>
            <span className="h-4 w-px bg-gray-300 mx-1"></span>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors underline underline-offset-4">GitHub Repo</a>
          </div>
        </div>
      </footer>

      {/* Success Toast (appears briefly after actions) */}
      {step === "locked" || step === "redeemed" ? (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
          <div className="bg-white border border-green-100 text-green-800 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-bold text-sm">Transaction Complete</p>
              <p className="text-xs text-green-600">{txType === "lock" ? "Assets locked on NEAR" : "Redeemed on Midnight"}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;