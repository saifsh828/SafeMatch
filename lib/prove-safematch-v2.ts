/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createCallTxOptions, createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '../artifacts/safematch-v2/contract/index';
import { fromHex, toHex } from './midnight';
import type { ConnectedSession } from './midnight';
import { isContractAddress } from './constants';

export const SAFEMATCH_PRIVATE_STATE_ID = 'SafeMatch-v2-browser-proof';
const ZK_ASSET_PATH = '/zk/safematch-v2/';
const DEMO_CREDENTIAL_STORAGE_KEY = 'safematch:demo-credential:v2';

type ProofCircuit = 'proveAgeInRange' | 'proveVerifiedPerson' | 'proveAgeAndVerified';

async function appId(): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('safematch-web-preprod'));
  return new Uint8Array(digest);
}

function proofWitnesses() {
  return {
    secretId: (context: any) => [context.privateState, context.privateState.secretId],
    dob: (context: any) => [context.privateState, context.privateState.dob],
    salt: (context: any) => [context.privateState, context.privateState.salt],
    providerId: (context: any) => [context.privateState, context.privateState.providerId],
    ownerSecret: (context: any) => [context.privateState, new Uint8Array(32)],
    providerSecret: (context: any) => [context.privateState, new Uint8Array(32)],
  };
}

function assertCredentialWitnesses(value: unknown): asserts value is {
  secretId: Uint8Array;
  dob: bigint;
  salt: Uint8Array;
  providerId: Uint8Array;
} {
  const state = value as Partial<Record<'secretId' | 'salt' | 'providerId', Uint8Array>> & { dob?: bigint };
  const validBytes = (bytes: unknown) => bytes instanceof Uint8Array && bytes.length === 32;
  if (!validBytes(state.secretId) || !validBytes(state.salt) || !validBytes(state.providerId) || typeof state.dob !== 'bigint' || state.dob <= 0n) {
    throw new Error('Invalid credential witness. Issuer must provision 32-byte secretId, salt, providerId, and positive dob.');
  }
}

function restoreDemoCredential(session: ConnectedSession, contractAddress: string): unknown {
  if (typeof window === 'undefined') return null;
  const encoded = window.sessionStorage.getItem(DEMO_CREDENTIAL_STORAGE_KEY);
  if (!encoded) return null;
  try {
    const stored = JSON.parse(encoded) as { contractAddress: string; secretId: string; dob: string; salt: string; providerId: string };
    if (stored.contractAddress !== contractAddress) return null;
    const hexBytes = (value: string) => {
      if (!/^[0-9a-f]{64}$/i.test(value)) throw new Error('invalid demo credential');
      return fromHex(value);
    };
    const state = { secretId: hexBytes(stored.secretId), dob: BigInt(stored.dob), salt: hexBytes(stored.salt), providerId: hexBytes(stored.providerId) };
    session.providers.privateStateProvider.setContractAddress(contractAddress);
    void session.providers.privateStateProvider.set(SAFEMATCH_PRIVATE_STATE_ID, state);
    return state;
  } catch {
    window.sessionStorage.removeItem(DEMO_CREDENTIAL_STORAGE_KEY);
    return null;
  }
}

export function saveDemoCredentialWitness(contractAddress: string, state: { secretId: Uint8Array; dob: bigint; salt: Uint8Array; providerId: Uint8Array }): void {
  if (typeof window === 'undefined') return;
  const encode = (value: Uint8Array) => toHex(value);
  window.sessionStorage.setItem(DEMO_CREDENTIAL_STORAGE_KEY, JSON.stringify({ contractAddress, secretId: encode(state.secretId), dob: state.dob.toString(), salt: encode(state.salt), providerId: encode(state.providerId) }));
}

export async function credentialWitnessLoaded(
  session: ConnectedSession,
  contractAddress: string,
): Promise<boolean> {
  if (!isContractAddress(contractAddress)) return false;
  session.providers.privateStateProvider.setContractAddress(contractAddress);
  const privateState = await session.providers.privateStateProvider.get(SAFEMATCH_PRIVATE_STATE_ID) ?? restoreDemoCredential(session, contractAddress);
  if (!privateState) return false;
  try {
    assertCredentialWitnesses(privateState);
    return true;
  } catch {
    return false;
  }
}

export async function proveSafeMatch(
  session: ConnectedSession,
  contractAddress: string,
  circuit: ProofCircuit,
  ageStart: number,
): Promise<string> {
  if (session.config.networkId !== 'preprod') {
    throw new Error(`Proof blocked: wallet connected to ${session.config.networkId}, not Midnight preprod.`);
  }
  if (!isContractAddress(contractAddress)) {
    throw new Error('Proof blocked: configured contract address is invalid. Select a valid Midnight preprod contract first.');
  }
  if (!Number.isInteger(ageStart) || ageStart < 18 || ageStart > 45) {
    throw new Error('Proof blocked: age range must start between 18 and 45.');
  }

  session.providers.privateStateProvider.setContractAddress(contractAddress);
  const privateState = await session.providers.privateStateProvider.get(SAFEMATCH_PRIVATE_STATE_ID);
  if (!privateState) {
    throw new Error('No credential witness loaded. An approved issuer must provision secretId, dob, salt, and providerId first.');
  }
  assertCredentialWitnesses(privateState);

  const baseContract = CompiledContract.make('safematch_v2', Contract);
  const withWitnesses = (CompiledContract.withWitnesses as any)(baseContract, proofWitnesses());
  const compiledContract = (CompiledContract.withCompiledFileAssets as any)(withWitnesses, ZK_ASSET_PATH);
  const id = await appId();
  const currentDate = BigInt(new Date().toISOString().slice(0, 10).replaceAll('-', ''));
  const args = circuit === 'proveVerifiedPerson'
    ? [id]
    : circuit === 'proveAgeInRange'
      ? [BigInt(ageStart), BigInt(ageStart + 10), currentDate, id]
      : [BigInt(ageStart), BigInt(ageStart + 10), currentDate, id];

  const options = createCallTxOptions(
    compiledContract,
    circuit,
    contractAddress,
    SAFEMATCH_PRIVATE_STATE_ID,
    undefined,
    args as any,
  );
  const tx = await createUnprovenCallTx(session.providers as any, options as any);
  return String(await submitTxAsync(session.providers as any, {
    unprovenTx: tx.private.unprovenTx,
    circuitId: circuit,
  }));
}
