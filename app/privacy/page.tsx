import Link from 'next/link';

export const metadata = {
  title: 'SafeMatch privacy',
  description: 'Privacy boundaries for the SafeMatch MVP.',
};

export default function PrivacyPage() {
  return (
    <main className="content-shell">
      <article className="content-page">
        <Link href="/">← Back to SafeMatch</Link>
        <h1>Share claim.<br /><span>Keep identity private.</span></h1>
        <p>SafeMatch is designed to prove a limited claim, not copy identity documents into a dating or social platform.</p>

        <section className="content-section">
          <h2>Public on-chain data</h2>
          <p>Credential commitments, trusted provider identifiers, and app-specific nullifiers are public. These values are cryptographic outputs; they do not contain raw date of birth or identity documents.</p>
        </section>

        <section className="content-section">
          <h2>Private credential data</h2>
          <p><code>secretId</code>, <code>dob</code>, <code>salt</code>, and <code>providerId</code> are proof witnesses. They must be provisioned by an approved issuer and must not be sent to relying apps.</p>
        </section>

        <section className="content-section">
          <h2>MVP limitations</h2>
          <p>This is preprod software, not a production identity service. Do not submit real identity documents to this demo. Production release requires an issuer agreement, encrypted credential storage, security review, consent controls, retention policy, and legal/compliance review.</p>
        </section>
      </article>
    </main>
  );
}
