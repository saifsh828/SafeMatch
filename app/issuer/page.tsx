"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, LoaderCircle, ShieldCheck, Wallet } from "lucide-react";
import { SAFEMATCH_CONTRACT_ADDRESS } from "@/lib/constants";
import { createConnectedSession, detectWallet, PREPROD_NETWORK_ID, type ConnectedSession } from "@/lib/midnight";
import { issueDemoCredential } from "@/lib/issuer-safematch-v2";

export default function IssuerPage() {
  const [ownerSecret, setOwnerSecret] = useState("");
  const [dob, setDob] = useState("20000101");
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const issue = async () => {
    setBusy(true); setError(""); setResult("");
    try {
      const activeSession = session ?? await (async () => {
        const wallet = await detectWallet();
        if (!wallet) throw new Error("1AM wallet not detected. Install extension, then reload.");
        const api = await wallet.connect(PREPROD_NETWORK_ID);
        const nextSession = await createConnectedSession(api, "/zk/safematch-v2/");
        setSession(nextSession);
        return nextSession;
      })();
      const issued = await issueDemoCredential(activeSession, SAFEMATCH_CONTRACT_ADDRESS, ownerSecret, dob);
      setResult(issued.credentialTxId);
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(false); }
  };

  return (
    <main className="content-shell">
      <article className="content-page">
        <Link href="/">← Back to SafeMatch</Link>
        <h1>Issuer <span>test bench.</span></h1>
        <p>Preprod demo only. Creates synthetic credential data, registers a provider, issues its commitment, and loads private witness state. Never use real identity data here.</p>
        <section className="content-section">
          <h2>Issue synthetic credential</h2>
          <label className="issuer-label" htmlFor="owner-secret">Owner secret from ignored `.env`</label>
          <input id="owner-secret" className="issuer-input" type="password" value={ownerSecret} onChange={(event) => setOwnerSecret(event.target.value)} placeholder="64 hex characters" autoComplete="off" />
          <label className="issuer-label" htmlFor="dob">Synthetic DOB (`YYYYMMDD`)</label>
          <input id="dob" className="issuer-input" inputMode="numeric" maxLength={8} value={dob} onChange={(event) => setDob(event.target.value)} />
          <button className="deploy-action" onClick={issue} disabled={busy || !ownerSecret}>
            {busy ? <><LoaderCircle className="spin-icon" size={17} /> Issuing on preprod…</> : <><Wallet size={17} /> Issue demo credential</>}
          </button>
          {result && <p className="issuer-success"><Check size={16} /> Credential issued. Transaction: {result}</p>}
          {error && <p className="deploy-error">{error}</p>}
        </section>
        <section className="content-section">
          <h2>Test holder proof</h2>
          <p>Return home, reconnect 1AM, and choose age range `25–35`. Demo witness survives same-tab navigation and reload through temporary session storage.</p>
        </section>
        <p className="deploy-footnote"><ShieldCheck size={14} /> Contract: {SAFEMATCH_CONTRACT_ADDRESS}</p>
      </article>
    </main>
  );
}
