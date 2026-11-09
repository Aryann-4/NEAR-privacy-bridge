// Shared runtime: wallet sync, faucet/DUST setup, proof-server readiness.

import * as Rx from 'rxjs';
import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import {
  resolveNetwork,
  getOrCreateWallet,
  getDeployment,
  type NetworkConfig,
  type NetworkId,
} from './network.js';
import {
  createWallet,
  persistWalletState,
  type WalletContext,
} from './wallet.js';

(globalThis as any).WebSocket = WebSocket;

export interface BridgeRuntime {
  network: NetworkId;
  config: NetworkConfig;
  walletCtx: WalletContext;
  address: string;
}

export async function waitForProofServer(config: NetworkConfig, timeoutMs = 120_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(config.proofServer, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok || response.status < 500) return;
    } catch {
      // keep waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(
    `Proof server not responding at ${config.proofServer}. Start it with: midnight-proof-server -v`,
  );
}

function startSyncTicker(): () => void {
  const start = Date.now();
  const interval = setInterval(() => {
    const elapsed = Math.round((Date.now() - start) / 1000);
    process.stdout.write(`\r  ⏳ Still syncing... (${elapsed}s elapsed)   `);
  }, 5000);
  return () => {
    clearInterval(interval);
    process.stdout.write('\r  ✓ Synced with network.                                      \n');
  };
}

async function waitForFunding(
  walletCtx: WalletContext,
  config: NetworkConfig,
  network: NetworkId,
  address: string,
): Promise<void> {
  if (network === 'undeployed' || !config.faucet) return;

  const timeoutMs = Number(process.env.MIDNIGHT_FAUCET_TIMEOUT_MS ?? 600_000);
  const start = Date.now();
  let announced = false;

  while (true) {
    const state = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
    const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    if (balance > 0n) {
      console.log(`  ✅ Funded. tNIGHT balance: ${balance.toLocaleString()}\n`);
      return;
    }

    if (!announced) {
      console.log('─── Fund the relayer wallet ────────────────────────────────────\n');
      console.log(`  Wallet address: ${address}`);
      console.log(`  Faucet:         ${config.faucet}`);
      console.log('  Waiting for tNIGHT (poll every 10s)...\n');
      announced = true;
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error(
        `Wallet ${address} has no tNIGHT after ${Math.round(timeoutMs / 60_000)} min. ` +
          `Fund it at ${config.faucet} and re-run.`,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
}

async function ensureDust(walletCtx: WalletContext): Promise<void> {
  const state = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const unregisteredUtxos = state.unshielded.availableCoins.filter(
    (coin: any) => !coin.meta?.registeredForDustGeneration,
  );

  if (unregisteredUtxos.length > 0) {
    console.log(`  Registering ${unregisteredUtxos.length} NIGHT UTXO(s) for DUST generation...`);
    const recipe = await walletCtx.wallet.registerNightUtxosForDustGeneration(
      unregisteredUtxos,
      walletCtx.unshieldedKeystore.getPublicKey(),
      (payload) => walletCtx.unshieldedKeystore.signData(payload),
    );
    const finalized = await walletCtx.wallet.finalizeRecipe(recipe);
    await walletCtx.wallet.submitTransaction(finalized);
  }

  const dust = await Rx.firstValueFrom(
    walletCtx.wallet.state().pipe(
      Rx.filter((s) => s.isSynced),
      Rx.map((s) => s.dust.balance(new Date())),
    ),
  );
  if (dust === 0n) {
    console.log('  Waiting for DUST tokens...');
    await Rx.firstValueFrom(
      walletCtx.wallet.state().pipe(
        Rx.throttleTime(5000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n),
      ),
    );
  }
}

export async function loadWallet(seedOverride?: string): Promise<BridgeRuntime> {
  const { network, config } = resolveNetwork();
  setNetworkId(network);

  const credentials = seedOverride
    ? { seed: seedOverride, mnemonic: null, created: false }
    : getOrCreateWallet(network);
  const seed = credentials.seed;

  if (credentials.created && credentials.mnemonic) {
    console.log('\n  New Midnight wallet generated. Recovery phrase:\n');
    console.log(`    ${credentials.mnemonic}\n`);
    console.log('  Write it down. It restores the same wallet in Lace.\n');
  }

  console.log(`  Building ${network} wallet...`);
  const walletCtx = await createWallet({ network, networkConfig: config, seed });
  const restored = Object.values(walletCtx.restored).filter(Boolean).length;
  if (restored > 0) {
    console.log(`  Restored ${restored}/3 child wallets from cache.`);
  }

  console.log('  Syncing with network (this may take several minutes)...');
  const stopTicker = startSyncTicker();
  // Checkpoint during sync so a restart resumes instead of replaying the chain.
  const checkpointer = setInterval(() => {
    persistWalletState(network, walletCtx).catch(() => {});
  }, 30_000);
  const state = await walletCtx.wallet.waitForSyncedState();
  clearInterval(checkpointer);
  stopTicker();
  await persistWalletState(network, walletCtx);

  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  const balance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`  Address: ${address}`);
  console.log(`  tNIGHT:  ${balance.toLocaleString()}\n`);

  await waitForFunding(walletCtx, config, network, address);
  await ensureDust(walletCtx);

  return { network, config, walletCtx, address };
}

export function requireDeployment(network: NetworkId): string {
  const envAddress = process.env.MIDNIGHT_CONTRACT_ADDRESS?.trim();
  if (envAddress) return envAddress;

  const deployment = getDeployment(network);
  if (!deployment?.address) {
    throw new Error(
      `No bridge deployment on file for ${network}. Run \`npm run deploy\` first, ` +
        'or set MIDNIGHT_CONTRACT_ADDRESS.',
    );
  }
  return deployment.address;
}

export async function stopWallet(runtime: BridgeRuntime): Promise<void> {
  await persistWalletState(runtime.network, runtime.walletCtx);
  await runtime.walletCtx.wallet.stop();
}
