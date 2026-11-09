export type CommitmentRecord = {
  id: string;
  commitment: string;
  secret: string;
  amount: string;
  createdAt: number;
};

const encoder = new TextEncoder();

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array | null {
  const normalized = hex.trim().toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]+$/.test(normalized) || normalized.length % 2 !== 0) {
    return null;
  }
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function randomHex(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const data = typeof input === "string" ? encoder.encode(input) : input;
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(digest));
}

/**
 * commitment = SHA-256(secret bytes). Only the hash is published.
 *
 * The secret is exported as 64 hex characters; both the NEAR test contract and
 * the Midnight claim CLI hash the same 32 raw bytes, so the two sides agree.
 */
export async function createCommitment(amount: string): Promise<CommitmentRecord> {
  const secret = randomHex(32);
  const secretBytes = hexToBytes(secret);
  if (!secretBytes) throw new Error("Failed to generate a valid secret");
  const commitment = `0x${await sha256Hex(secretBytes)}`;

  return {
    id: randomHex(8),
    commitment,
    secret,
    amount,
    createdAt: Date.now(),
  };
}

export async function verifyCommitment(
  commitment: string,
  secret: string
): Promise<boolean> {
  const normalized = commitment.trim().toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]{64}$/.test(normalized)) return false;

  const secretBytes = hexToBytes(secret);
  if (!secretBytes) return false;

  // Canonical form: SHA-256 over the raw 32 secret bytes.
  if ((await sha256Hex(secretBytes)) === normalized) return true;

  // Backwards compatibility with the Phase 1 browser build, which hashed the
  // UTF-8 bytes of the hex string instead of the decoded secret.
  return (await sha256Hex(secret.trim().toLowerCase())) === normalized;
}

export function shortHash(value: string, head = 10, tail = 8): string {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
