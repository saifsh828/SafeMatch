"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Unplug,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SAFEMATCH_CONTRACT_ADDRESS, SAFEMATCH_CONTRACT_STORAGE_KEY, isContractAddress } from "@/lib/constants";
import { createConnectedSession, detectWallet, PREPROD_NETWORK_ID, type ConnectedSession } from "@/lib/midnight";
import { credentialWitnessLoaded, proveSafeMatch } from "@/lib/prove-safematch-v2";

type ProofMode = "age" | "person" | "both";

type ProofActivity = { claim: string; transactionId: string };

const modes: { id: ProofMode; label: string; short: string }[] = [
  { id: "age", label: "Prove age range", short: "Age range" },
  { id: "person", label: "Prove verified person", short: "Verified" },
  { id: "both", label: "Prove both", short: "Both" },
];

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand-mark ${small ? "brand-mark-small" : ""}`}>
      <ShieldCheck size={small ? 17 : 22} strokeWidth={2.2} />
    </div>
  );
}

function MiniLogo({ name, letter }: { name: string; letter: string }) {
  const colors: Record<string, string> = {
    Velvet: "from-[#8b5cf6] to-[#da5aca]",
    "Orbit Social": "from-[#16a0ad] to-[#4f7ee8]",
    Kindred: "from-[#df735c] to-[#e3a253]",
  };
  return (
    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${colors[name]} text-sm font-bold text-white shadow-lg`}>
      {letter}
    </div>
  );
}

export default function Home() {
  const [walletState, setWalletState] = useState<"idle" | "connecting" | "connected">("idle");
  const [mode, setMode] = useState<ProofMode>("both");
  const [ageStart, setAgeStart] = useState(25);
  const [proofState, setProofState] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [walletError, setWalletError] = useState("");
  const [proofError, setProofError] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [contractAddress, setContractAddress] = useState(SAFEMATCH_CONTRACT_ADDRESS);
  const [credentialState, setCredentialState] = useState<"idle" | "checking" | "missing" | "ready">("idle");
  const [activities, setActivities] = useState<ProofActivity[]>([]);

  useEffect(() => {
    const storedAddress = window.localStorage.getItem(SAFEMATCH_CONTRACT_STORAGE_KEY);
    if (!storedAddress || !isContractAddress(storedAddress)) return;
    const timer = window.setTimeout(() => setContractAddress(storedAddress), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!session || credentialState === "ready") return;
    let cancelled = false;
    const interval = window.setInterval(async () => {
      const ready = await credentialWitnessLoaded(session, contractAddress);
      if (!cancelled && ready) setCredentialState("ready");
    }, 3000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [session, credentialState, contractAddress]);

  const claim = useMemo(() => {
    const age = `Age ${ageStart}–${ageStart + 10}`;
    if (mode === "age") return age;
    if (mode === "person") return "Verified person";
    return `${age} · Verified person`;
  }, [ageStart, mode]);

  const connectWallet = async () => {
    if (walletState === "connected") {
      setWalletState("idle");
      setSession(null);
      setProofState("idle");
      setCredentialState("idle");
      setProofError("");
      return;
    }
    setWalletState("connecting");
    setWalletError("");
    try {
      const wallet = await detectWallet();
      if (!wallet) throw new Error("1AM wallet not detected. Install extension, then reload.");
      const api = await wallet.connect(PREPROD_NETWORK_ID);
      const connectedSession = await createConnectedSession(api, "/zk/safematch-v2/");
      setCredentialState("checking");
      const credentialReady = await credentialWitnessLoaded(connectedSession, contractAddress);
      setSession(connectedSession);
      setWalletState("connected");
      setCredentialState(credentialReady ? "ready" : "missing");
    } catch (error) {
      setWalletState("idle");
      setWalletError(error instanceof Error ? error.message : String(error));
    }
  };

  const generateProof = async () => {
    if (!session || credentialState !== "ready" || proofState === "generating") return;
    setProofState("generating");
    setProofError("");
    setTransactionId("");
    try {
      const circuit = mode === "age" ? "proveAgeInRange" : mode === "person" ? "proveVerifiedPerson" : "proveAgeAndVerified";
      const txId = await proveSafeMatch(session, contractAddress, circuit, ageStart);
      setTransactionId(txId);
      setActivities((current) => [{ claim, transactionId: txId }, ...current]);
      setProofState("done");
    } catch (error) {
      setProofError(error instanceof Error ? error.message : String(error));
      setProofState("error");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07090d] text-[#f5f7f6] selection:bg-[#62e7cc]/30">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="noise" />

      <nav className="relative z-20 mx-auto flex max-w-[1200px] items-center justify-between px-5 py-6 md:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="SafeMatch home">
          <BrandMark small />
          <span className="text-[17px] font-semibold tracking-[-0.03em]">SafeMatch</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm text-white/55 md:flex">
          <a className="transition-colors hover:text-white" href="#verify">Verify</a>
          <a className="transition-colors hover:text-white" href="#connections">Connections</a>
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[#62e7cc] shadow-[0_0_8px_#62e7cc]" /> Midnight testnet
          </span>
        </div>
        <Link href="/deploy" className="deploy-nav-link">
          Deploy with 1AM
        </Link>
        <Link href="/issuer" className="deploy-nav-link">
          Issue demo credential
        </Link>
        <button
          onClick={connectWallet}
          className={`wallet-button ${walletState}`}
          aria-live="polite"
        >
          {walletState === "idle" && <><Wallet size={15} /> Connect wallet</>}
          {walletState === "connecting" && <><span className="spinner" /> Connecting</>}
          {walletState === "connected" && <><Check size={15} /> 0x8F2...91A <Unplug size={13} className="ml-0.5 opacity-50" /></>}
        </button>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-[1200px] gap-10 px-5 pb-20 pt-14 md:px-8 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:pb-28 lg:pt-20">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="eyebrow"><span /> Private by design · Human by proof</div>
          <h1 className="mt-6 max-w-[760px] text-[clamp(3.25rem,7.4vw,6.8rem)] font-semibold leading-[0.88] tracking-[-0.075em]">
            Prove who<br />you are.<br /><span className="text-white/30">Reveal nothing else.</span>
          </h1>
          <p className="mt-8 max-w-[580px] text-base leading-7 text-white/50 md:text-lg md:leading-8">
            Share trust, not identity. SafeMatch uses zero-knowledge proofs to confirm what matters—never your name, birth date, or documents.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button className="primary-cta" onClick={() => document.querySelector("#verify")?.scrollIntoView({ behavior: "smooth" })}>
              Create private proof <ArrowRight size={17} />
            </button>
            <div className="flex items-center gap-2.5 text-xs text-white/40"><LockKeyhole size={14} className="text-[#62e7cc]" /> Your data stays yours</div>
          </div>
        </motion.div>

        <motion.div className="shield-stage" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }}>
          <div className="orbit orbit-one"><i /><i /><i /></div>
          <div className="orbit orbit-two"><i /><i /></div>
          <div className="shield-halo" />
          <motion.div className="hero-shield" animate={{ y: [0, -10, 0], rotateY: [-3, 3, -3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            <Fingerprint size={77} strokeWidth={1.2} />
            <div className="scan-line" />
          </motion.div>
          <div className="proof-chip chip-top"><Check size={12} /> Preprod circuit</div>
          <div className="proof-chip chip-bottom"><KeyRound size={12} /> ZK verifier loaded</div>
        </motion.div>
      </section>

      <section id="verify" className="relative z-10 mx-auto max-w-[1200px] scroll-mt-6 px-5 pb-24 md:px-8">
        <div className="section-heading">
          <div><span className="section-kicker">Private verification</span><h2>One proof. Only what matters.</h2></div>
          <p>Built on Midnight Network</p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[.82fr_1.18fr]">
          <motion.div className="glass-card credential-card" whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
            <div className="card-topline"><span>Credential status</span><ShieldCheck size={17} /></div>
            <AnimatePresence mode="wait">
              {walletState === "connected" ? (
                <motion.div key="connected" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-12">
                  <motion.div className="verified-seal"><Check size={26} strokeWidth={2.5} /></motion.div>
                  <h3 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">{credentialState === "ready" ? "Credential ready" : "Wallet connected"}</h3>
                  <p className="mt-2 text-sm text-white/42">
                    {credentialState === "checking" && "Checking private credential witness…"}
                    {credentialState === "ready" && "Credential witness loaded. Proof still checks issuer and commitment on-chain."}
                    {credentialState === "missing" && "No credential loaded. Complete issuer verification before proving."}
                  </p>
                  {credentialState !== "ready" && <button className="inline-link mt-5" onClick={async () => { setCredentialState("checking"); const ready = await credentialWitnessLoaded(session!, contractAddress); setCredentialState(ready ? "ready" : "missing"); }}>Refresh credential status <ArrowRight size={14} /></button>}
                  <div className="credential-meta"><div><span>Network</span><strong>Midnight preprod</strong></div><div><span>Contract</span><strong>{contractAddress ? `${contractAddress.slice(0, 10)}…` : "Not selected"}</strong></div><div><span>Personal data</span><strong className="safe-text">Not exposed</strong></div></div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16">
                  <div className="empty-seal"><Wallet size={24} /></div>
                  <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">Not verified</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-white/42">Connect your Midnight wallet to securely load credential status.</p>
                  <button onClick={connectWallet} className="inline-link mt-8">Connect wallet <ArrowRight size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="glass-card proof-card">
            <div className="card-topline"><span>Generate proof</span><Sparkles size={17} /></div>
            <div className="mt-8 grid grid-cols-3 gap-2 rounded-2xl bg-black/25 p-1.5">
              {modes.map((item) => (
                <button key={item.id} className={`mode-button ${mode === item.id ? "active" : ""}`} onClick={() => { setMode(item.id); setProofState("idle"); }}>
                  <span className="hidden sm:inline">{item.label}</span><span className="sm:hidden">{item.short}</span>
                  {mode === item.id && <motion.span layoutId="mode-dot" className="mode-dot" />}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {(mode === "age" || mode === "both") && (
                <motion.div key="slider" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="slider-wrap">
                  <div className="flex items-end justify-between"><div><span className="field-label">Select age range</span><p className="mt-1 text-xs text-white/35">Exact age stays private</p></div><strong>{ageStart}–{ageStart + 10}</strong></div>
                  <input aria-label="Age range start" type="range" min="18" max="45" value={ageStart} onChange={(e) => { setAgeStart(Number(e.target.value)); setProofState("idle"); }} style={{ "--range": `${((ageStart - 18) / 27) * 100}%` } as React.CSSProperties} />
                  <div className="flex justify-between font-mono text-[10px] text-white/25"><span>18</span><span>55+</span></div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="disclosure-row">
              <div className="flex items-center gap-3"><div className="tiny-icon"><Zap size={15} /></div><div><span className="field-label">Public claim</span><p>{claim}</p></div></div>
              <span className="private-pill"><LockKeyhole size={11} /> Private</span>
            </div>

            <button onClick={generateProof} disabled={walletState !== "connected" || credentialState !== "ready" || proofState === "generating"} className={`generate-button ${proofState}`}>
              {proofState === "idle" && <>{walletState !== "connected" ? "Connect wallet to generate" : credentialState === "checking" ? "Checking credential…" : credentialState === "missing" ? "Credential required before proving" : "Generate zero-knowledge proof"}<ArrowRight size={16} /></>}
              {proofState === "generating" && <><span className="proof-loader"><i /><i /><i /></span> Proving with 1AM on preprod…</>}
              {proofState === "done" && <><Check size={17} /> Proof submitted on-chain</>}
              {proofState === "error" && <>Proof failed — retry <ArrowRight size={16} /></>}
            </button>
            {walletError && <p className="mt-4 text-sm text-red-300">{walletError}</p>}
            {proofError && <p className="mt-4 text-sm text-red-300">{proofError}</p>}
            {walletState === "connected" && credentialState === "missing" && <p className="mt-4 text-sm text-white/42">A trusted issuer must provision your private credential first. <Link href="/docs" className="text-[#70ddc8] underline underline-offset-4">How it works</Link></p>}
          </div>
        </div>

        <AnimatePresence>
          {proofState === "done" && (
            <motion.div className="result-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ type: "spring", stiffness: 180, damping: 22 }}>
              <div className="confetti"><i /><i /><i /><i /><i /><i /></div>
              <div className="result-check"><Check size={18} /></div>
              <div className="min-w-0 flex-1"><span>Confirmed by Midnight preprod</span><h3>{claim}</h3><p>Transaction ID: {transactionId}</p></div>
              <a className="copy-button" href={`https://preprod.midnight.network/contract/${contractAddress}`} target="_blank" rel="noreferrer">View contract</a>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section id="connections" className="relative z-10 border-t border-white/[0.06] bg-black/15">
        <div className="mx-auto max-w-[1200px] px-5 py-24 md:px-8">
          <div className="section-heading"><div><span className="section-kicker">Your privacy trail</span><h2>On-chain proof activity</h2></div><p>{transactionId ? "1 submitted this session" : "No proof submitted"}</p></div>
          <div className="connections-list mt-8">
            {activities.length === 0 ? (
              <div className="empty-activity">No proof submitted in this browser session.</div>
            ) : activities.map((activity, index) => (
              <motion.div key={activity.transactionId} className="connection-row" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
                <MiniLogo name="Velvet" letter="✓" />
                <div className="min-w-0 flex-1"><h3>{activity.claim}</h3><p className="truncate">Transaction {activity.transactionId}</p></div>
                <div className="nullifier active"><span /> Submitted</div>
                <ChevronDown size={16} className="row-arrow" />
              </motion.div>
            ))}
          </div>
          <div className="privacy-note"><Fingerprint size={18} /><p><strong>No local history claimed.</strong> Proof status is accepted only after Midnight preprod returns a transaction ID.</p></div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-4 px-5 py-8 text-xs text-white/30 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-2"><BrandMark small /><span>SafeMatch</span><span>· Private identity for real connection.</span></div>
        <div className="flex gap-5"><Link href="/privacy">Privacy</Link><Link href="/docs">Docs</Link><a href={`https://preprod.midnight.network/contract/${contractAddress}`} target="_blank" rel="noreferrer">Midnight contract</a></div>
      </footer>
    </main>
  );
}
