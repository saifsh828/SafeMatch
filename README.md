# SafeMatch

Privacy-first identity and age verification for apps that need trust without collecting identity documents.

SafeMatch is a Next.js MVP backed by a Midnight Compact smart contract. A trusted issuer creates an on-chain commitment for a private credential. A holder then proves a narrow claim—age range, verified-person status, or both—through a zero-knowledge circuit. Date of birth, name, identity documents, and credential secrets stay private.

Product profile on X: [@0xsafematch](https://x.com/0xsafematch). Profile bio describes SafeMatch's zero-knowledge identity verification product, and profile contains a public product post.

## Live Demo

[Open SafeMatch on Midnight preprod](https://safe-match-eosin.vercel.app/)

## Links

| Resource | Link |
| --- | --- |
| Live preprod demo | [safe-match-eosin.vercel.app](https://safe-match-eosin.vercel.app/) |
| MVP demo video | [Watch on Google Drive](https://drive.google.com/file/d/1RpfrZgKRLzs8_2AHg3c3QMnRCUA4WAbF/view?usp=sharing) |
| Public GitHub repository | [saifsh828/SafeMatch](https://github.com/saifsh828/SafeMatch) |
| Contract on Midnight preprod | [Open explorer](https://preprod.midnight.network/contract/8e0308828b5f5ce5ec629f75760dfdb25e7d7de06a65835d00c182fb18966fd7) |
| Level 4 submission evidence | [Open checklist](docs/LEVEL-4-SUBMISSION.md) |
| Product X profile | [@0xsafematch](https://x.com/0xsafematch) |
| User feedback form | [Open Google Form](https://forms.gle/EN3ZuNWG33MNyqER9) |
| Feedback response sheet | [Open reviewer evidence](https://docs.google.com/spreadsheets/d/1YHq1RN4AvBvMVHUdhl5xSjDveUDxo0BTzei13aU8FX4/edit?usp=sharing) |
| Level 5/6 submission evidence | [Open checklist](docs/LEVEL-5-6-SUBMISSION.md) |

## Level 4 submission

See [`docs/LEVEL-4-SUBMISSION.md`](docs/LEVEL-4-SUBMISSION.md) for requirement-by-requirement evidence and verification commands.

## Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/screenshots/landing.png" alt="SafeMatch landing page" width="100%" />
      <br /><strong>Landing page</strong>
    </td>
    <td align="center" width="50%">
      <img src="docs/screenshots/deploy.png" alt="SafeMatch deployment page" width="100%" />
      <br /><strong>Preprod deployment</strong>
    </td>
  </tr>
</table>

## Contract Address

Current SafeMatch V2 registry address:

| Network | Address |
| --- | --- |
| Preprod | `8e0308828b5f5ce5ec629f75760dfdb25e7d7de06a65835d00c182fb18966fd7` |

```text
8e0308828b5f5ce5ec629f75760dfdb25e7d7de06a65835d00c182fb18966fd7
```

This is Midnight **preprod** software. Do not use real identity documents or production credentials.

## What This Product Does

SafeMatch gives dating, social, gaming, marketplace, and age-gated apps a narrow verification result without collecting raw identity data. Trusted issuers commit credentials on Midnight; holders decide whether to prove an age range, verified-person status, or both.

Midnight makes issuer trust, credential status, and replay protection publicly verifiable while keeping exact DOB, names, documents, and credential secrets in private witness state. Current build is a preprod MVP using synthetic issuer data, not a production identity service.

## Privacy Model

- **PUBLIC:** credential commitments, trusted provider state, selected policy inputs, app-specific nullifiers, and transaction result.
- **PRIVATE:** `secretId`, exact DOB, salt, provider secret, owner secret, name, and identity documents.
- **PROVED WITHOUT REVEALING:** holder owns an active trusted credential and satisfies selected age/verified-person policy.

## Tech Stack

Next.js 16, React 19, TypeScript, Midnight Compact, Midnight.js, 1AM connector, Framer Motion, Node.js 22, and GitHub Actions.

## Product flow

1. A trusted issuer verifies identity and date of birth off-chain.
2. Issuer creates a private credential witness: `secretId`, `dob`, `salt`, and `providerId`.
3. Registry stores only the credential commitment and provider authorization commitment.
4. Holder connects the 1AM browser extension and selects a claim.
5. 1AM loads proving assets, generates and balances the proof, signs the transaction, and submits it to Midnight preprod.
6. Contract checks the credential, issuer trust, age policy, and app-specific nullifier. Only the selected claim is accepted by the app.

## Current MVP boundary

Included:

- Browser wallet connection through 1AM.
- Browser-only SafeMatch V2 deployment.
- Compact contract for provider management, credential commitments, revocation, and selective-disclosure proofs.
- Preprod proof flow for age range, verified person, or both.
- Local demo issuer route for synthetic credential smoke tests.
- Privacy and technical documentation routes.

Not included:

- Production issuer onboarding or background-check integration.
- DID/VC exchange, encrypted credential wallet, or credential recovery.
- Production security, legal, compliance, or identity-provider review.
- Real identity verification. `/issuer` creates synthetic demo values only.

## Prerequisites

- Node.js 22 or newer
- npm
- Midnight Compact compiler, version `0.31.0` or compatible CLI
- 1AM browser extension configured for Midnight preprod
- 1AM ProofStation / fee sponsorship for preprod transactions

## Setup & Run Locally

```bash
git clone https://github.com/saifsh828/SafeMatch.git
cd SafeMatch
npm install
```

Optional: override the default registry address at build time:

```bash
cp .env.example .env.local
# Edit NEXT_PUBLIC_SAFEMATCH_CONTRACT_ADDRESS if needed.
```

Compile the Compact contract and copy proving assets:

```bash
npm run contract:compile
npm run contract:sync-assets
```

If compiler is not on `PATH`, provide its binary:

```bash
COMPACTC_BIN=/path/to/compactc npm run contract:compile
```

Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `/docs` for protocol explanation, `/privacy` for privacy boundaries, `/deploy` to deploy a new preprod registry, and `/issuer` for synthetic issuer testing.

## Demo usage

### Use current registry

1. Install and unlock 1AM; switch network to Midnight preprod.
2. Open the live demo or local `/` route.
3. Connect wallet.
4. Select `25–35`, `Verified person`, or the combined claim.
5. If the credential witness is loaded, submit proof and wait for the confirmed transaction ID.

A fresh wallet has no credential witness. Complete issuer smoke testing first, or use a wallet/session already provisioned by an approved issuer.

### Run synthetic issuer smoke test

1. Open `/deploy` and deploy a new registry, or use current address above.
2. Copy the owner authorization secret shown once after deployment. Store it offline.
3. Open `/issuer` in same browser session.
4. Paste owner secret and synthetic DOB such as `20000101`.
5. Approve provider registration and credential issuance in 1AM.
6. Return to `/`, reconnect 1AM, refresh credential status, then submit a claim.

Owner secret is private. Never commit it, place it in `NEXT_PUBLIC_*`, or use real personal data in this demo.

## Contract connection map

| Area | Files | Contract responsibility |
| --- | --- | --- |
| Contract source | [`contract/safematch_v2.compact`](contract/safematch_v2.compact) | Ledger state, witnesses, issuer authorization, credential commitments, revocation, proof circuits |
| Compilation | [`scripts/compile-contract.sh`](scripts/compile-contract.sh) | Compiles Compact `0.31.0` source into `artifacts/safematch-v2` |
| Asset sync | [`scripts/sync-contract-assets.sh`](scripts/sync-contract-assets.sh) | Copies `keys/` and `zkir/` into browser-served `public/zk/safematch-v2` |
| SDK/network | [`lib/midnight.ts`](lib/midnight.ts) | 1AM session, preprod enforcement, providers, proving, transaction submission, state queries |
| Address config | [`lib/constants.ts`](lib/constants.ts) | Default registry address, `NEXT_PUBLIC_SAFEMATCH_CONTRACT_ADDRESS`, browser storage key |
| Deployment | [`lib/deploy-safematch-v2.ts`](lib/deploy-safematch-v2.ts), [`app/deploy/DeployClient.tsx`](app/deploy/DeployClient.tsx) | Browser deployment, owner secret generation, address persistence |
| Issuer calls | [`lib/issuer-safematch-v2.ts`](lib/issuer-safematch-v2.ts), [`app/issuer/page.tsx`](app/issuer/page.tsx) | `addProvider` and `issueCredential` demo flow |
| Holder proofs | [`lib/prove-safematch-v2.ts`](lib/prove-safematch-v2.ts), [`app/page.tsx`](app/page.tsx) | Witness loading and `proveAgeInRange`, `proveVerifiedPerson`, `proveAgeAndVerified` |
| Generated bindings | `artifacts/safematch-v2/contract/` | Compact-generated contract typings and runtime bindings; regenerated, not hand-edited |

Contract circuits:

- `addProvider` / `removeProvider`: owner manages trusted issuers.
- `issueCredential` / `revokeCredential`: issuer manages credential commitments.
- `proveAgeInRange`: proves age within `[minAge, maxAge]`.
- `proveVerifiedPerson`: proves active trusted credential without age disclosure.
- `proveAgeAndVerified`: combines both claims.

## Project structure

```text
app/
  page.tsx                 Holder verification UI and wallet/proof actions
  deploy/                  Browser deployment page and client
  issuer/                  Synthetic issuer smoke-test page
  docs/                    Protocol explanation
  privacy/                 Privacy boundaries and MVP limitations
  layout.tsx               Global metadata/layout
  globals.css              UI design system
contract/
  safematch_v2.compact     Midnight Compact source contract
lib/
  midnight.ts              1AM + Midnight preprod integration
  constants.ts             Address and storage configuration
  deploy-safematch-v2.ts   Deployment transaction flow
  issuer-safematch-v2.ts   Issuer transaction flow
  prove-safematch-v2.ts    Holder witness/proof flow
scripts/
  compile-contract.sh      Compact compilation
  sync-contract-assets.sh  Browser proving-asset sync
docs/
  USAGE.md                 User-facing setup and demo walkthrough
artifacts/                 Generated contract bindings and proving assets
public/zk/                 Browser-served proving assets
.github/workflows/         CI checks
tests/
  safematch.test.mjs       Contract behavior and privacy regression tests
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js development server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler without emitting files |
| `npm test` | Run contract behavior and privacy regression tests |
| `npm run build` | Compile contract, sync assets, and build Next.js app |
| `npm run start` | Serve production build |
| `npm run contract:compile` | Compile Compact contract |
| `npm run contract:sync-assets` | Sync generated keys/ZKIR to `public/zk` |

## Run Tests

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

## Usage Guide

See [`docs/USAGE.md`](docs/USAGE.md).

## Level 5 — User Validation

- Target: 50 preprod users
- Current: **72 / 50** distinct valid wallet responses
- Feedback form: [Google Form](https://forms.gle/EN3ZuNWG33MNyqER9)
- Wallet evidence: [`USERS.md`](USERS.md)
- Anonymized feedback log and themes: [`docs/FEEDBACK.md`](docs/FEEDBACK.md)
- Outreach copy: [`docs/OUTREACH.md`](docs/OUTREACH.md)

Names and email addresses remain outside repository. Response sheet is linked only as reviewer evidence and should retain least-privilege sharing.

## Feedback & Iterations

See [`docs/FEEDBACK.md`](docs/FEEDBACK.md).

Top changes from 72 user responses:

- Added Connect → Review → Prove progress guidance.
- Added final public/private disclosure review before proof generation.
- Added clearer success, retry, and next-step actions plus small-screen navigation cleanup.

## Level 6 Users

See [`LAUNCH_USERS.md`](LAUNCH_USERS.md). Launch cohort target reached: **20 / 20** verified preprod wallet responses.

## Product X Profile

[@0xsafematch](https://x.com/0xsafematch)

## Brand Assets

Brand brief, palette, messaging, X bio, banner concept, and onboarding script: [`docs/BRAND.md`](docs/BRAND.md).

Final demo plan: [`docs/DEMO-CHECKLIST.md`](docs/DEMO-CHECKLIST.md).

## Troubleshooting

`1010: Invalid Transaction` / `Custom error: 196` usually means stale or spent DUST UTXO. Do not resubmit same transaction. Resync 1AM on preprod to 100%, reload app, reconnect wallet, and create fresh transaction.

If proof is disabled, wallet lacks credential witness state. Run synthetic issuer flow or use approved issuer provisioning. If network check fails, switch 1AM to Midnight preprod and reconnect.

## CI/CD

[![CI](https://github.com/saifsh828/SafeMatch/actions/workflows/ci.yml/badge.svg)](https://github.com/saifsh828/SafeMatch/actions/workflows/ci.yml)

GitHub Actions runs contract tests, dependency installation, ESLint, TypeScript checks, Compact `0.31.0` compilation, and proving-asset synchronization on pushes and pull requests. Contract tests run in their own `test` job.

## Contributing

Keep secrets out of git. Run `npm run lint` before committing. Contract changes require regenerated artifacts, synced proving assets, and a preprod smoke test.

## License

No license has been published yet. Treat repository code as all-rights-reserved until project owners add a license.
