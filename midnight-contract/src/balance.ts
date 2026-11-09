// Print the relayer wallet's address and balances for the configured network.
// Syncs from scratch the first time, then resumes from cached state.

import './env.js';
import * as Rx from 'rxjs';
import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { resolveNetwork, getOrCreateWallet, formatWalletBackupNotice } from './network.js';
import { createWallet, persistWalletState } from './wallet.js';

(globalThis as any).WebSocket = WebSocket;

function formatAmount(value: bigint, decimals = 6): string {
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = (value % base).toString().padStart(decimals, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

async function main(): Promise<void> {
  const { network, config } = resolveNetwork();
  setNetworkId(network);

  const credentials = getOrCreateWallet(network);
  const notice = formatWalletBackupNotice(credentials, network);
  if (notice) console.log(notice);

  console.log(`\n  Network: ${network}`);
  console.log('  Building wallet...');
  const walletCtx = await createWallet({ network, networkConfig: config, seed: credentials.seed });
  const restored = Object.values(walletCtx.restored).filter(Boolean).length;
  if (restored > 0) console.log(`  Restored ${restored}/3 child wallets from cache.`);

  console.log('  Syncing with network...');
  const started = Date.now();
  const ticker = setInterval(() => {
    const elapsed = Math.round((Date.now() - started) / 1000);
    process.stdout.write(`\r  ⏳ Still syncing... (${elapsed}s elapsed)   `);
  }, 5000);
  // Persist during sync so a restart resumes from the last checkpoint instead
  // of replaying the whole chain.
  const checkpointer = setInterval(() => {
    persistWalletState(network, walletCtx).catch(() => {});
  }, 30_000);
  const state = await walletCtx.wallet.waitForSyncedState();
  clearInterval(ticker);
  clearInterval(checkpointer);
  process.stdout.write('\r  ✓ Synced with network.                                      \n');

  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  const dust = state.dust.balance(new Date());

  console.log(`\n  Address: ${address}`);
  console.log(`  tNIGHT:  ${formatAmount(balance)} (${balance} atomic)`);
  console.log(`  DUST:    ${formatAmount(dust, 15)}`);

  if (balance === 0n) {
    console.log(`\n  ⚠ No tNIGHT. Fund this address at ${config.faucet}`);
  } else {
    console.log('\n  ✅ Wallet is funded.');
  }

  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
}

main().catch((error) => {
  console.error('\n❌ Balance check failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
