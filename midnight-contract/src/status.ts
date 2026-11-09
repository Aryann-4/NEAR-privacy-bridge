// Show the bridge contract's public state.
//
// Usage:
//   npm run status
//   npm run status -- --commitment <64 hex chars>
//
// Reads only the public indexer; no wallet or proof server is required.

import './env.js';
import { WebSocket } from 'ws';
import { getDeployment, resolveNetwork } from './network.js';
import { formatAmount, parseArgs, parseHex32, readLedger, shortHex, toHex } from './common.js';

(globalThis as any).WebSocket = WebSocket;

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const { network, config } = resolveNetwork();
  const contractAddress =
    process.env.MIDNIGHT_CONTRACT_ADDRESS?.trim() || getDeployment(network)?.address;

  if (!contractAddress) {
    throw new Error(
      `No bridge deployment on file for ${network}. Run \`npm run deploy\` or set MIDNIGHT_CONTRACT_ADDRESS.`,
    );
  }

  const ledger = await readLedger(config, contractAddress);

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║        NEAR × Midnight Privacy Bridge — contract state       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`  Network:          ${network}`);
  console.log(`  Contract:         ${contractAddress}`);
  console.log(`  Admin:            ${shortHex(ledger.admin)}`);
  console.log(`  Token color:      ${shortHex(ledger.tokenColor)}`);
  console.log(`  Registered:       ${ledger.registeredCount}`);
  console.log(`  Claimed:          ${ledger.claimedCount}`);
  console.log(`  Total locked:     ${formatAmount(ledger.totalLocked)} tNIGHT`);
  console.log(`  Total claimed:    ${formatAmount(ledger.totalClaimed)} tNIGHT`);
  console.log(`  Open deposits:    ${[...ledger.deposits.values()].filter((v) => v > 0n).length}`);

  if (args.has('commitment')) {
    const key = toHex(parseHex32(args.get('commitment')!, 'commitment'));
    const known = ledger.deposits.has(key);
    const amount = ledger.deposits.get(key) ?? 0n;
    const claimed = known && amount === 0n;
    console.log('\n  Commitment lookup:');
    console.log(`    ${key}`);
    console.log(`    registered: ${known ? 'yes' : 'no'}`);
    console.log(`    amount:     ${formatAmount(amount)} tNIGHT`);
    console.log(`    claimed:    ${claimed ? 'yes' : 'no'}`);
  }

  console.log('');
}

main().catch((error) => {
  console.error('\n❌ Status failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
