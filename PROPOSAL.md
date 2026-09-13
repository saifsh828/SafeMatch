# SafeMatch Proposal

## 1. Product and users

SafeMatch is a privacy-first identity and age-verification registry for apps that need trust without collecting identity documents. A credential issuer verifies a person off-chain, then publishes only a commitment. The credential holder proves a narrow claim—an age range, verified-person status, or both—to a relying app through a zero-knowledge circuit.

Primary users are people joining dating, social, gaming, marketplace, and other age-gated services; relying apps that need abuse resistance and eligibility checks; and trusted issuers such as identity, KYC, or background-check providers. The MVP uses synthetic issuer data and targets integration learning, not production identity verification.

## 2. Why Midnight specifically

Midnight fits because privacy is a protocol property, not an application promise. Compact circuits let SafeMatch keep DOB, identity secret, salt, and provider secret as witnesses while committing only necessary verification state to the ledger. Selective disclosure gives an app an answer such as “25–35 and verified” without handing it a name, document, or exact DOB.

Midnight also gives the product a verifiable public registry: trusted providers, issued commitments, revocations, and app-scoped nullifiers can be checked without a central database becoming the single source of truth. The tradeoff is real: proving assets, wallet UX, fees, issuer provisioning, and network maturity add complexity. For SafeMatch, that complexity directly serves the core privacy requirement.

## 3. Data model: public, private, disclosure state

Public ledger state contains the owner authorization commitment, trusted provider keys, provider authorization commitments, issued credential commitments, and used nullifiers. These values support issuer governance, credential existence/revocation, and one-use-per-app replay protection.

Private witness state contains `secretId`, DOB, random `salt`, provider ID, owner secret, and provider secret. The credential commitment binds the holder’s secret, DOB, salt, and provider ID; raw identity data never enters ledger state. Provider and owner secrets authorize mutations through hashed commitments.

Disclosure state is intentionally narrow. A proof transaction discloses only the caller-selected policy result: age within supplied bounds, verified-person status, or both. It also records an app-specific nullifier. The app learns that claim and can prevent duplicate use on that app, but does not learn DOB, name, document, credential secret, or the holder’s cross-app identity.

## 4. Mainnet feasibility by Level 6

By Level 6, mainnet feasibility means production-ready trust, not merely a deployed contract. SafeMatch can reach it if the following gates are completed:

1. Harden and audit Compact circuits, generated bindings, witness handling, nullifier design, authorization, and revocation semantics.
2. Replace synthetic issuer flow with reviewed issuer integrations, key rotation, recovery, credential expiry, and an operational revocation process.
3. Complete privacy, threat-model, usability, legal, age-assurance, data-protection, and abuse-resistance reviews across target jurisdictions.
4. Measure proving time, transaction cost, wallet recovery, provider throughput, and failure handling on a mainnet-like environment; document service limits and support paths.
5. Run staged preprod and mainnet pilots with restricted issuers, monitoring, incident response, migration controls, and a rollback plan that does not expose private data.

The current architecture is feasible as a Level 6 candidate because its ledger surface is small and its claims are narrowly scoped. It is not mainnet-ready today: issuer governance, audits, compliance, operational security, production UX, and network economics remain release blockers. Mainnet launch should follow evidence from those gates, not the existence of a working preprod address.
