// Shared helpers for the bridge CLI scripts.

import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { MidnightBech32m, UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { Bridge } from './contract.js';
import type { NetworkConfig, NetworkId } from './network.js';

/** tNIGHT uses the same 6-decimal atomic unit as NIGHT (1 NIGHT = 10^6 STAR). */
export const TNIGHT_DECIMALS = 6;
export const TNIGHT_ATOMIC = 10n ** BigInt(TNIGHT_DECIMALS);

export interface LedgerSnapshot {
  admin: string;
  tokenColor: string;
  registeredCount: bigint;
  claimedCount: bigint;
  totalLocked: bigint;
  totalClaimed: bigint;
  deposits: Map<string, bigint>;
  claimed: Map<string, boolean>;
}

export function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex');
}

export function parseHex32(value: string, label: string): Uint8Array {
  const hex = value.trim().replace(/^0x/i, '');
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(`${label} must be 32 bytes (64 hex characters)`);
  }
  return Uint8Array.from(Buffer.from(hex, 'hex'));
}

/** Parse a decimal tNIGHT amount ("1.5") into atomic units (1500000). */
export function parseAmount(value: string): bigint {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,6})?$/.test(trimmed)) {
    throw new Error(`amount must be a positive decimal with at most ${TNIGHT_DECIMALS} places`);
  }
  const [whole, fraction = ''] = trimmed.split('.');
  const padded = fraction.padEnd(TNIGHT_DECIMALS, '0');
  const atomic = BigInt(whole) * TNIGHT_ATOMIC + BigInt(padded);
  if (atomic <= 0n) throw new Error('amount must be greater than zero');
  return atomic;
}

/** Format atomic units as a decimal tNIGHT string. */
export function formatAmount(atomic: bigint): string {
  const whole = atomic / TNIGHT_ATOMIC;
  const fraction = (atomic % TNIGHT_ATOMIC).toString().padStart(TNIGHT_DECIMALS, '0');
  return `${whole}.${fraction}`.replace(/\.?0+$/, '') || '0';
}

/** Parse --key value / --key=value CLI arguments into a map. */
export function parseArgs(argv: string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const eq = arg.indexOf('=');
    if (eq !== -1) {
      out.set(arg.slice(2, eq), arg.slice(eq + 1));
    } else {
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        out.set(arg.slice(2), next);
        i++;
      } else {
        out.set(arg.slice(2), 'true');
      }
    }
  }
  return out;
}

export function requireArg(args: Map<string, string>, name: string): string {
  const value = args.get(name);
  if (!value || value === 'true') throw new Error(`Missing required --${name} argument`);
  return value;
}

/** SHA-256 over the raw secret bytes — matches the NEAR contract's hash_secret. */
export function nearCommitment(secret: Uint8Array): string {
  return `0x${createHash('sha256').update(secret).digest('hex')}`;
}

/** Domain-separated Midnight commitment for the same secret. */
export function midnightCommitment(secret: Uint8Array): Uint8Array {
  return Bridge.pureCircuits.midnightCommitment(secret);
}

/** Convert an unshielded bech32 address to Compact UserAddress bytes. */
export function recipientFromBech32(address: string, network: NetworkId): { bytes: Uint8Array } {
  const parsed = MidnightBech32m.parse(address.trim());
  const decoded = parsed.decode(UnshieldedAddress, network);
  return { bytes: new Uint8Array(decoded.data) };
}

/** Convert the wallet's own unshielded address to Compact UserAddress bytes. */
export function recipientFromWallet(state: { unshielded: { address: { data: Uint8Array } } }): {
  bytes: Uint8Array;
} {
  return { bytes: new Uint8Array(state.unshielded.address.data) };
}

/** Read and decode the bridge contract's public ledger state. */
export async function readLedger(
  config: NetworkConfig,
  contractAddress: string,
): Promise<LedgerSnapshot> {
  const provider = indexerPublicDataProvider(config.indexer, config.indexerWS);
  const contractState = await provider.queryContractState(contractAddress);
  if (!contractState) {
    throw new Error(`No contract state found at ${contractAddress}`);
  }
  const ledger = Bridge.ledger(contractState.data);

  const deposits = new Map<string, bigint>();
  for (const [key, amount] of ledger.deposits) {
    deposits.set(toHex(key), amount);
  }
  const claimed = new Map<string, boolean>();
  for (const [key, flag] of ledger.claimed) {
    claimed.set(toHex(key), flag);
  }

  return {
    admin: toHex(ledger.admin),
    tokenColor: toHex(ledger.tokenColor),
    registeredCount: ledger.registeredCount,
    claimedCount: ledger.claimedCount,
    totalLocked: ledger.totalLocked,
    totalClaimed: ledger.totalClaimed,
    deposits,
    claimed,
  };
}

export function shortHex(value: string, head = 10, tail = 8): string {
  return value.length <= head + tail + 3 ? value : `${value.slice(0, head)}…${value.slice(-tail)}`;
}
