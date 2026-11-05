import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Import Google Fonts: Orbitron (headings) + Exo 2 (body)
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);