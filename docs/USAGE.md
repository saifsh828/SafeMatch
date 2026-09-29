# SafeMatch Usage

SafeMatch lets an app verify narrow identity claims without receiving a date of birth, name, identity document, or credential secret.

## Live demo

Open [safe-match-eosin.vercel.app](https://safe-match-eosin.vercel.app/) with 1AM connected to Midnight preprod.

## Getting Started on Preprod

1. Install and unlock 1AM.
2. In 1AM, select Midnight **preprod** and wait for wallet sync to finish.
3. Open the live demo. The status chip and wallet error text should both say preprod.
4. Connect wallet. If SafeMatch says no credential is loaded, use the synthetic issuer smoke test below.
5. Never enter a seed phrase, private key, real identity document, date of birth, owner secret, or provider secret into the feedback form.

## Your First Transaction

1. Choose `Age range`, `Verified person`, or `Both`.
2. If age is selected, choose the requested range.
3. Select **Review proof details**.
4. Confirm the review: selected claim and app nullifier become public; name, exact DOB, documents, and credential secret stay private.
5. Select **Confirm and generate proof** and approve the fresh transaction in 1AM.
6. Wait for the success card and transaction ID. Use **View contract** to inspect public contract state.
7. If the wallet rejects or the transaction is stale, reconnect after full sync and create a fresh transaction.

## Holder flow

1. Install and unlock 1AM; switch to Midnight preprod.
2. Connect wallet on the home page.
3. Choose `25–35`, `Verified person`, or the combined claim.
4. Submit proof and wait for the confirmed transaction ID.

A fresh wallet needs a credential witness. Use issuer smoke testing first, or use a wallet provisioned by an approved issuer.

## Synthetic issuer smoke test

1. Open `/deploy` and deploy a registry, or use the [current preprod registry](https://preprod.midnight.network/contract/66c7703f9e112a91e66095ddf83aff50ba419388994f94d99e451e3b1e41a98e).
2. Save the owner authorization secret offline; it is shown once.
3. Open `/issuer`, paste owner secret, and enter synthetic DOB `20000101`.
4. Approve provider registration and credential issuance in 1AM.
5. Return home, reconnect, refresh credential status, and submit a claim.

Use synthetic values only. Never commit owner secrets or real identity data.

## Local development

```bash
npm ci
npm run contract:compile
npm run contract:sync-assets
npm run dev
```

Open `http://localhost:3000`. Protocol details live at `/docs`; privacy boundaries live at `/privacy`.

## Troubleshooting

- Proof disabled: wallet has no credential witness. Run issuer smoke test.
- Network error: switch 1AM to Midnight preprod and reconnect.
- `1010: Invalid Transaction` or `Custom error: 196`: resync 1AM to 100%, reload, reconnect, and create a fresh transaction.
- No clear next step after success: use **View contract** for public proof evidence, then **Share feedback**.
- Small-screen controls feel crowded: rotate to portrait and use current responsive layout; deployment and issuer links remain available from documentation.

## Feedback

Submit product feedback through [Google Form](https://forms.gle/EN3ZuNWG33MNyqER9). Public project docs contain anonymized themes only.
