/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ContractState } from '@midnight-ntwrk/compact-runtime';
import { LedgerParameters, ZswapChainState } from '@midnight-ntwrk/ledger-v8';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import type { MidnightProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';

export const PREPROD_NETWORK_ID = 'preprod';
// Configure the SDK globally before any wallet or generated-contract module can use it.
setNetworkId(PREPROD_NETWORK_ID);

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) throw new Error('Invalid hex string from wallet.');
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

export type ConnectedSession = {
  api: any;
  config: any;
  providers: {
    privateStateProvider: ReturnType<typeof createPrivateStateProvider>;
    publicDataProvider: ReturnType<typeof createPatchedPublicDataProvider>;
    zkConfigProvider: FetchZkConfigProvider<any>;
    proofProvider: { proveTx: (unprovenTx: any) => Promise<any> };
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
  };
  unshieldedAddress: string;
};

// Shared across same-tab route changes. Production should replace with
// encrypted wallet-backed private-state storage.
const privateStateStore = new Map<string, unknown>();
const signingKeyStore = new Map<string, unknown>();

export function detectWallet(): Promise<any | null> {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      const wallet = (window as any).midnight?.['1am'];
      if (wallet) {
        resolve(wallet);
        return;
      }
      if (++attempts > 50) {
        resolve(null);
        return;
      }
      window.setTimeout(check, 100);
    };
    check();
  });
}

function createPrivateStateProvider() {
  let scope = '';
  const key = (id: string) => `${scope}:${id}`;
  return {
    setContractAddress(address: string) { scope = address; },
    async set(id: string, state: unknown) { privateStateStore.set(key(id), state); },
    async get(id: string) { return privateStateStore.get(key(id)) ?? null; },
    async remove(id: string) { privateStateStore.delete(key(id)); },
    async clear() { for (const storedKey of privateStateStore.keys()) if (storedKey.startsWith(`${scope}:`)) privateStateStore.delete(storedKey); },
    async setSigningKey(address: string, signingKey: unknown) { signingKeyStore.set(address, signingKey); },
    async getSigningKey(address: string) { return signingKeyStore.get(address) ?? null; },
    async removeSigningKey(address: string) { signingKeyStore.delete(address); },
    async clearSigningKeys() { signingKeyStore.clear(); },
    async exportPrivateStates(): Promise<never> { throw new Error('Private state export is not configured.'); },
    async importPrivateStates(): Promise<never> { throw new Error('Private state import is not configured.'); },
    async exportSigningKeys(): Promise<never> { throw new Error('Signing key export is not configured.'); },
    async importSigningKeys(): Promise<never> { throw new Error('Signing key import is not configured.'); },
  };
}

function createPatchedPublicDataProvider(queryUrl: string, subscriptionUrl: string) {
  const base = indexerPublicDataProvider(queryUrl, subscriptionUrl);

  async function queryLatest(query: string, address: string) {
    const response = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables: { address } }),
    });
    if (!response.ok) throw new Error(`Indexer HTTP error: ${response.status}`);
    const payload = await response.json();
    if (payload.errors?.length) throw new Error(payload.errors.map((error: any) => error.message).join('; '));
    return payload.data?.contractAction ?? null;
  }

  return {
    ...base,
    async queryContractState(contractAddress: string, config?: any) {
      if (config) return base.queryContractState(contractAddress, config);
      const action = await queryLatest(`
        query LATEST_CONTRACT_STATE($address: HexEncoded!) {
          contractAction(address: $address) { state }
        }`, contractAddress);
      return action ? ContractState.deserialize(fromHex(action.state)) : null;
    },
    async queryZSwapAndContractState(contractAddress: string, config?: any) {
      if (config) return base.queryZSwapAndContractState(contractAddress, config);
      const action = await queryLatest(`
        query LATEST_BOTH_STATE($address: HexEncoded!) {
          contractAction(address: $address) {
            state
            zswapState
            transaction { block { ledgerParameters } }
          }
        }`, contractAddress);
      if (!action?.zswapState) return null;
      return [
        ZswapChainState.deserialize(fromHex(action.zswapState)),
        ContractState.deserialize(fromHex(action.state)),
        action.transaction?.block?.ledgerParameters
          ? LedgerParameters.deserialize(fromHex(action.transaction.block.ledgerParameters))
          : LedgerParameters.initialParameters(),
      ] as const;
    },
  };
}

export async function createConnectedSession(api: any, zkAssetBasePath: string): Promise<ConnectedSession> {
  const [config, unshieldedAddress, shieldedAddress, connectionStatus] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
    api.getConnectionStatus(),
  ]);

  if (config.networkId !== PREPROD_NETWORK_ID) {
    throw new Error(`Wallet connected to ${config.networkId}; switch 1AM to Midnight preprod.`);
  }
  if (!connectionStatus || connectionStatus.status !== 'connected') {
    throw new Error('1AM connected, but its wallet status is not ready.');
  }
  setNetworkId(config.networkId);

  const zkConfigProvider = new FetchZkConfigProvider(
    new URL(zkAssetBasePath, window.location.origin).toString(),
    window.fetch.bind(window),
  );
  const provingProvider = await api.getProvingProvider(zkConfigProvider);
  const proofProvider = {
    async proveTx(unprovenTx: any) {
      const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
      return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };

  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => shieldedAddress.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedAddress.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const balanced = await api.balanceUnsealedTransaction(toHex(tx.serialize()));
      if (!balanced?.tx) throw new Error('1AM wallet returned no balanced transaction.');
      const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
    },
  };

  const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      await api.submitTransaction(toHex(tx.serialize()));
      const transactionId = tx.identifiers()?.[0];
      if (!transactionId) throw new Error('Submitted transaction has no identifier.');
      return transactionId;
    },
  };

  return {
    api,
    config,
    providers: {
      privateStateProvider: createPrivateStateProvider(),
      publicDataProvider: createPatchedPublicDataProvider(config.indexerUri, config.indexerWsUri),
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
    unshieldedAddress: unshieldedAddress.unshieldedAddress,
  };
}

export async function fetchContractState(queryUrl: string, contractAddress: string): Promise<string | null> {
  const response = await fetch(queryUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: 'query($address: HexEncoded!) { contractAction(address: $address) { state } }',
      variables: { address: contractAddress },
    }),
  });
  const data = await response.json();
  return data?.data?.contractAction?.state ?? null;
}

export async function pollForState(
  queryUrl: string,
  contractAddress: string,
  onProgress?: (attempt: number) => void,
  maxAttempts = 120,
  intervalMs = 2000,
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    onProgress?.(attempt + 1);
    const state = await fetchContractState(queryUrl, contractAddress);
    if (state) return state;
    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
  }
  throw new Error(`Contract state not indexed after ${maxAttempts * intervalMs / 1000}s.`);
}
