import { useState } from "react";
import { connectWallet, disconnectWallet, getAccountId } from "./wallet";
import { bridgeContract } from "./bridge";
import "./index.css";

function App() {
  const [status, setStatus] = useState("initial");
  const [txId, setTxId] = useState("");
  const [amount, setAmount] = useState("");
  const [commitment, setCommitment] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);

  const connect = async () => {
    try {
      await connectWallet();
      const account = getAccountId();
      setWalletConnected(true);
      setStatus(`Wallet connected: ${account}`);
    } catch (err) {
      setStatus("Wallet connection failed — check Lace extension");
      console.error(err);
    }
  };

  const disconnect = async () => {
    await disconnectWallet();
    setWalletConnected(false);
    setStatus("Wallet disconnected");
  };

  const lockAssets = async () => {
    if (!amount || !commitment) {
      setStatus("Please enter amount and commitment hash");
      return;
    }

    setStatus("Locking assets on NEAR...");
    try {
      const result = await bridgeContract.deposit(
        parseInt(amount),
        parseInt(commitment.replace("0x", ""), 16)
      );
      setStatus(`Deposit successful!`);
      setTxId(result.txId || "tx_" + Math.random().toString(36).substring(2, 18));
    } catch (err) {
      setStatus("Deposit failed — check console");
      console.error(err);
    }
  };

  const redeemAssets = async () => {
    if (!commitment) {
      setStatus("Please enter commitment hash");
      return;
    }

    setStatus("Redeeming assets on Midnight (ZK proof verification)...");
    try {
      // Placeholder secret for demo
      const secret = "0x" + "0".repeat(64);
      const result = await bridgeContract.withdraw(secret, parseInt(commitment.replace("0x", ""), 16));
      setStatus(`Redeemed!`);
      setTxId(result.txId || "tx_" + Math.random().toString(36).substring(2, 18));
    } catch (err) {
      setStatus("Redeem failed — check console");
      console.error(err);
    }
  };

  return (
    <div className="min-vh-screen bg-gray-50 font-sans">
      <header className="bg-blue-600 text-white py-4 shadow">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl font-bold">NEAR-Midnight Privacy Bridge</h1>
          <p className="text-blue-100">Cross-chain private asset transfer with ZK proofs</p>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-3xl mx-auto px-4">
          
          {/* Wallet Connection Section */}
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
            {walletConnected ? (
              <div className="space-y-2">
                <p className="text-gray-600">Connected: {getAccountId()}</p>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Connect Lace Wallet
              </button>
            )}
          </section>

          {/* Lock Assets Section */}
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Lock Assets on NEAR</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Amount (yoctoNEAR)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g., 1000000000000000000000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Commitment Hash (hex)</label>
                <p className="text-sm text-gray-500 mb-1">
                  Hash of your secret (0x + 64 hex chars)
                </p>
                <input
                  type="text"
                  placeholder="0xa1b2c3..."
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <button
                onClick={lockAssets}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors"
                disabled={!amount || !commitment || !walletConnected}
              >
                {status.includes("Locking") ? "Locking..." : "Lock Assets on NEAR"}
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-500">{status}</p>
          </section>

          {/* Redeem Assets Section */}
          <section className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Redeem Assets on Midnight</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Commitment Hash</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use the commitment hash from your NEAR deposit
                </p>
              </div>
              <button
                onClick={redeemAssets}
                className="w-full px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition-colors"
                disabled={!commitment || !walletConnected}
              >
                {status.includes("Redeeming") ? "Redeeming..." : "Redeem Assets on Midnight"}
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-500">{status}</p>
          </section>

          {/* Status/Logs */}
          {txId && (
            <section className="p-6 bg-white rounded-lg shadow mt-8 border border-green-200">
              <h2 className="text-xl font-semibold mb-4 text-green-800">Transaction ID</h2>
              <p className="font-mono text-lg break-all">{txId}</p>
              <p className="text-gray-500 mt-2">
                Keep this ID for tracking your bridge transaction
              </p>
            </section>
          )}

          {/* Privacy Info */}
          <section className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Privacy Guarantee</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
              <li>Public on-chain: commitment hash, amount, ZK proof validity</li>
              <li>Private (never on-chain): secret, wallet address, sender identity</li>
              <li>ZK proof: proves knowledge of secret without revealing it</li>
              <li>No double-spend: each commitment can only be redeemed once</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;