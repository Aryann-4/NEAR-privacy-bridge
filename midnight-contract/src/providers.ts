// Midnight providers for the bridge contract.

import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { type WalletContext } from './wallet.js';
import { type NetworkConfig } from './network.js';

export type BridgeCircuits = 'register' | 'claim';
export type BridgeProviders = MidnightProviders<any>;

export function createProviders(
  walletCtx: WalletContext,
  zkConfigPath: string,
  config: NetworkConfig,
): BridgeProviders {
  // The SDK requires the private-state password to be at least 16 characters.
  const privateStatePassword =
    process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Near-Midnight-Bridge-Private-State-1';

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: walletCtx.shieldedSecretKeys,
          dustSecretKey: walletCtx.dustSecretKey,
        },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      // The wallet provider must sign the balancing recipe (including any
      // unshielded NIGHT/tNIGHT inputs it added) before finalizing it. Without
      // this the node rejects the call with InputsSignaturesLengthMismatch.
      const signed = await walletCtx.wallet.signRecipe(recipe, (data) =>
        walletCtx.unshieldedKeystore.signData(data),
      );
      return walletCtx.wallet.finalizeRecipe(signed);
    },
    submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
  };

  const zkConfigProvider = new NodeZkConfigProvider<BridgeCircuits>(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'near-midnight-bridge-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(config.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}
