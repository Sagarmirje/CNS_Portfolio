import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  KeyRound,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { protocolSteps } from '../data/protocolData';
import { DiagramViewer } from '../components/DiagramViewer';
import { PagePager } from '../components/PagePager';

const accentStyles = {
  cyan: {
    pill: 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200',
    ring: 'border-cyan-400 bg-cyan-400/15 text-cyan-200',
  },
  violet: {
    pill: 'border-violet-400/40 bg-violet-400/15 text-violet-200',
    ring: 'border-violet-400 bg-violet-400/15 text-violet-200',
  },
  mint: {
    pill: 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200',
    ring: 'border-emerald-400 bg-emerald-400/15 text-emerald-200',
  },
  amber: {
    pill: 'border-amber-400/40 bg-amber-400/15 text-amber-200',
    ring: 'border-amber-400 bg-amber-400/15 text-amber-200',
  },
};

export const ProtocolPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [step7Outcome, setStep7Outcome] = useState<'accept' | 'reject'>('accept');

  const current = protocolSteps[activeIndex];
  const styles = accentStyles[current.accent];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-300">03 // Eight-Step Protocol</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">
          Step-by-step protocol walkthrough
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          Follow the exact 8-step sequence implemented across <code className="text-cyan-300">app/client.py</code> and{' '}
          <code className="text-cyan-300">app/server.py</code>, with distinct key domains for credential protection (
          <span className="text-violet-300 font-medium">K_temp</span>) and chat encryption (
          <span className="text-cyan-300 font-medium">K_session</span>).
        </p>
      </header>

      {/* Distinct Key Legend */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-violet-400/35 bg-violet-400/10 p-3.5">
          <KeyRound className="h-5 w-5 shrink-0 text-violet-300" />
          <div className="text-xs">
            <span className="font-mono font-semibold text-violet-200">K_temp (Step 3 Credential Key)</span>
            <p className="text-slate-300">
              Unauthenticated ephemeral DH key used strictly to AES-128-CBC encrypt <code className="text-violet-200">auth_req</code> /{' '}
              <code className="text-violet-200">auth_resp</code>. Discarded after login.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-cyan-400/35 bg-cyan-400/10 p-3.5">
          <ShieldCheck className="h-5 w-5 shrink-0 text-cyan-300" />
          <div className="text-xs">
            <span className="font-mono font-semibold text-cyan-200">K_session (Steps 4–7 Chat Session Key)</span>
            <p className="text-slate-300">
              Fresh RSA-PSS authenticated DH key derived per session for AES-128-CBC chat encryption. Independent of{' '}
              <code className="text-violet-200">K_temp</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Stepped Timeline */}
      <section className="mt-8 rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-5 sm:p-7">
        {/* Stepper Pills */}
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" role="tablist" aria-label="Protocol steps">
          {protocolSteps.map((s, idx) => {
            const isActive = idx === activeIndex;
            const sStyle = accentStyles[s.accent];
            return (
              <button
                key={s.step}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveIndex(idx)}
                className={`flex flex-col items-center rounded-xl border px-2 py-2.5 text-center transition ${
                  isActive
                    ? sStyle.ring
                    : 'border-[#1e2d4a] bg-[#070d19] text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
              >
                <span className="font-mono text-xs font-bold">0{s.step}</span>
                <span className="mt-0.5 hidden text-[10px] leading-tight sm:block line-clamp-1">
                  {s.phase.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Step Card */}
        <div className="mt-6 rounded-2xl border border-[#1e2d4a] bg-[#070d19] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2d4a] pb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`font-mono rounded-lg border px-2.5 py-1 text-xs font-semibold ${styles.pill}`}>
                Step {current.step} of 8 • {current.phase}
              </span>
              <span className="font-mono rounded-lg border border-[#1e2d4a] bg-[#0b1324] px-2.5 py-1 text-xs text-slate-200">
                {current.keyBadge}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                disabled={activeIndex === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-[#1e2d4a] bg-[#0b1324] px-3 py-1.5 text-xs font-medium text-white hover:border-cyan-400/50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => Math.min(protocolSteps.length - 1, i + 1))}
                disabled={activeIndex === protocolSteps.length - 1}
                className="inline-flex items-center gap-1 rounded-lg bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h2 className="font-display mt-4 text-2xl font-bold text-white">{current.title}</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#1e2d4a] bg-[#0b1324] p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Who Acts</span>
              <p className="mt-1.5 text-sm font-medium text-white">{current.actor}</p>
            </div>
            <div className="rounded-xl border border-[#1e2d4a] bg-[#0b1324] p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">What Changes</span>
              <p className="mt-1.5 text-sm text-slate-300">{current.whatChanges}</p>
            </div>
            <div className="rounded-xl border border-[#1e2d4a] bg-[#0b1324] p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Security Objective</span>
              <p className="mt-1.5 text-sm text-emerald-300">{current.securityObjective}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-xl border border-[#1e2d4a] bg-[#0b1324] p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Implementation Details</span>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-300 sm:text-sm">
                {current.details.map((d) => (
                  <li key={d} className="flex items-start gap-2">
                    <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-[#1e2d4a] bg-[#040811] p-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Wire Format &amp; Source</span>
              <pre className="font-mono mt-2 overflow-x-auto text-xs text-cyan-200 whitespace-pre-wrap break-all">
                {current.wireFormat}
              </pre>
              <p className="font-mono mt-3 text-[11px] text-violet-300">Source: {current.sourceRef}</p>
            </div>
          </div>

          {/* Step 7 Branching Outcomes */}
          {current.step === 7 && (
            <div className="mt-6 rounded-xl border border-[#1e2d4a] bg-[#0b1324] p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-base font-semibold text-white">
                  Step 7 Branching Outcomes (Receiver Decision)
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep7Outcome('accept')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      step7Outcome === 'accept'
                        ? 'border border-emerald-400/50 bg-emerald-400/15 text-emerald-200'
                        : 'border border-[#1e2d4a] bg-[#070d19] text-slate-400'
                    }`}
                  >
                    Accepted Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep7Outcome('reject')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      step7Outcome === 'reject'
                        ? 'border border-rose-400/50 bg-rose-400/15 text-rose-200'
                        : 'border border-[#1e2d4a] bg-[#070d19] text-slate-400'
                    }`}
                  >
                    Rejection Branches
                  </button>
                </div>
              </div>

              {step7Outcome === 'accept' ? (
                <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-xs sm:text-sm text-emerald-100">
                  <div className="flex items-center gap-2 font-semibold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>All 4 Checks Passed → (True, "OK", plaintext)</span>
                  </div>
                  <p className="mt-2 text-slate-200">
                    1) Update <code className="text-emerald-200">self.last_seqno = seqno</code> • 2) Append{' '}
                    <code className="text-emerald-200">seqno | ts | ct_b64 | sig_b64 | peer_fp</code> to transcript •
                    3) On server, relay plaintext via <code className="text-emerald-200">broadcast()</code> under each
                    peer’s session key.
                  </p>
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ['REPLAY', 'Stage 1', 'seqno <= last_seqno — stops duplicate or reordered frames immediately.'],
                    ['STALE', 'Stage 2', '|now_ms() - ts| > 60,000 ms — drops delayed messages outside ±60s window.'],
                    ['SIG_FAIL', 'Stage 3', 'RSA verify fails on SHA-256(seqno || ts || ct) — catches tampering before decryption.'],
                    ['DECRYPT_FAIL', 'Stage 4', 'AES-128-CBC / PKCS#7 unpadding fails — rejects malformed cipher blocks.'],
                  ].map(([code, stage, desc]) => (
                    <div key={code} className="rounded-xl border border-rose-400/35 bg-rose-400/10 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-rose-300">{code}</span>
                        <span className="font-mono text-[10px] text-rose-200/80">{stage}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-200 flex items-start gap-1.5">
                        <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />
                        <span>{desc}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Supplied Flow Diagram */}
      <section className="mt-12">
        <DiagramViewer
          src={siteConfig.diagrams.protocolFlow.src}
          alt={siteConfig.diagrams.protocolFlow.alt}
          caption={siteConfig.diagrams.protocolFlow.caption}
          title="Supplied 8-Step Protocol Flow Diagram"
          textEquivalentTitle="Mobile Stacked Text Walkthrough (Steps 1–8)"
          textEquivalent={
            <ol className="space-y-2 text-xs sm:text-sm">
              {protocolSteps.map((s) => (
                <li key={s.step}>
                  <strong className="text-white">
                    Step {s.step} — {s.title}:
                  </strong>{' '}
                  <span className="text-slate-300">{s.whatChanges}</span>{' '}
                  <span className="font-mono text-cyan-300">[{s.keyBadge}]</span>
                </li>
              ))}
            </ol>
          }
        />
      </section>

      <PagePager currentPath="/protocol" />
    </div>
  );
};
