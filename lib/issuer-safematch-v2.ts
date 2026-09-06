/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { CompactTypeBytes, CompactTypeUnsignedInteger, CompactTypeVector, persistentHash } from '@midnight-ntwrk/compact-runtime';
import { createCallTxOptions, createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '../artifacts/safematch-v2/contract/index';
import type { ConnectedSession } from './midnight';
import { fromHex } from './midnight';
import { SAFEMATCH_PRIVATE_STATE_ID, saveDemoCredentialWitness } from './prove-safematch-v2';

export const ISSUER_PRIVATE_STATE_ID = 'SafeMatch-v2-demo-issuer';
const ZK_ASSET_PATH = '/zk/safematch-v2/';
const bytes32 = new CompactTypeBytes(32);
const uint32 = new CompactTypeUnsignedInteger(4294967295n, 4);
const vector3 = new CompactTypeVector(3, bytes32);
const vector4 = new CompactTypeVector(4, bytes32);

type IssuerState = { ownerSecret: Uint8Array; providerSecret: Uint8Array; providerId: Uint8Array; secretId: Uint8Array; dob: bigint; salt: Uint8Array };

function pad32(value: string): Uint8Array {
  const bytes = new TextEncoder().encode(value);
  const padded = new Uint8Array(32);
  if (bytes.length > 32) throw new Error(`Domain separator too long: ${value}`);
  padded.set(bytes);
  return padded;
}

function hash3(prefix: string, providerId: Uint8Array, providerSecret: Uint8Array): Uint8Array {
  return persistentHash(vector3, [pad32(prefix), providerId, providerSecret]);
}

export function credentialCommitment(state: Pick<IssuerState, 'secretId' | 'dob' | 'salt' | 'providerId'>): Uint8Array {
  return persistentHash(vector4, [state.secretId, bytes32.fromValue(uint32.toValue(state.dob)), state.salt, state.providerId]);
}

function issuerWitnesses() {
  return {
    secretId: (context: any) => [context.privateState, context.privateState.secretId],
    dob: (context: any) => [context.privateState, context.privateState.dob],
    salt: (context: any) => [context.privateState, context.privateState.salt],
    providerId: (context: any) => [context.privateState, context.privateState.providerId],
    ownerSecret: (context: any) => [context.privateState, context.privateState.ownerSecret],
    providerSecret: (context: any) => [context.privateState, context.privateState.providerSecret],
  };
}

function parseSecret(value: string, label: string): Uint8Array {
  if (!/^[0-9a-f]{64}$/i.test(value)) throw new Error(`${label} must be exactly 64 hexadecimal characters.`);
  return fromHex(value);
}

async function issuerCall(session: ConnectedSession, contractAddress: string, state: IssuerState, circuit: string, args: unknown[]): Promise<string> {
  session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set(ISSUER_PRIVATE_STATE_ID, state);
  const baseContract = CompiledContract.make('safematch_v2', Contract);
  const withWitnesses = (CompiledContract.withWitnesses as any)(baseContract, issuerWitnesses());
  const compiledContract = (CompiledContract.withCompiledFileAssets as any)(withWitnesses, ZK_ASSET_PATH);
  const options = createCallTxOptions(compiledContract, circuit, contractAddress, ISSUER_PRIVATE_STATE_ID, undefined, args as any);
  const tx = await createUnprovenCallTx(session.providers as any, options as any);
  return String(await submitTxAsync(session.providers as any, { unprovenTx: tx.private.unprovenTx, circuitId: circuit }));
}

export async function issueDemoCredential(session: ConnectedSession, contractAddress: string, ownerSecretHex: string, dobText: string) {
  if (session.config.networkId !== 'preprod') throw new Error('Issuer must use Midnight preprod.');
  if (!/^[0-9]{8}$/.test(dobText)) throw new Error('DOB must use YYYYMMDD format.');
  const state: IssuerState = {
    ownerSecret: parseSecret(ownerSecretHex, 'Owner authorization secret'),
    providerSecret: crypto.getRandomValues(new Uint8Array(32)), providerId: crypto.getRandomValues(new Uint8Array(32)),
    secretId: crypto.getRandomValues(new Uint8Array(32)), dob: BigInt(dobText), salt: crypto.getRandomValues(new Uint8Array(32)),
  };
  const providerAuthorization = hash3('safematch:provider:v1', state.providerId, state.providerSecret);
  const commitment = credentialCommitment(state);
  let registrationTxId = '';
  try { registrationTxId = await issuerCall(session, contractAddress, state, 'addProvider', [state.providerId, providerAuthorization]); }
  catch (error) { if (!String(error).includes('provider already trusted')) throw error; }
  let credentialTxId = '';
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      credentialTxId = await issuerCall(session, contractAddress, state, 'issueCredential', [commitment, state.providerId]);
      break;
    } catch (error) {
      const staleProviderState = String(error).includes('provider not trusted');
      if (!staleProviderState || attempt === 3) throw error;
      await new Promise((resolve) => window.setTimeout(resolve, 5000 * (attempt + 1)));
    }
  }
  session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set(SAFEMATCH_PRIVATE_STATE_ID, { secretId: state.secretId, dob: state.dob, salt: state.salt, providerId: state.providerId });
  saveDemoCredentialWitness(contractAddress, { secretId: state.secretId, dob: state.dob, salt: state.salt, providerId: state.providerId });
  return { registrationTxId, credentialTxId };
}
