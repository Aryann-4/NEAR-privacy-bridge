// NEAR testnet RPC helpers used by the relayer to verify a lock before
// registering the matching Midnight commitment.

const DEFAULT_NEAR_CONTRACT = 'near-midnight-bridge.testnet';
const NEAR_RPC = 'https://rpc.testnet.near.org';
const YOCTO_PER_NEAR = 10n ** 24n;

export interface NearDeposit {
  amount: string;
  sender: string;
  network: string;
  claimed: boolean;
}

function commitmentToBytes(commitment: string): number[] {
  const normalized = commitment.trim().toLowerCase().replace(/^0x/, '');
  if (!/^[0-9a-f]{64}$/.test(normalized)) {
    throw new Error('NEAR commitment must be a 32-byte hex string');
  }
  return Array.from({ length: 32 }, (_, index) =>
    Number.parseInt(normalized.slice(index * 2, index * 2 + 2), 16),
  );
}

export function nearContractId(): string {
  return process.env.NEAR_CONTRACT_ID?.trim() || DEFAULT_NEAR_CONTRACT;
}

/** Query the NEAR contract for a deposit. Returns null when no deposit exists. */
export async function viewNearDeposit(
  commitment: string,
  contractId = nearContractId(),
): Promise<NearDeposit | null> {
  const args = Buffer.from(JSON.stringify({ commitment: commitmentToBytes(commitment) })).toString(
    'base64',
  );

  const response = await fetch(NEAR_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'near-midnight-bridge',
      method: 'query',
      params: {
        request_type: 'call_function',
        finality: 'final',
        account_id: contractId,
        method_name: 'view_deposit',
        args_base64: args,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`NEAR RPC returned HTTP ${response.status}`);
  }

  const json = (await response.json()) as {
    error?: { message?: string };
    result?: { result?: number[] };
  };
  if (json.error) {
    throw new Error(`NEAR RPC error: ${json.error.message ?? 'unknown error'}`);
  }
  const bytes = json.result?.result;
  if (!bytes || bytes.length === 0) return null;

  return JSON.parse(Buffer.from(bytes).toString('utf-8')) as NearDeposit;
}

/** Format a yoctoNEAR amount as a decimal NEAR string. */
export function formatNear(yocto: string): string {
  const value = BigInt(yocto);
  const whole = value / YOCTO_PER_NEAR;
  const fraction = (value % YOCTO_PER_NEAR).toString().padStart(24, '0');
  return `${whole}.${fraction}`.replace(/\.?0+$/, '') || '0';
}

/** Convert yoctoNEAR to a whole-NEAR integer (for the demo's 1:1 rate). */
export function nearToWhole(yocto: string): bigint {
  return BigInt(yocto) / YOCTO_PER_NEAR;
}
