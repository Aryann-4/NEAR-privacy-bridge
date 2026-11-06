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

export function randomHex(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return bytesToHex(new Uint8Array(digest));
}

/** commitment = SHA-256(secret). Only the hash is published. */
export async function createCommitment(amount: string): Promise<CommitmentRecord> {
  const secret = randomHex(32);
  const commitment = `0x${await sha256Hex(secret)}`;

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
  if (!/^[0-9a-f]{64}$/.test(secret.trim().toLowerCase())) return false;

  const computed = await sha256Hex(secret.trim().toLowerCase());
  return computed === normalized;
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
  return `${hours}h ago`;
}
