# Midnight settlement contract

The Midnight side of the NEAR × Midnight privacy bridge. A trusted relayer
verifies a NEAR lock, registers a **domain-separated** Midnight commitment, and
escrows the matching tNIGHT. The user then claims with a zero-knowledge proof of
knowledge of the secret. The claim publishes only a nullifier and the recipient.

The live demo runs on **Midnight Preprod**. Midnight decommissioned its own
Preprod indexer on 2026-10-09; Blockfrost serves it now, so you need a free
Blockfrost project id.

## Privacy model

```text
NEAR deposit                       Midnight claim
commitmentNear = SHA-256(secret)   commitmentMid = H("near-midnight:commitment:v1", secret)
        │                                          │
        └──────────── relayer verifies ────────────┘
                                                   │
                                      claim(secret, commitmentMid, recipient)
                                      publishes: commitmentMid, nullifier, recipient
```

- The two commitments use different hash domains, so an observer of both chains
  cannot link the NEAR lock to the Midnight claim without the secret.
- The relayer sees both commitments when it verifies the lock. A decentralized
  relayer set and Merkle-membership claims are the next hardening step.
- `register` pulls the matching tNIGHT into the contract, so every registered
  commitment is fully backed.
- `claim` rejects a second claim of the same commitment through the nullifier.

## Contract

`contract/src/bridge.compact`

| Circuit | Purpose |
| --- | --- |
| `register(adminSecret, commitment, amount)` | Relayer-gated. Rejects duplicates, pulls `amount` tNIGHT into the contract, records the commitment. |
| `claim(secret, commitment, recipient)` | Verifies `H(domain, secret) == commitment`, rejects a claimed nullifier, sends the escrowed tNIGHT to `recipient`. |

Public ledger: `admin`, `tokenColor`, `deposits`, `claimed`, `registeredCount`,
`claimedCount`, `totalLocked`, `totalClaimed`.

Compiled with Compact compiler `0.31.1` (language `0.23`). The generated
`contract/src/managed/bridge` directory (including proving keys) is gitignored;
run `npm run compile` to rebuild it.

## Requirements

- Node.js 22+
- A running Midnight proof server on `127.0.0.1:6300`
- A funded Midnight testnet wallet (tNIGHT for escrow, DUST for fees)

### Proof server

With Docker:

```bash
docker run -d --name proof-server -p 6300:6300 midnightntwrk/proof-server:8.1.0
```

Without Docker, the release binary can be extracted from the Docker Hub image
layer and run natively. The binary needs a loader for its Nix interpreter:

```bash
/lib64/ld-linux-x86-64.so.2 ./midnight-proof-server -v
```

## Setup

```bash
cd midnight-contract
cp .env.example .env
npm install
npm run compile
```

Edit `.env`:

```dotenv
MIDNIGHT_NETWORK=preprod                 # or preview
MIDNIGHT_PROOF_SERVER=http://127.0.0.1:6300
MIDNIGHT_WALLET_SEED=<128 hex chars>     # optional; a new wallet is generated otherwise
PRIVATE_STATE_PASSWORD=<at least 16 chars>

# Preprod only: Midnight's own indexer was decommissioned on 2026-10-09.
# Create a "Midnight Preprod" project at https://blockfrost.io and paste its id.
# BLOCKFROST_PROJECT_ID=nightpreprod...
```

## Fund the wallet

```bash
npm run balance
```

Print the address, then use the matching faucet:

- Preprod: <https://faucet.preprod.midnight.network> (Blockfrost project id required)
- Preview: <https://faucet.preview.midnight.network> (newer protocol; not supported by the current SDK)

The first sync replays the chain's history and can take a few minutes. State is
cached in `.midnight-wallet-state/<network>`.

## Deploy

```bash
npm run deploy
```

The deployment records the contract address in `.midnight-state.json`
(gitignored) and creates `.bridge-secrets.json` with the relayer admin secret.
The deploy script retries while DUST is still being generated.

## Relayer registration

After verifying the NEAR lock, the relayer registers the Midnight commitment:

```bash
# The relayer knows the public NEAR commitment and the Midnight commitment.
npm run register -- \
  --near-commitment <64 hex chars> \
  --commitment <64 hex chars> \
  --amount 1.5

# Convenience path: derive both commitments from the same secret.
npm run register -- --secret <64 hex chars> --amount 1.5
```

`register` queries `view_deposit` on `near-midnight-bridge.testnet` and refuses
to register a missing or already-claimed NEAR lock.

## Claim

```bash
# Claim to the wallet's own Midnight address.
npm run claim -- --secret <64 hex chars>

# Claim to a specific Midnight address.
npm run claim -- --secret <64 hex chars> --recipient mn_addr_preprod1...

# Use the claim file exported by the frontend.
npm run claim -- --file ./midnight-claim-xxxx.json
```

The proof is generated locally by the proof server. The secret never leaves the
machine and is not published on-chain.

## Status

```bash
npm run status
npm run status -- --commitment <64 hex chars>
```

Reads the public indexer only; no wallet or proof server is required.

## End-to-end demo

```bash
npm run demo -- --amount 1
```

The demo derives a secret, prints the two domain-separated commitments, registers
the Midnight commitment as the relayer, claims it, and prints the final ledger
state. It runs both sides from one funded wallet so the flow is reproducible; in
production the user runs `claim` from their own wallet.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `MIDNIGHT_NETWORK` | `preview`, `preprod` or `undeployed` |
| `MIDNIGHT_PROOF_SERVER` | Proof server URL (default `http://127.0.0.1:6300`) |
| `MIDNIGHT_WALLET_SEED` | Reuse a funded wallet (32–128 hex chars) |
| `MIDNIGHT_WALLET_MNEMONIC` | Reuse a Lace-compatible BIP-39 phrase |
| `MIDNIGHT_CONTRACT_ADDRESS` | Override the recorded deployment |
| `BRIDGE_ADMIN_SECRET` | Override the relayer admin secret (64 hex chars) |
| `NEAR_CONTRACT_ID` | NEAR contract to verify (default `near-midnight-bridge.testnet`) |
| `BLOCKFROST_PROJECT_ID` | Preprod indexer project id (starts with `nightpreprod`) |
| `PRIVATE_STATE_PASSWORD` | Password for the local private-state store |

## Notes

- tNIGHT uses 6 decimals (1 tNIGHT = 10^6 atomic units), matching NIGHT's STAR
  unit. `--amount` accepts decimal tNIGHT values.
- Preview is served by Midnight's own indexer and node. Preprod is served by
  Blockfrost and needs `BLOCKFROST_PROJECT_ID`.
- The Midnight wallet state is cached in `.midnight-wallet-state/<network>`.
  Deleting it forces a full resync.
- `contract/src/managed`, `.env`, `.midnight-state.json`,
  `.midnight-wallet-state/` and `.bridge-secrets.json` must never be committed.
