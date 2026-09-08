'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { Check, ExternalLink, Fingerprint, LoaderCircle, ShieldCheck, Wallet } from 'lucide-react';
import { createConnectedSession, detectWallet, PREPROD_NETWORK_ID } from '@/lib/midnight';
import { deploySafeMatchV2 } from '@/lib/deploy-safematch-v2';
import { SAFEMATCH_CONTRACT_STORAGE_KEY } from '@/lib/constants';
import { toHex } from '@/lib/midnight';
import type { ConnectedSession } from '@/lib/midnight';

type DeployStatus = 'idle' | 'connecting' | 'deploying' | 'success';

function deployErrorMessage(cause: unknown): string {
  const message = cause instanceof Error ? cause.message : String(cause);
  if (message.includes('196') || message.includes('DustDoubleSpend')) {
    return `${message} DUST UTXO already spent. Resync 1AM on preprod, wait for 100% sync, then reconnect before creating a new transaction.`;
  }
  if (message.includes('Invalid Transaction') || message.includes('SubmissionError')) {
    return `${message} Sync 1AM on preprod, wait for wallet sync to finish, then reconnect and retry.`;
  }
  return message;
}

async function assertWalletReady(api: ConnectedSession['api']): Promise<void> {
  const connection = await api.getConnectionStatus();
  if (!connection || connection.status !== 'connected') {
    throw new Error('1AM wallet is not ready. Reconnect it on preprod before deploying.');
  }
}

export default function DeployClient() {
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [status, setStatus] = useState<DeployStatus>('idle');
  const [address, setAddress] = useState('');
  const [ownerSecret, setOwnerSecret] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const connectAndDeploy = useCallback(async () => {
    setStatus('connecting');
    setError('');
    try {
      // Set global network before any wallet or contract SDK operation.
      setNetworkId(PREPROD_NETWORK_ID);
      const wallet = await detectWallet();
      if (!wallet) throw new Error('1AM wallet not detected. Install the browser extension, then reload.');
      const api = await wallet.connect(PREPROD_NETWORK_ID);
      const connectedSession = await createConnectedSession(api, '/zk/safematch-v2/');
      if (!mountedRef.current) return;
      setSession(connectedSession);
      setStatus('deploying');
      setStatusMessage('1AM is generating the proof and preparing your transaction…');
      await assertWalletReady(connectedSession.api);
      const deployment = await deploySafeMatchV2(connectedSession);
      if (mountedRef.current) {
        window.localStorage.setItem(SAFEMATCH_CONTRACT_STORAGE_KEY, deployment.contractAddress);
        setAddress(deployment.contractAddress);
        setOwnerSecret(toHex(deployment.ownerSecret));
        setStatus('success');
        setStatusMessage('Deployment submitted through 1AM.');
      }
    } catch (cause) {
      if (mountedRef.current) {
        // Drop session after submission failure. Reusing its cached wallet state
        // can resubmit the same stale DUST input and trigger DustDoubleSpend.
        setSession(null);
        setStatus('idle');
        setStatusMessage('');
        setError(deployErrorMessage(cause));
      }
    }
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      setError('Could not copy contract address. Copy it manually from the field below.');
    }
  };

  const copyOwnerSecret = async () => {
    try {
      await navigator.clipboard.writeText(ownerSecret);
      setSecretCopied(true);
    } catch {
      setError('Could not copy owner authorization secret. Copy it manually and store it offline.');
    }
  };

  return (
    <div className="deploy-card">
      <Link href="/" className="deploy-brand"><span className="deploy-brand-mark"><ShieldCheck size={18} /></span> SafeMatch</Link>
      <div className="deploy-eyebrow"><span /> Browser deployment · Midnight preprod</div>
      <h1>Put SafeMatch on-chain.<br /><em>Keep control in your wallet.</em></h1>
      <p className="deploy-intro">Deploy the new SafeMatch V2 privacy credential registry through the 1AM browser extension. Proof generation, balancing, signing, and submission stay in the wallet flow.</p>
      <p className="deploy-footnote">Deploy creates a new preprod registry and selects it for this browser’s proof flow.</p>

      <div className="deploy-promise">
        <div><Fingerprint size={17} /><span>1AM proving provider</span></div>
        <div><ShieldCheck size={17} /><span>Preprod network locked</span></div>
        <div><Wallet size={17} /><span>No server-side keys</span></div>
      </div>

      {status === 'idle' && (
        <button className="deploy-action" onClick={connectAndDeploy}><Wallet size={17} /> Connect 1AM & deploy V2</button>
      )}
      {status === 'connecting' && (
        <button className="deploy-action" disabled><LoaderCircle className="spin-icon" size={17} /> Connecting to 1AM…</button>
      )}
      {status === 'deploying' && session && (
        <div className="deploy-ready">
          <div className="deploy-wallet-row"><span className="online-dot" /> Connected to 1AM <span className="network-chip">preprod</span></div>
          <p className="deploy-address">{session.unshieldedAddress}</p>
          <button className="deploy-action" disabled>
            <LoaderCircle className="spin-icon" size={17} /> {statusMessage}
          </button>
        </div>
      )}
      {status === 'success' && (
        <div className="deploy-success">
          <div className="success-icon"><Check size={24} /></div>
          <div><span className="success-label">Contract deployed</span><h2>SafeMatch is live on preprod</h2></div>
          <div className="contract-address"><span>Contract address</span><code>{address}</code></div>
          <div className="contract-address"><span>Owner authorization secret — save offline</span><code>{ownerSecret}</code></div>
          <div className="success-actions">
            <button onClick={copyAddress}>{copied ? 'Copied' : 'Copy address'}</button>
            <button onClick={copyOwnerSecret}>{secretCopied ? 'Secret copied' : 'Copy owner secret'}</button>
            <Link href="/">Open proof flow</Link>
            <a href={`https://preprod.midnight.network/contract/${address}`} target="_blank" rel="noreferrer">View on explorer <ExternalLink size={13} /></a>
          </div>
        </div>
      )}
      {error && <div className="deploy-error">{error}</div>}
      <p className="deploy-footnote">1AM ProofStation sponsors preprod transaction fees. Keep this tab open while the wallet completes proving and submission.</p>
    </div>
  );
}
