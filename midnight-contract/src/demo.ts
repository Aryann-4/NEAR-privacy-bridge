// End-to-end Midnight demo: derive a bridge secret, register it as the relayer,
// then claim it privately.
//
// Usage:
//   npm run demo                 # 1 tNIGHT
//   npm run demo -- --amount 2.5
//
// This runs both sides of the bridge from one funded wallet so the flow is easy
// to reproduce. In production the relayer runs `register` only after verifying
// the NEAR lock, and the user runs `claim` from their own Midnight wallet.

import './env.js';
import * as Rx from 'rxjs';
import { randomBytes } from 'node:crypto';
import { submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { CompiledBridgeContract, zkConfigPath } from './contract.js';
import { createProviders } from './providers.js';
import { loadWallet, requireDeployment, stopWallet, waitForProofServer } from './runtime.js';
import { getOrCreateAdminSecret, loadSecrets, recordDemoCommitments, saveSecrets } from './secrets.js';
import {
  formatAmount,
  midnightCommitment,
  nearCommitment,
  parseAmount,
  parseArgs,
  readLedger,
  recipientFromWallet,
  shortHex,
  toHex,
} from './common.js';

const PRIVATE_STATE_ID = 'nearMidnightBridgeDemo';

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const amount = parseAmount(args.get('amount') ?? '1');

  const runtime = await loadWallet();
  const contractAddress = requireDeployment(runtime.network);

  console.log('  Checking proof server...');
  await waitForProofServer(runtime.config);
  console.log('  ✅ Proof server ready.');

  const providers = createProviders(runtime.walletCtx, zkConfigPath, runtime.config);

  // Reuse the demo secret across runs when it is still unclaimed.
  const secrets = loadSecrets();
  let secret = secrets.demoUserSecret
    ? Uint8Array.from(Buffer.from(secrets.demoUserSecret, 'hex'))
    : randomBytes(32);
  if (!secrets.demoUserSecret) {
    secrets.demoUserSecret = Buffer.from(secret).toString('hex');
    saveSecrets(secrets);
  }

  let commitment = midnightCommitment(secret);
  let ledger = await readLedger(runtime.config, contractAddress);
  const isClaimed = (l: typeof ledger, key: string): boolean =>
    l.deposits.has(key) && (l.deposits.get(key) ?? 0n) === 0n;

  if (isClaimed(ledger, toHex(commitment))) {
    console.log('  Previous demo commitment already claimed — creating a new one.');
    secret = randomBytes(32);
    secrets.demoUserSecret = Buffer.from(secret).toString('hex');
    saveSecrets(secrets);
    commitment = midnightCommitment(secret);
    ledger = await readLedger(runtime.config, contractAddress);
  }

  const registered = ledger.deposits.get(toHex(commitment)) ?? 0n;

  console.log('\n─── Bridge secret ──────────────────────────────────────────────\n');
  console.log(`  Secret (private):      ${Buffer.from(secret).toString('hex')}`);
  console.log(`  NEAR commitment:       ${nearCommitment(secret)}`);
  console.log(`  Midnight commitment:   ${toHex(commitment)}`);
  console.log('\n  The two commitments use different hash domains, so publishing one');
  console.log('  does not reveal the other. Only the relayer sees both when it');
  console.log('  verifies the NEAR lock.\n');

  if (registered <= 0n) {
    console.log(`─── Registering ${formatAmount(amount)} tNIGHT ─────────────────────\n`);
    const tx = await submitCallTx(providers as any, {
      compiledContract: CompiledBridgeContract as any,
      contractAddress,
      privateStateId: `${PRIVATE_STATE_ID}-register`,
      circuitId: 'register',
      args: [getOrCreateAdminSecret(), commitment, amount],
    } as any);
    console.log(`  ✅ Registered. tx ${tx.public.txId}\n`);
  } else {
    console.log(`─── Already registered (${formatAmount(registered)} tNIGHT) ─────────\n`);
  }

  recordDemoCommitments(nearCommitment(secret), toHex(commitment));

  const state = await Rx.firstValueFrom(
    runtime.walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );
  const recipient = recipientFromWallet(state as any);

  console.log('─── Claiming privately ─────────────────────────────────────────\n');
  const claimTx = await submitCallTx(providers as any, {
    compiledContract: CompiledBridgeContract as any,
    contractAddress,
    privateStateId: `${PRIVATE_STATE_ID}-claim`,
    circuitId: 'claim',
    args: [secret, commitment, recipient],
  } as any);
  console.log(`  ✅ Claimed. tx ${claimTx.public.txId}\n`);

  const after = await readLedger(runtime.config, contractAddress);
  const balance = await Rx.firstValueFrom(
    runtime.walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );

  console.log('─── Final state ────────────────────────────────────────────────\n');
  console.log(`  Contract:         ${contractAddress}`);
  console.log(`  Registered:       ${after.registeredCount}`);
  console.log(`  Claimed:          ${after.claimedCount}`);
  console.log(`  Total locked:     ${formatAmount(after.totalLocked)} tNIGHT`);
  console.log(`  Total claimed:    ${formatAmount(after.totalClaimed)} tNIGHT`);
  console.log(`  Commitment:       ${shortHex(toHex(commitment))}`);
  console.log(`  Claimed flag:     ${isClaimed(after, toHex(commitment)) ? 'yes' : 'no'}`);
  console.log(
    `  Wallet tNIGHT:    ${formatAmount(balance.unshielded.balances[unshieldedToken().raw] ?? 0n)}`,
  );

  await stopWallet(runtime);
}

main().catch((error) => {
  console.error('\n❌ Demo failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
