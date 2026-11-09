// Print the relayer wallet's bech32 addresses without syncing the chain.
// Useful for funding the wallet from a faucet before the first sync finishes.

import './env.js';
import { Buffer } from 'node:buffer';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { HDWallet, Roles, createKeystore } from '@midnight-ntwrk/wallet-sdk';
import { resolveNetwork, getOrCreateWallet } from './network.js';

const { network } = resolveNetwork();
setNetworkId(network);

const credentials = getOrCreateWallet(network);
const hdWallet = HDWallet.fromSeed(Buffer.from(credentials.seed, 'hex'));
if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
const keys = hdWallet.hdWallet
  .selectAccount(0)
  .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
  .deriveKeysAt(0);
if (keys.type !== 'keysDerived') throw new Error('Key derivation failed');
hdWallet.hdWallet.clear();

const keystore = createKeystore(keys.keys[Roles.NightExternal], network);
console.log(`Network: ${network}`);
console.log(`Address: ${keystore.getBech32Address().toString()}`);
