import DeployClient from './DeployClient';

export const metadata = {
  title: 'Deploy SafeMatch · Midnight preprod',
  description: 'Deploy SafeMatch through the 1AM browser wallet on Midnight preprod.',
};

export default function DeployPage() {
  return (
    <main className="deploy-shell">
      <DeployClient />
    </main>
  );
}
