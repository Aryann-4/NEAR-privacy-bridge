// Compiled bridge contract + ZK asset locations.

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as Bridge from '../contract/src/managed/bridge/contract/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Directory containing contract/, keys/ and zkir/ for the bridge contract. */
export const zkConfigPath = path.resolve(__dirname, '..', 'contract', 'src', 'managed', 'bridge');

export const CompiledBridgeContract = CompiledContract.make<
  Bridge.Contract<Record<string, never>>
>('bridge', Bridge.Contract<Record<string, never>>).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

export { Bridge };
export const pureCircuits = Bridge.pureCircuits;
