import React from "react";
import ReactDOM from "react-dom/client";

const App = () => React.createElement("div", { style: { minHeight: "100vh", backgroundColor: "#0f172a", color: "#ffffff", fontFamily: "sans-serif", padding: "40px" } }, 
  React.createElement("h1", { style: { color: "#f59e0b", fontSize: "48px", fontWeight: "bold" } }, "NEAR→Midnight Privacy Bridge"),
  React.createElement("p", { style: { fontSize: "18px", color: "#94a3b8", marginBottom: "30px" } }, "Cross-chain private asset transfer"),
  React.createElement("button", { style: { padding: "12px 24px", background: "#f59e0b", color: "#0f172a", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" } }, "Connect Wallet")
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);