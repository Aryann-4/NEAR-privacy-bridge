import type { NearWalletBase } from "@hot-labs/near-connect";
import { actions } from "near-api-js";

/** Deployed NEAR testnet contract, overridable at build time. */
export const CONTRACT_ID =
  (import.meta.env.VITE_CONTRACT_ID as string | undefined)?.trim() ||
  "near-midnight-bridge.testnet";

export const NETWORK = "testnet" as const;

export const explorerTxUrl = (hash: string) =>
  `https://explorer.testnet.near.org/transactions/${hash}`;

export const explorerAccountUrl = (accountId: string) =>
  `https://explorer.testnet.near.org/accounts/${accountId}`;

const YOCTO_PER_NEAR = 10n ** 24n;
const GAS = 30_000_000_000_000n;

/** Convert a decimal NEAR amount to yoctoNEAR without floating-point math. */
export function nearToYocto(amount: string): bigint {
  const trimmed = amount.trim();
  if (!/^\d*(\.\d*)?$/.test(trimmed) || trimmed === "" || trimmed === ".") {
    throw new Error("Enter a valid NEAR amount.");
  }

  const [whole = "0", fraction = ""] = trimmed.split(".");
  if (fraction.length > 24) {
    throw new Error("NEAR supports at most 24 decimal places.");
  }

  return (
    BigInt(whole || "0") * YOCTO_PER_NEAR +
    BigInt((fraction + "0".repeat(24)).slice(0, 24))
  );
}

/** Decode a 32-byte hex commitment into the JSON array the contract expects. */
export function commitmentToBytes(commitment: string): number[] {
  const normalized = commitment.trim().toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]{64}$/.test(normalized)) {
    throw new Error("Commitment must be a 32-byte hex string.");
  }

  return Array.from({ length: 32 }, (_, index) =>
    parseInt(normalized.slice(index * 2, index * 2 + 2), 16)
  );
}

function txHashFrom(result: unknown): string {
  const outcome = result as {
    transaction_outcome?: { id?: string };
    transaction?: { hash?: string };
  };
  return outcome?.transaction_outcome?.id ?? outcome?.transaction?.hash ?? "";
}

function requireWallet(wallet: NearWalletBase | null): NearWalletBase {
  if (!wallet) throw new Error("Connect a NEAR wallet first.");
  return wallet;
}

/** Lock NEAR against a commitment through the deployed testnet contract. */
export async function depositToBridge(
  wallet: NearWalletBase | null,
  accountId: string,
  amountNear: string,
  commitment: string
): Promise<string> {
  const signer = requireWallet(wallet);
  const yocto = nearToYocto(amountNear);
  if (yocto <= 0n) throw new Error("Amount must be greater than zero.");

  const result = await signer.signAndSendTransaction({
    network: NETWORK,
    signerId: accountId,
    receiverId: CONTRACT_ID,
    actions: [
      actions.functionCall(
        "deposit",
        { amount: yocto.toString(), commitment: commitmentToBytes(commitment) },
        GAS,
        yocto
      ),
    ],
  });

  return txHashFrom(result);
}
