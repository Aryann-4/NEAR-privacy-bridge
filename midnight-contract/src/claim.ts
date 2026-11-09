// Claim a registered Midnight commitment with the private secret.
//
// Usage:
//   npm run claim -- --secret <64 hex chars>
//   npm run claim -- --secret <64 hex chars> --recipient mn_addr_preview1...
//   npm run claim -- --file ./midnight-claim-xxxx.json
//
// The claim proves knowledge of the secret in zero knowledge. The transaction
// reveals only the commitment, its nullifier and the recipient — never the
// NEAR lock, the NEAR sender, or the secret itself.

import './env.js';
import * as fs from 'node:fs';
import * as Rx from 'rxjs';
import { submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { Bridge, CompiledBridgeContract, zkConfigPath } from './contract.js';
import { createProviders } from './providers.js';
import { loadWallet, requireDeployment, stopWallet, waitForProofServer } from './runtime.js';
import {
  formatAmount,
  midnightCommitment,
  parseArgs,
  parseHex32,
  readLedger,
  recipientFromBech32,
  recipientFromWallet,
  shortHex,
  toHex,
} from './common.js';

const PRIVATE_STATE_ID = 'nearMidnightBridgeClaim';

function secretFromArgs(args: Map<string, string>): Uint8Array {
  const direct = args.get('secret');
  if (direct && direct !== 'true') return parseHex32(direct, 'secret');

  const file = args.get('file');
  if (file && file !== 'true') {
    const payload = JSON.parse(fs.readFileSync(file, 'utf-8')) as { secret?: string };
    if (!payload.secret) throw new Error(`${file} does not contain a "secret" field`);
    return parseHex32(payload.secret, 'secret from claim file');
  }

  throw new Error('Provide --secret <64 hex chars> or --file <claim.json>');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const secret = secretFromArgs(args);
  const commitment = midnightCommitment(secret);

  const runtime = await loadWallet();
  const contractAddress = requireDeployment(runtime.network);

  const recipientArg = args.get('recipient');
  const state = await Rx.firstValueFrom(
    runtime.walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );
  const recipient =
    recipientArg && recipientArg !== 'true'
      ? recipientFromBech32(recipientArg, runtime.network)
      : recipientFromWallet(state as any);

  const ledger = await readLedger(runtime.config, contractAddress);
  const registered = ledger.deposits.get(toHex(commitment)) ?? 0n;
  if (registered <= 0n) {
    throw new Error(
      `Commitment ${toHex(commitment)} is not registered on ${contractAddress}. ` +
        'The relayer must verify the NEAR lock and register it first.',
    );
  }

  console.log('  Checking proof server...');
  await waitForProofServer(runtime.config);
  console.log('  ✅ Proof server ready.');

  const providers = createProviders(runtime.walletCtx, zkConfigPath, runtime.config);

  console.log(`\n  Claiming ${formatAmount(registered)} tNIGHT...`);
  console.log(`  Commitment: ${shortHex(toHex(commitment))}`);
  console.log(`  Recipient:  ${recipientArg && recipientArg !== 'true' ? recipientArg : 'own wallet'}`);

  const result = await submitCallTx(providers as any, {
    compiledContract: CompiledBridgeContract as any,
    contractAddress,
    privateStateId: PRIVATE_STATE_ID,
    circuitId: 'claim',
    args: [secret, commitment, recipient],
  } as any);

  const after = await readLedger(runtime.config, contractAddress);
  const balance = await Rx.firstValueFrom(
    runtime.walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );
  const tnight = balance.unshielded.balances[unshieldedToken().raw] ?? 0n;
  const nullifier = Bridge.pureCircuits.nullifier(secret);

  console.log('\n  ✅ Claimed privately.\n');
  console.log(`  Transaction:   ${result.public.txId}`);
  console.log(`  Block:         ${result.public.blockHeight}`);
  console.log(`  Nullifier:     ${shortHex(toHex(nullifier))}`);
  console.log(`  Total claimed: ${formatAmount(after.totalClaimed)} tNIGHT`);
  console.log(`  Claimed count: ${after.claimedCount}`);
  console.log(`  Wallet tNIGHT: ${formatAmount(tnight)}`);

  await stopWallet(runtime);
}

main().catch((error) => {
  console.error('\n❌ Claim failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
