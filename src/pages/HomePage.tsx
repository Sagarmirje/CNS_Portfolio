import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  KeyRound,
  Lock,
  ShieldCheck,
  FileCheck2,
  Server,
  UserCheck,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { PagePager } from '../components/PagePager';

const samplePacket = {
  type: 'msg',
  seqno: 2,
  ts: 1795588633911,
  ct: 'vjI973LZqkO8o6Yim++XLujBuyQUCthSF+ijK0tnb5o=',
  sig: 'T5WB98v0a86bXV9D2CO8wyhBI5DU8jX5VLrRn+tTjI2e5pxJ64vtWtWEHAjlmIB...',
};

export const HomePage: React.FC = () => {
  const [inspectTarget, setInspectTarget] = useState<'msg' | 'auth' | 'receipt'>('msg');

  const inspectorPayloads = {
    msg: {
      label: 'Step 6 // Encrypted Chat Frame',
      badge: 'K_session + RSA-SHA256',
      accentClass: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10',
      json: samplePacket,
      note: 'Captured format from transcripts/15fcb2ce_server.log (signature truncated for display). IV is prepended inside ct.',
    },
    auth: {
      label: 'Step 3 // Encrypted Login Frame',
      badge: 'K_temp (Ephemeral DH)',
      accentClass: 'text-violet-300 border-violet-400/30 bg-violet-400/10',
      json: {
        type: 'auth_req',
        ct: 'Base64(IV_16 || AES-128-CBC({"action":"login","username":"alice","password":"[REDACTED]"}))',
      },
      note: 'Credentials are encrypted under K_temp derived from temporary DH before touching TCP port 8443.',
    },
    receipt: {
      label: 'Step 8 // Signed SessionReceipt',
      badge: 'RSA Non-Repudiation',
      accentClass: 'text-amber-300 border-amber-400/30 bg-amber-400/10',
      json: {
        receipt: {
          peer: 'bob',
          first_seq: 2,
          last_seq: 3,
          transcript_sha256: 'adbc3efa57d9970264204e521d289f2a886b7e216b5f816338c36644b261c3f7',
          ts: 1795588691663,
        },
        sig: 'AHHFEapWqhziL6see31BntbOmhIag2RmyVuZL1G+mbYvCB+z827+w5pJ...',
      },
      note: 'Structure observed in transcripts/15fcb2ce_server_receipt.json; verified offline by tools/verify_transcript.py.',
    },
  };

  const activePayload = inspectorPayloads[inspectTarget];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#1e2d4a] bg-grid-pattern">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[44rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Editorial Copy */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Cryptography &amp; Network Security • Team Project</span>
              </div>

              <h1 className="font-display mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {siteConfig.project.title}
              </h1>

              <p className="font-display mt-3 text-xl font-medium text-cyan-300 sm:text-2xl">
                {siteConfig.project.subtitle}
              </p>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                {siteConfig.project.intro}
              </p>

              {/* Primary CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/protocol"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.28)] transition hover:bg-cyan-300"
                >
                  <span>Explore the protocol</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/demo"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#1e2d4a] bg-[#0b1324] px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/50 hover:bg-[#111c33]"
                >
                  <Terminal className="h-4 w-4 text-cyan-300" />
                  <span>View the demo</span>
                </Link>
              </div>

              {/* Compact Quick Links */}
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#1e2d4a]/80 pt-6 text-xs text-slate-400">
                <span className="font-mono uppercase tracking-wider text-slate-500">Quick jump:</span>
                <Link to="/architecture" className="font-medium text-slate-200 underline-offset-4 hover:text-cyan-300 hover:underline">
                  Architecture →
                </Link>
                <Link to="/results" className="font-medium text-slate-200 underline-offset-4 hover:text-cyan-300 hover:underline">
                  Results →
                </Link>
                <Link to="/team" className="font-medium text-slate-200 underline-offset-4 hover:text-cyan-300 hover:underline">
                  Team →
                </Link>
              </div>
            </div>

            {/* Visual Topology Preview + Small Packet Inspector */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324]/95 p-4 shadow-2xl sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2d4a] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="font-mono text-xs font-medium text-slate-200">
                      Illustrative Topology Preview
                    </span>
                  </div>
                  <span className="font-mono rounded border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[11px] text-cyan-200">
                    TCP 127.0.0.1:8443
                  </span>
                </div>

                {/* Alice <-> Server <-> Bob Node Diagram */}
                <div className="mt-5 grid grid-cols-1 items-center gap-3 sm:grid-cols-7">
                  {/* Alice */}
                  <div className="sm:col-span-2 rounded-xl border border-cyan-400/30 bg-[#070e1c] p-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-cyan-300" />
                      <span className="font-display text-sm font-semibold text-white">Alice</span>
                    </div>
                    <p className="font-mono mt-1 text-[11px] text-slate-400">CN=alice • certs/alice.crt</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="font-mono rounded bg-violet-400/15 px-1.5 py-0.5 text-[10px] text-violet-300">
                        DH Key
                      </span>
                      <span className="font-mono rounded bg-emerald-400/15 px-1.5 py-0.5 text-[10px] text-emerald-300">
                        RSA Sign
                      </span>
                    </div>
                  </div>

                  {/* Link Alice -> Server */}
                  <div className="hidden sm:flex sm:col-span-1 flex-col items-center justify-center">
                    <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#1e2d4a]">
                      <div className="packet-pulse h-full w-1/2 rounded-full bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-400" />
                    </div>
                    <span className="font-mono mt-1 text-[10px] text-slate-400">AES+Sig</span>
                  </div>

                  {/* Server */}
                  <div className="sm:col-span-1.5 sm:col-start-4 rounded-xl border border-violet-400/40 bg-[#0d172c] p-3 text-center">
                    <Server className="mx-auto h-4 w-4 text-violet-300" />
                    <span className="font-display mt-1 block text-xs font-semibold text-white">
                      SecureChat Server
                    </span>
                    <span className="font-mono mt-0.5 block text-[10px] text-amber-300">
                      4-Step Verify + Relay
                    </span>
                  </div>

                  {/* Link Server -> Bob */}
                  <div className="hidden sm:flex sm:col-span-1 flex-col items-center justify-center">
                    <div className="relative h-1 w-full overflow-hidden rounded-full bg-[#1e2d4a]">
                      <div
                        className="packet-pulse h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-400"
                        style={{ animationDelay: '1.1s' }}
                      />
                    </div>
                    <span className="font-mono mt-1 text-[10px] text-slate-400">Relay</span>
                  </div>

                  {/* Bob */}
                  <div className="sm:col-span-2 rounded-xl border border-emerald-400/30 bg-[#070e1c] p-3">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-emerald-300" />
                      <span className="font-display text-sm font-semibold text-white">Bob</span>
                    </div>
                    <p className="font-mono mt-1 text-[11px] text-slate-400">CN=bob • certs/bob.crt</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="font-mono rounded bg-emerald-400/15 px-1.5 py-0.5 text-[10px] text-emerald-300">
                        Verified OK
                      </span>
                      <span className="font-mono rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] text-amber-300">
                        Receipt
                      </span>
                    </div>
                  </div>
                </div>

                {/* Small Packet Inspector */}
                <div className="mt-5 rounded-xl border border-[#1e2d4a] bg-[#060b16] p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1e2d4a]">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                      Packet Inspector
                    </span>
                    <div className="flex gap-1" role="tablist" aria-label="Sample packet frames">
                      {(
                        [
                          { id: 'msg', label: 'Chat Msg' },
                          { id: 'auth', label: 'Auth Req' },
                          { id: 'receipt', label: 'Receipt' },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={inspectTarget === tab.id}
                          onClick={() => setInspectTarget(tab.id)}
                          className={`font-mono rounded px-2 py-1 text-[11px] transition ${
                            inspectTarget === tab.id
                              ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/40'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs text-slate-200">{activePayload.label}</span>
                    <span className={`font-mono rounded border px-2 py-0.5 text-[11px] ${activePayload.accentClass}`}>
                      {activePayload.badge}
                    </span>
                  </div>

                  <pre className="font-mono mt-2.5 overflow-x-auto rounded-lg bg-[#040811] p-3 text-[11px] leading-relaxed text-cyan-200">
                    {JSON.stringify(activePayload.json, null, 2)}
                  </pre>

                  <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{activePayload.note}</p>
                </div>

                <p className="mt-3 text-[11px] text-slate-500">
                  Caption: Illustrative preview recreated from <code className="text-slate-300">app/common/protocol.py</code>{' '}
                  and <code className="text-slate-300">app/templates/index.html</code>. Sample receipt hash sourced from
                  archived session <code className="text-slate-300">15fcb2ce</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Minute Reviewer Brief */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-cyan-300">2-Minute Briefing</p>
            <h2 className="font-display mt-1 text-2xl font-bold text-white sm:text-3xl">
              Four cryptographic planes working in sequence
            </h2>
          </div>
          <Link to="/overview" className="text-sm font-medium text-cyan-300 hover:underline">
            Read full Problem &amp; Objectives →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-display mt-4 text-base font-semibold text-white">1. Mutual PKI</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Private Root CA issues 2048-bit RSA X.509 certificates for server, Alice, and Bob. Both peers verify
              issuer, signature, validity dates, and CN before any login occurs.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-400/10 text-violet-300">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="font-display mt-4 text-base font-semibold text-white">2. Dual Diffie–Hellman</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              RFC 3526 MODP Group 14 derives an ephemeral <code className="text-violet-300">K_temp</code> to encrypt
              credentials, followed by an RSA-PSS signed DH exchange for fresh <code className="text-cyan-300">K_session</code>.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-display mt-4 text-base font-semibold text-white">3. 4-Stage Data Plane</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Messages are AES-128-CBC encrypted and RSA-SHA256 signed. Receivers enforce{' '}
              <code className="text-rose-300">REPLAY</code> → <code className="text-rose-300">STALE</code> →{' '}
              <code className="text-rose-300">SIG_FAIL</code> → <code className="text-rose-300">DECRYPT_FAIL</code>.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="font-display mt-4 text-base font-semibold text-white">4. Signed Evidence</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Accepted frames append to session transcripts. On <code className="text-amber-300">/quit</code>, peers
              exchange RSA-signed <code className="text-amber-300">SessionReceipt</code> records verified offline.
            </p>
          </div>
        </div>

        <PagePager currentPath="/" />
      </section>
    </div>
  );
};
