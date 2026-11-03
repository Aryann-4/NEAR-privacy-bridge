import { useState, useEffect } from "react";
import { connectWallet, disconnectWallet, getAccountId } from "./wallet";
import { bridgeContract } from "./bridge";
import "./index.css";

function App() {
  const [status, setStatus] = useState("initial");
  const [txId, setTxId] = useState("");
  const [amount, setAmount] = useState("");
  const [commitment, setCommitment] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [network, setNetwork] = useState("near");

  const connect = async () => {
    try {
      await connectWallet();
      const account = getAccountId();
      setWalletConnected(true);
      setStatus(`Wallet connected: ${account}`);
    } catch (err) {
      setStatus("Wallet connection failed");
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
      // Call NEAR bridge contract to deposit
      const result = await bridgeContract.deposit(
        parseInt(amount),
        parseInt(commitment, 16)  // commitment is hex
      );
      setStatus(`Deposit successful! TX: ${result}`);
      setTxId(result.toString());
    } catch (err) {
      setStatus("Deposit failed");
      console.error(err);
    }
  };

  const redeemAssets = async () => {
    if (!commitment) {
      setStatus("Please enter commitment hash");
      return;
    }

    setStatus("Redeeming assets (ZK proof verification off-chain)...");
    try {
      // Call Midnight bridge contract to withdraw
      // This requires the secret - in a real app, user would provide this
      // For demo, we'll use a placeholder
      const secret = "0x" + "0".repeat(64);  // placeholder
      const result = await bridgeContract.withdraw(secret, parseInt(commitment, 16));
      setStatus(`Redeemed! Amount: ${result}`);
    } catch (err) {
      setStatus("Redeem failed");
      console.error(err);
    }
  };

  return (
    <div className="min-vh-screen bg-gray-50 font-sans">
      <header className="bg-blue-600 text-white py-4 shadow">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold">NEAR-Midnight Privacy Bridge</h1>
          <p className="text-blue-100">Cross-chain private asset transfer</p>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Wallet Connection Section */}
          <section className="mb-8 p-6 bg-white rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
            {walletConnected ? (
              <div>
                <p className="text-gray-600">Connected: {getAccountId()}</p>
                <button
                  onClick={disconnect}
                  className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
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
                <label className="block text-gray-700 mb-2">Amount (in yoctoNEAR)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g., 1000000000000000000000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Commitment Hash (hex)</label>
                <p className="text-sm text-gray-500">
                  Hash of your secret (format: 0x followed by 64 hex chars)
                </p>
                <input
                  type="text"
                  placeholder="0x..."
                  value={commitment}
                  onChange={(e) => setCommitment(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                onClick={lockAssets}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors"
                disabled={!amount || !commitment || !walletConnected}
              >
                {status === "initial" || status === "failed" ? "Lock Assets on NEAR" : status.includes("successful") ? "Locked!" : "Processing..."}
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
                  className="w-full p-2 border rounded"
                />
                <p className="text-xs text-gray-500">
                  The commitment hash from your NEAR deposit
                </p>
              </div>
              <button
                onClick={redeemAssets}
                className="w-full px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition-colors"
                disabled={!commitment || !walletConnected}
              >
                {status.includes("Redeem") ? "Redeeming..." : "Redeem Assets on Midnight"}
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-500">{status}</p>
          </section>

          {/* Status/Logs */}
          {txId && (
            <section className="p-6 bg-white rounded-lg shadow mt-8">
              <h2 className="text-xl font-semibold mb-4">Transaction ID</h2>
              <p className="font-mono text-lg">{txId}</p>
              <p className="text-gray-500 mt-2">
                Keep this ID for tracking your bridge transaction
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;