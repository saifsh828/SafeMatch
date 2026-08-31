import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  secretId(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  dob(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  salt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  providerId(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  ownerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  providerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  addProvider(context: __compactRuntime.CircuitContext<PS>,
              providerKey_0: Uint8Array,
              authorization_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  removeProvider(context: __compactRuntime.CircuitContext<PS>,
                 providerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  commitment_0: Uint8Array,
                  providerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   commitment_0: Uint8Array,
                   providerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveAgeInRange(context: __compactRuntime.CircuitContext<PS>,
                  minAge_0: bigint,
                  maxAge_0: bigint,
                  currentDate_0: bigint,
                  appId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveVerifiedPerson(context: __compactRuntime.CircuitContext<PS>,
                      appId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveAgeAndVerified(context: __compactRuntime.CircuitContext<PS>,
                      minAge_0: bigint,
                      maxAge_0: bigint,
                      currentDate_0: bigint,
                      appId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  addProvider(context: __compactRuntime.CircuitContext<PS>,
              providerKey_0: Uint8Array,
              authorization_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  removeProvider(context: __compactRuntime.CircuitContext<PS>,
                 providerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  commitment_0: Uint8Array,
                  providerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   commitment_0: Uint8Array,
                   providerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveAgeInRange(context: __compactRuntime.CircuitContext<PS>,
                  minAge_0: bigint,
                  maxAge_0: bigint,
                  currentDate_0: bigint,
                  appId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveVerifiedPerson(context: __compactRuntime.CircuitContext<PS>,
                      appId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveAgeAndVerified(context: __compactRuntime.CircuitContext<PS>,
                      minAge_0: bigint,
                      maxAge_0: bigint,
                      currentDate_0: bigint,
                      appId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  addProvider(context: __compactRuntime.CircuitContext<PS>,
              providerKey_0: Uint8Array,
              authorization_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  removeProvider(context: __compactRuntime.CircuitContext<PS>,
                 providerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  issueCredential(context: __compactRuntime.CircuitContext<PS>,
                  commitment_0: Uint8Array,
                  providerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeCredential(context: __compactRuntime.CircuitContext<PS>,
                   commitment_0: Uint8Array,
                   providerKey_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveAgeInRange(context: __compactRuntime.CircuitContext<PS>,
                  minAge_0: bigint,
                  maxAge_0: bigint,
                  currentDate_0: bigint,
                  appId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveVerifiedPerson(context: __compactRuntime.CircuitContext<PS>,
                      appId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  proveAgeAndVerified(context: __compactRuntime.CircuitContext<PS>,
                      minAge_0: bigint,
                      maxAge_0: bigint,
                      currentDate_0: bigint,
                      appId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly owner: Uint8Array;
  trustedProviders: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  providerAuthorizations: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  issuedCommitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  usedNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
