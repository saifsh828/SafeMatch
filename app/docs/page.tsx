import Link from 'next/link';

export const metadata = {
  title: 'SafeMatch documentation',
  description: 'How SafeMatch private age and identity proofs work.',
};

export default function DocsPage() {
  return (
    <main className="content-shell">
      <article className="content-page">
        <Link href="/">← Back to SafeMatch</Link>
        <h1>Proofs, not <span>documents.</span></h1>
        <p>SafeMatch lets a person prove an age range or trusted identity verification without sharing their date of birth or identity documents with an app.</p>

        <section className="content-section">
          <h2>Holder flow</h2>
          <ol>
            <li>A trusted issuer verifies identity and date of birth off-chain.</li>
            <li>Issuer creates a private credential containing <code>secretId</code>, <code>dob</code>, <code>salt</code>, and <code>providerId</code>.</li>
            <li>Issuer registers only a cryptographic commitment on Midnight preprod.</li>
            <li>Holder chooses claim to share, such as age 25–35. Date of birth never appears in SafeMatch.</li>
            <li>Proof circuit verifies credential, age policy, issuer trust, and one-use app nullifier.</li>
          </ol>
        </section>

        <section className="content-section">
          <h2>Current MVP boundary</h2>
          <p>This repository includes proof circuits and wallet submission. It does not include a production issuer, background-check integration, DID/VC exchange, or encrypted credential wallet storage. A fresh wallet therefore cannot prove until an approved issuer provisions its witness and matching on-chain commitment.</p>
        </section>

        <section className="content-section">
          <h2>What “verified person” means</h2>
          <p>It means a trusted issuer issued an active credential. It does not expose legal name, document number, birth date, or criminal-history data. Criminal-record claims are deliberately outside this MVP.</p>
        </section>
      </article>
    </main>
  );
}
