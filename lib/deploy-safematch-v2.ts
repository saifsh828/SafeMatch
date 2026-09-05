/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '../artifacts/safematch-v2/contract/index';
import type { ConnectedSession } from './midnight';

const CONTRACT_NAME = 'safematch_v2';
const PRIVATE_STATE_ID = 'SafeMatch-v2-browser-deploy';
const ZK_ASSET_PATH = '/zk/safematch-v2/';

export async function deploySafeMatchV2(
  session: ConnectedSession,
): Promise<{ contractAddress: string; transactionId: string; ownerSecret: Uint8Array }> {
  // Contract constructor validates every witness even though deployment does
  // not execute a circuit that reads them.
  const deploymentWitnesses = {
    secretId: (context: any) => [context.privateState, new Uint8Array(32)],
    dob: (context: any) => [context.privateState, 0n],
    salt: (context: any) => [context.privateState, new Uint8Array(32)],
    providerId: (context: any) => [context.privateState, new Uint8Array(32)],
    ownerSecret: (context: any) => [context.privateState, context.privateState.ownerSecret],
    providerSecret: (context: any) => [context.privateState, new Uint8Array(32)],
  };
  const baseContract = CompiledContract.make(CONTRACT_NAME, Contract);
  // Generated contract typings are generic over private-state shape;
  // runtime API still accepts this generated witness object.
  // SDK passes this value directly to generated `new Contract(...)`.
  const withWitnesses = (CompiledContract.withWitnesses as any)(baseContract, deploymentWitnesses);
  const compiledContract = (CompiledContract.withCompiledFileAssets as any)(withWitnesses, ZK_ASSET_PATH);
  const signingKey = sampleSigningKey();
  const ownerSecret = crypto.getRandomValues(new Uint8Array(32));

  const deployTxData = await (createUnprovenDeployTx as any)(
    {
      zkConfigProvider: session.providers.zkConfigProvider,
      walletProvider: session.providers.walletProvider,
    },
    {
      compiledContract,
      args: [],
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: { ownerSecret },
      signingKey,
    },
  );

  const transactionId = await (submitTxAsync as any)(session.providers, {
    unprovenTx: deployTxData.private.unprovenTx,
  });
  const contractAddress = String(deployTxData.public.contractAddress);

  session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set(PRIVATE_STATE_ID, deployTxData.private.initialPrivateState);
  await session.providers.privateStateProvider.setSigningKey(
    contractAddress,
    deployTxData.private.signingKey ?? signingKey,
  );

  return { contractAddress, transactionId: String(transactionId), ownerSecret };
}
