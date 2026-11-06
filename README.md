# NEAR × Midnight Privacy Bridge

**Private cross-chain settlement between NEAR and Midnight, powered by zero-knowledge commitments.**

> Built for NEAR HACKATHON 2026 · Tracks: `privacy`, `defi`, `realworld`

[Live demo](https://aryann-4.github.io/NEAR-privacy-bridge/) · [Repository](https://github.com/Aryann-4/NEAR-privacy-bridge)

![Landing page](docs/landing.png)

---

## The problem

Traditional bridges publish a complete trail: who moved what, to which chain, and when. That is unacceptable for payroll, business payments, private trading, or simply holding assets without being profiled.

This project breaks the link between the two chains. A user locks assets on NEAR and receives a **commitment hash** — `SHA-256(secret)`. Only the hash is public. On Midnight, the user proves knowledge of the secret in zero knowledge and claims the private balance. Observers can verify that a valid claim happened, but cannot link it back to the depositor.

## How it works

```text
        lock(amount, commitment)                claim(commitment, proof)
NEAR ───────────────────────────▶ ▼ ───────────────────────────▶ Midnight
                                  │
                        commitment = SHA-256(secret)
                        secret stays on the user's device
```

1. **Lock on NEAR** — the bridge contract stores the amount against the commitment hash.
2. **Keep the witness private** — the browser generates a random 32-byte secret and hashes it locally. The secret never leaves the device.
3. **Redeem on Midnight** — a relayer verifies the ZK proof and releases the private balance. The same commitment cannot be spent twice.

The frontend implements the full commitment lifecycle: generation, downloadable claim file, and local proof verification. The contracts in this repo implement the on-chain lock and redemption logic.

## Demo

![Dashboard](docs/dashboard.png)

**What works today**

- Real NEAR testnet wallet login through [`@hot-labs/near-connect`](https://github.com/hot-dao/near-selector), with session restore and disconnect.
- Live account balance fetched from NEAR RPC.
- Client-side SHA-256 commitment generation, copy/download, and local witness verification.
- Persistent recent-activity list and a wallet overview popup.
- Responsive dark UI with animated background, accessibility-minded focus states, and a NEAR-native aesthetic.

**Testnet preview**

- On-chain `deposit` / `withdraw` calls are not wired into the UI yet. The bridge button generates and verifies real commitments locally; no funds move.
- Protocol metrics shown in the dashboard are illustrative, not live TVL.
- The NEAR and Midnight contracts are included as source and are intended for testnet deployment.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 5, Tailwind CSS, TypeScript |
| Wallet | NEAR Connect (`@hot-labs/near-connect`), `near-api-js` RPC |
| NEAR contract | Rust + `near-sdk` |
| Midnight contract | Compact |
| Privacy primitive | `commitment = SHA-256(secret)` |
| Hosting | GitHub Pages (public demo), Vercel-compatible |

## Repository layout

```text
frontend/                     React app (login, bridge, wallet, activity)
  src/WalletContext.tsx       NEAR Connect provider, session + balance
  src/components/             Landing, Dashboard, BridgeCard, AccountModal
  src/lib/commitment.ts       SHA-256 commitment generation + verification
near-contract/                NEAR lock/unlock contract
midnight-contract/            Midnight Compact bridge contract
.github/workflows/            CI and GitHub Pages deployment
docs/                         Screenshots used in this README
```

## Run locally

Requirements: Node.js 20+ and a NEAR testnet account (for login).

```bash
git clone https://github.com/Aryann-4/NEAR-privacy-bridge.git
cd NEAR-privacy-bridge/frontend
npm install
npm run dev
```

Open <http://localhost:5173>. Click **Connect NEAR Wallet** and choose a wallet from the NEAR Connect modal. No private keys are handled by the app.

Production build:

```bash
npm run build
npm run preview
```

## Contracts

**NEAR** (`near-contract/`): stores `commitment → (amount, sender, origin)`, rejects duplicate commitments, and emits deposit/unlock events.

**Midnight** (`midnight-contract/contract/src/bridge.compact`): stores commitments, verifies the private witness, and prevents double spends. Secrets are used as private witness data and are never persisted on-chain.

> **Status:** the NEAR and Midnight contracts are reference implementations included for review. They are not compiled in CI or deployed to testnet yet. The live frontend intentionally labels its bridge flow as a testnet preview and performs commitments locally; no funds move.

## Privacy model

| Public | Private |
| --- | --- |
| Commitment hash | Secret witness |
| Locked amount | Wallet address |
| Proof validity | Sender ↔ receiver link |
| Network and timestamp | User identity / history |

A commitment is a one-way hash. Without the secret it cannot be linked to a wallet, and without a valid secret it cannot be redeemed.

## Hackathon tracks

- **Privacy** — the core flow hides the link between NEAR and Midnight.
- **DeFi** — a reusable privacy primitive for cross-chain liquidity and payments.
- **Real world** — private payroll, vendor payments, and treasury operations.

## Roadmap

1. Deploy the NEAR contract to testnet and wire `deposit` / `withdraw` into the UI.
2. Add a relayer service that submits Midnight claims and tracks proof status.
3. Replace the local hash demo with the Midnight proof server and Compact circuit.
4. Add NEP-413 message auth for session proofs and persistent encrypted claim storage.

## License

MIT — see [LICENSE](LICENSE).
