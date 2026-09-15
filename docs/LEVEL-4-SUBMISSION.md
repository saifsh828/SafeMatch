# Level 4 — Waxing Gibbous Submission

Requirement evidence for SafeMatch.

## Checklist

- [x] Public GitHub repository: [saifsh828/SafeMatch](https://github.com/saifsh828/SafeMatch)
- [x] Working MVP live on Preprod: [safe-match-eosin.vercel.app](https://safe-match-eosin.vercel.app/)
- [x] Midnight Preprod contract address: [`8e0308828b5f5ce5ec629f75760dfdb25e7d7de06a65835d00c182fb18966fd7`](https://preprod.midnight.network/contract/8e0308828b5f5ce5ec629f75760dfdb25e7d7de06a65835d00c182fb18966fd7)
- [x] README documentation: setup, usage, architecture, contract map, troubleshooting, privacy boundary
- [x] Dedicated usage guide: [`docs/USAGE.md`](USAGE.md)
- [x] In-app technical docs: [`/docs`](https://safe-match-eosin.vercel.app/docs)
- [x] Privacy documentation: [`/privacy`](https://safe-match-eosin.vercel.app/privacy)
- [x] CI/CD workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
- [x] CI checks: dedicated contract test job, lint, typecheck, Compact compile, proving-asset sync ([latest passing run](https://github.com/saifsh828/SafeMatch/actions/runs/34558008621))
- [x] CI badge: shown in README and links to GitHub Actions
- [x] MVP demo video: [Google Drive recording](https://drive.google.com/file/d/1RpfrZgKRLzs8_2AHg3c3QMnRCUA4WAbF/view?usp=sharing)
- [x] Meaningful commits: 25 commits on `main` (minimum: 15)
- [x] Product X profile: [@0xsafematch](https://x.com/0xsafematch), linked in [`README.md`](../README.md)

## Local verification

```bash
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

`npm run build` compiles Compact, syncs proving assets, and creates production Next.js output.

## Product X profile handoff

Profile: [@0xsafematch](https://x.com/0xsafematch). Keep product name, SafeMatch description, Preprod demo link, GitHub link, and demo video visible.

Public product post: [SafeMatch MVP announcement](https://x.com/0xsafematch/status/2086466626132811843).

Do not put wallet owner secrets, private witnesses, or real identity data in posts or repository files.
