import React from "react";
import { WalletProvider, useWallet } from "./WalletContext";

function LoginPage({ signIn, isLoading }: { signIn: () => Promise<void>; isLoading: boolean }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 10v8M21 10v8M10 21h8M10 21h-8M3 10V2M21 10V2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">NEAR→Midnight</h1>
          <p className="text-slate-400 mt-2">Privacy Bridge</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Connect Wallet</h2>
          <p className="text-sm text-slate-400 mb-6">Sign in to your NEAR wallet to bridge assets privately.</p>

          <button
            onClick={signIn}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/30 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Connect NEAR Wallet"}
          </button>

          <p className="mt-6 text-xs text-slate-500 text-center">
            Need a wallet? Create one at <a href="https://wallet.testnet.near.org" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">wallet.testnet.near.org</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function BridgeApp({ account, signOut }: { account: string; signOut: () => Promise<void> }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 font-sans">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-white">N→M</span>
            </div>
            <span className="text-sm font-bold text-slate-100">NEAR→Midnight</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-slate-700 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-slate-300 truncate max-w-xs">{account}</span>
              <button onClick={signOut} className="text-slate-400 hover:text-red-400 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-24">
        <h2 className="text-2xl font-bold text-slate-100 mb-8">Bridge Assets</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2 text-amber-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Lock Assets on NEAR
            </h3>
            <div className="space-y-4">
              <input type="number" min="0" step="1" placeholder="Amount (yoctoNEAR)" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="text" placeholder="Commitment hash (0x...)" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
              <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-purple-600 text-slate-900 font-bold rounded-xl transition-all hover:-translate-y-1 shadow-amber-500/30 hover:shadow-amber-500/50">Lock Assets on NEAR</button>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2 text-purple-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Redeem on Midnight
            </h3>
            <div className="space-y-4">
              <input type="text" placeholder="Commitment hash" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
              <input type="password" placeholder="Secret" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
              <button className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-colors">Redeem Assets</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const { account, signIn, signOut, isLoading } = useWallet();
  if (account) {
    return <BridgeApp account={account} signOut={signOut} />;
  }
  return <LoginPage signIn={signIn} isLoading={isLoading} />;
}
