// Register a Midnight commitment after the relayer verified the matching NEAR lock.
//
// Usage:
//   npm run register -- --secret <64 hex chars> --amount 1.5
//   npm run register -- --commitment <64 hex chars> --amount 1.5
//
// `register` pulls `amount` tNIGHT from the relayer wallet into the contract,
// so every registered commitment is fully backed.

import './env.js';
import { submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledBridgeContract, zkConfigPath } from './contract.js';
import { createProviders } from './providers.js';
import { loadWallet, requireDeployment, stopWallet, waitForProofServer } from './runtime.js';
import { getOrCreateAdminSecret } from './secrets.js';
import {
  formatAmount,
  midnightCommitment,
  nearCommitment,
  parseAmount,
  parseArgs,
  parseHex32,
  readLedger,
  requireArg,
  toHex,
} from './common.js';
import { formatNear, nearContractId, viewNearDeposit } from './near.js';

const PRIVATE_STATE_ID = 'nearMidnightBridgeRegister';

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const amount = parseAmount(requireArg(args, 'amount'));

  let commitment: Uint8Array;
  let nearLock: string | null = args.has('near-commitment')
    ? requireArg(args, 'near-commitment')
    : null;
  if (args.has('commitment')) {
    commitment = parseHex32(requireArg(args, 'commitment'), 'commitment');
  } else {
    const secret = parseHex32(requireArg(args, 'secret'), 'secret');
    commitment = midnightCommitment(secret);
    nearLock = nearCommitment(secret);
  }

  if (nearLock) {
    console.log(`  Verifying NEAR lock on ${nearContractId()}...`);
    const deposit = await viewNearDeposit(nearLock);
    if (!deposit) {
      throw new Error(
        `No NEAR deposit found for ${nearLock} on ${nearContractId()}. ` +
          'Lock NEAR on the bridge first or pass the correct commitment.',
      );
    }
    if (deposit.claimed) {
      throw new Error(`NEAR deposit ${nearLock} is already claimed`);
    }
    console.log(`  ✅ NEAR lock verified: ${formatNear(deposit.amount)} NEAR from ${deposit.sender}`);
  }

  const runtime = await loadWallet();
  const contractAddress = requireDeployment(runtime.network);

  console.log('  Checking proof server...');
  await waitForProofServer(runtime.config);
  console.log('  ✅ Proof server ready.');

  const before = await readLedger(runtime.config, contractAddress);
  console.log(`  Contract: ${contractAddress}`);
  console.log(`  Escrowed before: ${formatAmount(before.totalLocked)} tNIGHT`);

  const providers = createProviders(runtime.walletCtx, zkConfigPath, runtime.config);

  console.log(`\n  Registering ${formatAmount(amount)} tNIGHT...`);
  const result = await submitCallTx(providers as any, {
    compiledContract: CompiledBridgeContract as any,
    contractAddress,
    privateStateId: PRIVATE_STATE_ID,
    circuitId: 'register',
    args: [getOrCreateAdminSecret(), commitment, amount],
  } as any);

  const after = await readLedger(runtime.config, contractAddress);

  console.log('\n  ✅ Commitment registered.\n');
  console.log(`  Midnight commitment: ${toHex(commitment)}`);
  if (nearLock) console.log(`  NEAR commitment:     ${nearLock}`);
  console.log(`  Escrowed amount:     ${formatAmount(amount)} tNIGHT`);
  console.log(`  Transaction:         ${result.public.txId}`);
  console.log(`  Block:               ${result.public.blockHeight}`);
  console.log(`  Total locked:        ${formatAmount(after.totalLocked)} tNIGHT`);
  console.log(`  Registered count:    ${after.registeredCount}`);

  await stopWallet(runtime);
}

main().catch((error) => {
  console.error('\n❌ Register failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
