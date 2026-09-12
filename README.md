# SafeMatch

Privacy-first identity and age verification for apps that need trust without collecting identity documents.

SafeMatch is a Next.js MVP backed by a Midnight Compact smart contract. A trusted issuer creates an on-chain commitment for a private credential. A holder then proves a narrow claim—age range, verified-person status, or both—through a zero-knowledge circuit. Date of birth, name, identity documents, and credential secrets stay private.

## Links

| Resource | Link |
| --- | --- |
| Live preprod demo | [safe-match-eosin.vercel.app](https://safe-match-eosin.vercel.app/) |
| MVP demo video | [Watch on Google Drive](https://drive.google.com/file/d/1RpfrZgKRLzs8_2AHg3c3QMnRCUA4WAbF/view?usp=sharing) |
| Public GitHub repository | [saifsh828/SafeMatch](https://github.com/saifsh828/SafeMatch) |
| Contract on Midnight preprod | [Open explorer](https://preprod.midnight.network/contract/8e0308828b5f5ce5ec629f75760dfdb25e7d7de06a65835d00c182fb18966fd7) |

## Screenshots

Add screenshots to `docs/screenshots/` using filenames below. GitHub renders this section as a 2×2 gallery.

<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/screenshots/landing.png" alt="SafeMatch landing page" width="100%" />
      <br /><strong>Landing page</strong>
    </td>
    <td align="center" width="50%">
      <img src="docs/screenshots/verification.png" alt="SafeMatch verification flow" width="100%" />
      <br /><strong>Verification flow</strong>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="docs/screenshots/deploy.png" alt="SafeMatch contract deployment" width="100%" />
      <br /><strong>Contract deployment</strong>
    </td>
    <td align="center" width="50%">
      <img src="docs/screenshots/issuer.png" alt="SafeMatch issuer flow" width="100%" />
      <br /><strong>Issuer flow</strong>
    </td>
  </tr>
</table>

## Live preprod deployment

Current SafeMatch V2 registry address:

```text
8e0308828b5f5ce5ec629f75760dfdb25e7d7de06a65835d00c182fb18966fd7
```

This is Midnight **preprod** software. Do not use real identity documents or production credentials.

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

## Requirements

- Node.js 22 or newer
- npm
- Midnight Compact compiler, version `0.31.0` or compatible CLI
- 1AM browser extension configured for Midnight preprod
- 1AM ProofStation / fee sponsorship for preprod transactions

## Local setup

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
artifacts/                 Generated contract bindings and proving assets
public/zk/                 Browser-served proving assets
.github/workflows/         CI checks
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js development server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler without emitting files |
| `npm run build` | Compile contract, sync assets, and build Next.js app |
| `npm run start` | Serve production build |
| `npm run contract:compile` | Compile Compact contract |
| `npm run contract:sync-assets` | Sync generated keys/ZKIR to `public/zk` |

## Troubleshooting

`1010: Invalid Transaction` / `Custom error: 196` usually means stale or spent DUST UTXO. Do not resubmit same transaction. Resync 1AM on preprod to 100%, reload app, reconnect wallet, and create fresh transaction.

If proof is disabled, wallet lacks credential witness state. Run synthetic issuer flow or use approved issuer provisioning. If network check fails, switch 1AM to Midnight preprod and reconnect.

## CI/CD

[![CI](https://github.com/saifsh828/SafeMatch/actions/workflows/ci.yml/badge.svg)](https://github.com/saifsh828/SafeMatch/actions/workflows/ci.yml)

GitHub Actions runs dependency installation, ESLint, TypeScript checks, Compact `0.31.0` compilation, and proving-asset synchronization on pushes and pull requests.

## Contributing

Keep secrets out of git. Run `npm run lint` before committing. Contract changes require regenerated artifacts, synced proving assets, and a preprod smoke test.

## License

No license has been published yet. Treat repository code as all-rights-reserved until project owners add a license.
