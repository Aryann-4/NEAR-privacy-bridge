import React from "react";

const App = () => (
  <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "system-ui, sans-serif", padding: "40px" }}>
    <h1 style={{ color: "#f59e0b", fontSize: "48px", fontWeight: "bold", marginBottom: "20px" }}>
      NEAR→Midnight Privacy Bridge
    </h1>
    <p style={{ fontSize: "18px", color: "#94a3b8", marginBottom: "30px" }}>
      Cross-chain private asset transfer with ZK proofs
    </p>
    <button
      style={{
        padding: "12px 24px",
        background: "#f59e0b",
        color: "#0f172a",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
      onClick={() => alert("Wallet connected!")}
    >
      Connect Wallet
    </button>
  </div>
);

export default App;