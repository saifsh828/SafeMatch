# SafeMatch Usage

SafeMatch lets an app verify narrow identity claims without receiving a date of birth, name, identity document, or credential secret.

## Live demo

Open [safe-match-eosin.vercel.app](https://safe-match-eosin.vercel.app/) with 1AM connected to Midnight preprod.

## Holder flow

1. Install and unlock 1AM; switch to Midnight preprod.
2. Connect wallet on the home page.
3. Choose `25–35`, `Verified person`, or the combined claim.
4. Submit proof and wait for the confirmed transaction ID.

A fresh wallet needs a credential witness. Use issuer smoke testing first, or use a wallet provisioned by an approved issuer.

## Synthetic issuer smoke test

1. Open `/deploy` and deploy a registry, or use the [current preprod registry](https://preprod.midnight.network/contract/8e0308828b5f5ce5ec629f75760dfdb25e7d7de06a65835d00c182fb18966fd7).
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
