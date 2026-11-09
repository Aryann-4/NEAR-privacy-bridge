// Deploy the bridge contract to Midnight Preview (or Preprod).
//
// Usage:
//   npm run deploy
//
// Requires a funded wallet (tNIGHT for escrow + DUST for fees) and a running
// proof server at MIDNIGHT_PROOF_SERVER (default http://127.0.0.1:6300).

import './env.js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { fromHex } from '@midnight-ntwrk/midnight-js-utils';
import { recordDeployment } from './network.js';
import { CompiledBridgeContract, zkConfigPath } from './contract.js';
import { createProviders } from './providers.js';
import { loadWallet, stopWallet, waitForProofServer } from './runtime.js';
import { getOrCreateAdminSecret } from './secrets.js';

const PRIVATE_STATE_ID = 'nearMidnightBridgeDeploy';

async function main(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   NEAR × Midnight Privacy Bridge — Midnight deployment        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const runtime = await loadWallet();

  console.log('  Checking proof server...');
  await waitForProofServer(runtime.config);
  console.log('  ✅ Proof server ready.\n');

  console.log('  Setting up providers...');
  const providers = createProviders(runtime.walletCtx, zkConfigPath, runtime.config);

  const adminSecret = getOrCreateAdminSecret();
  const tokenColor = fromHex(unshieldedToken().raw);

  console.log('  Deploying bridge contract...\n');

  const MAX_RETRIES = 20;
  const RETRY_DELAY_MS = 5000;
  let deployed: Awaited<ReturnType<typeof deployContract>> | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      deployed = await deployContract(providers as any, {
        compiledContract: CompiledBridgeContract as any,
        args: [adminSecret, tokenColor],
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {},
      } as any);
      break;
    } catch (error: any) {
      const message = `${error?.message ?? error} ${error?.cause?.message ?? ''}`;
      const dustShortage =
        message.includes('Not enough Dust') ||
        message.includes('Insufficient Funds') ||
        message.includes('could not balance dust');

      if (dustShortage && attempt < MAX_RETRIES) {
        console.log(`  DUST not ready yet (attempt ${attempt}/${MAX_RETRIES}); retrying in 5s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        continue;
      }

      if (message.includes('Failed to connect to Proof Server') || message.includes('ECONNREFUSED')) {
        throw new Error(
          `Proof server unreachable at ${runtime.config.proofServer}. ` +
            'Start it with: midnight-proof-server -v',
        );
      }
      throw error;
    }
  }

  if (!deployed) throw new Error('Deployment failed after all retries');

  const contractAddress = (deployed as any).deployTxData.public.contractAddress;
  const txId = (deployed as any).deployTxData.public.txId;
  const blockHeight = (deployed as any).deployTxData.public.blockHeight;

  recordDeployment(runtime.network, contractAddress, runtime.address);

  console.log('  ✅ Bridge deployed.\n');
  console.log(`  Contract:     ${contractAddress}`);
  console.log(`  Transaction:  ${txId}`);
  console.log(`  Block:        ${blockHeight}`);
  console.log(`  Network:      ${runtime.network}`);
  console.log(`  Relayer:      ${runtime.address}\n`);
  console.log('  Saved to .midnight-state.json.');
  console.log('  Next: npm run register -- --commitment <hex> --amount <tNIGHT>\n');

  await stopWallet(runtime);
}

main().catch((error) => {
  console.error('\n❌ Deploy failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
