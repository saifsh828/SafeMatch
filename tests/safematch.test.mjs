import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const contract = await readFile(new URL('../contract/safematch_v2.compact', import.meta.url), 'utf8');
const proofClient = await readFile(new URL('../lib/prove-safematch-v2.ts', import.meta.url), 'utf8');

function ageInRange(dob, minAge, maxAge, currentDate) {
  return dob <= currentDate - minAge * 10_000 && dob >= currentDate - (maxAge + 1) * 10_000;
}

class LedgerModel {
  constructor() {
    this.providers = new Set();
    this.credentials = new Set();
    this.nullifiers = new Set();
  }

  addProvider(provider) {
    assert.equal(this.providers.has(provider), false);
    this.providers.add(provider);
  }

  issueCredential(commitment, provider) {
    assert.equal(this.providers.has(provider), true);
    assert.equal(this.credentials.has(commitment), false);
    this.credentials.add(commitment);
  }

  prove(commitment, provider, appId) {
    assert.equal(this.credentials.has(commitment), true);
    assert.equal(this.providers.has(provider), true);
    const nullifier = `${commitment}:${appId}`;
    assert.equal(this.nullifiers.has(nullifier), false);
    this.nullifiers.add(nullifier);
  }

  revokeCredential(commitment, provider) {
    assert.equal(this.providers.has(provider), true);
    assert.equal(this.credentials.delete(commitment), true);
  }
}

test('circuit logic accepts age boundaries and rejects out-of-range DOB', () => {
  const currentDate = 20260101;
  assert.match(contract, /disclose\(dob\(\)\) <= currentDate - minAge \* 10000/);
  assert.match(contract, /disclose\(dob\(\)\) >= currentDate - \(maxAge \+ 1\) \* 10000/);
  assert.equal(ageInRange(20000101, 25, 35, currentDate), true);
  assert.equal(ageInRange(20010102, 25, 35, currentDate), false);
  assert.equal(ageInRange(19890101, 25, 35, currentDate), false);
});

test('ledger transitions issue, consume once per app, and revoke credentials', () => {
  const ledger = new LedgerModel();
  ledger.addProvider('provider-1');
  ledger.issueCredential('commitment-1', 'provider-1');
  ledger.prove('commitment-1', 'provider-1', 'app-a');
  assert.throws(() => ledger.prove('commitment-1', 'provider-1', 'app-a'));
  ledger.prove('commitment-1', 'provider-1', 'app-b');
  ledger.revokeCredential('commitment-1', 'provider-1');
  assert.equal(ledger.credentials.has('commitment-1'), false);
});

test('private inputs stay witnesses and proof calls expose only policy inputs', () => {
  assert.match(contract, /witness secretId\(\)/);
  assert.match(contract, /witness dob\(\)/);
  assert.match(contract, /witness salt\(\)/);
  assert.match(contract, /witness providerId\(\)/);
  assert.doesNotMatch(contract, /ledger (?:secretId|dob|salt|providerId)/);
  assert.match(contract, /commitmentOf\(\)/);
  assert.match(contract, /nullifierFor\(appId\)/);
  assert.match(contract, /export circuit proveAgeInRange[\s\S]*\{[\s\S]*\n\}/);
  assert.doesNotMatch(proofClient, /args[^\n]*(?:secretId|dob|salt|providerId)/);
  assert.match(proofClient, /\[BigInt\(ageStart\), BigInt\(ageStart \+ 10\), currentDate, id\]/);
});
