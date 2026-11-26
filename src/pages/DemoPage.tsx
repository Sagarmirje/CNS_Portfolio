import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Send,
  Terminal,
  XCircle,
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { PagePager } from '../components/PagePager';

type DemoScenarioId = 'accepted' | 'replay' | 'stale' | 'sig_fail' | 'decrypt_fail';

interface ScenarioSpec {
  id: DemoScenarioId;
  label: string;
  statusCode: 'OK' | 'REPLAY' | 'STALE' | 'SIG_FAIL' | 'DECRYPT_FAIL';
  outcomeType: 'accept' | 'reject';
  plaintextPreview: string;
  packet: {
    type: 'msg';
    seqno: number;
    ts: number;
    ct: string;
    sig: string;
  };
  receiverLastSeqno: number;
  receiverNowMs: number;
  failedStage: 0 | 1 | 2 | 3 | 4;
  reason: string;
}

const BASE_NOW_MS = 1795588655000;

const scenarios: Record<DemoScenarioId, ScenarioSpec> = {
  accepted: {
    id: 'accepted',
    label: 'Accepted message',
    statusCode: 'OK',
    outcomeType: 'accept',
    plaintextPreview: 'Meet at CNS lab at 14:30 for viva verification.',
    packet: {
      type: 'msg',
      seqno: 4,
      ts: BASE_NOW_MS - 120,
      ct: 'vjI973LZqkO8o6Yim++XLujBuyQUCthSF+ijK0tnb5o=',
      sig: 'T5WB98v0a86bXV9D2CO8wyhBI5DU8jX5VLrRn+tTjI2e5pxJ64vtWtWEHAjlmIB...',
    },
    receiverLastSeqno: 3,
    receiverNowMs: BASE_NOW_MS,
    failedStage: 0,
    reason:
      'All 4 ordered verification gates passed. Receiver advances last_seqno to 4, decrypts plaintext, and appends line to transcript.',
  },
  replay: {
    id: 'replay',
    label: 'Duplicate sequence',
    statusCode: 'REPLAY',
    outcomeType: 'reject',
    plaintextPreview: '[Blocked before decryption — captured frame #3 re-sent]',
    packet: {
      type: 'msg',
      seqno: 3,
      ts: BASE_NOW_MS - 80,
      ct: 'OrZx8mvl7OWdJqfgE62mu+D6g4adNea0mLAiX/YlXPnQHtzEv/g9swaahYj9SL5F',
      sig: 'mm3OcmvB3Nx5rY8rfJaF7x4qWV8bdgCyC250mfhEIBLVbeo/fwV67zkGTL9CZga...',
    },
    receiverLastSeqno: 3,
    receiverNowMs: BASE_NOW_MS,
    failedStage: 1,
    reason:
      'Stage 1 rejected: incoming seqno (3) is not strictly greater than receiver last_seqno (3). Freshness, signature, and decryption are skipped.',
  },
  stale: {
    id: 'stale',
    label: 'Outside freshness window',
    statusCode: 'STALE',
    outcomeType: 'reject',
    plaintextPreview: '[Blocked before decryption — timestamp 5 minutes old]',
    packet: {
      type: 'msg',
      seqno: 5,
      ts: BASE_NOW_MS - 300000,
      ct: 'srzxqssrYKXvL6dAeb1ueDbitPnwksCTzH6BvFPw0z0=',
      sig: 'LURoeYclUPqrI+4Yar2YsMzNiDPEAWkE0d2VbxfAfr5KsXR2Wz+zHgep23BDYwUQ...',
    },
    receiverLastSeqno: 4,
    receiverNowMs: BASE_NOW_MS,
    failedStage: 2,
    reason:
      'Stage 2 rejected: |now_ms - ts| = 300,000 ms exceeds the ±60,000 ms (60s) freshness window, even though seqno > last_seqno.',
  },
  sig_fail: {
    id: 'sig_fail',
    label: 'Invalid signature',
    statusCode: 'SIG_FAIL',
    outcomeType: 'reject',
    plaintextPreview: '[Blocked before decryption — 1 byte flipped in ct]',
    packet: {
      type: 'msg',
      seqno: 6,
      ts: BASE_NOW_MS - 95,
      ct: 'vjI973LZqkO8o6Yim++XLujBuyQUCthSF+ijK0tnb5p=',
      sig: 'T5WB98v0a86bXV9D2CO8wyhBI5DU8jX5VLrRn+tTjI2e5pxJ64vtWtWEHAjlmIB...',
    },
    receiverLastSeqno: 5,
    receiverNowMs: BASE_NOW_MS,
    failedStage: 3,
    reason:
      'Stage 3 rejected: RSA PKCS#1 v1.5 verification failed against SHA-256(seqno || ts || ct) because the ciphertext was modified in transit.',
  },
  decrypt_fail: {
    id: 'decrypt_fail',
    label: 'Bad padding / decrypt error',
    statusCode: 'DECRYPT_FAIL',
    outcomeType: 'reject',
    plaintextPreview: '[AES-128-CBC PKCS#7 unpadding failed]',
    packet: {
      type: 'msg',
      seqno: 7,
      ts: BASE_NOW_MS - 50,
      ct: 'AAECAwQFBgcICQoLDA0ODw==',
      sig: 'SignedMalformedPayloadWithValidKey_DemonstratingStage4Defense...',
    },
    receiverLastSeqno: 6,
    receiverNowMs: BASE_NOW_MS,
    failedStage: 4,
    reason:
      'Stage 4 rejected: decrypt_aes_cbc() requires >= 32 bytes (16-byte IV + at least one 16-byte block) and valid PKCS#7 padding.',
  },
};

const fieldTooltips: Record<string, string> = {
  seqno: 'Monotonically increasing integer per sender session. Receiver requires seqno > last_seqno.',
  ts: 'Sender Unix timestamp in milliseconds (now_ms()). Receiver enforces |now - ts| <= 60,000 ms.',
  ct: 'Base64(16-byte random IV || AES-128-CBC PKCS#7 ciphertext) encrypted with K_session.',
  sig: 'Base64 RSA PKCS#1 v1.5 signature over 32-byte SHA-256(str(seqno) || str(ts) || ct).',
};

export const DemoPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<DemoScenarioId>('accepted');
  const [customText, setCustomText] = useState('Hello Bob, verifying encrypted delivery!');
  const [customSent, setCustomSent] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const active = scenarios[selectedId];

  const stages = [
    { num: 1, title: 'Sequence Check', rule: `seqno (${active.packet.seqno}) > last_seqno (${active.receiverLastSeqno})`, failCode: 'REPLAY' },
    { num: 2, title: 'Freshness Window', rule: `|now - ts| (${Math.abs(active.receiverNowMs - active.packet.ts)} ms) <= 60,000 ms`, failCode: 'STALE' },
    { num: 3, title: 'RSA Signature Verify', rule: 'verify_hash(peer_pubkey, SHA-256(seqno||ts||ct), sig)', failCode: 'SIG_FAIL' },
    { num: 4, title: 'AES-128-CBC Decrypt', rule: 'decrypt_aes_cbc(K_session, IV || ct) + PKCS#7 unpad', failCode: 'DECRYPT_FAIL' },
  ];

  const handleSimulateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setSelectedId('accepted');
    setCustomSent(customText.trim());
  };

  const displayMessage =
    selectedId === 'accepted' && customSent ? customSent : active.plaintextPreview;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header + Independence Banner */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-widest text-cyan-300">05 // Interactive Demo</p>
          <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">
            Browser-only protocol &amp; attack defense sandbox
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-300">
            Inspect how <code className="text-cyan-300">SecureChatSession.process_incoming_message()</code> evaluates
            valid frames versus replay, stale timestamp, tampered signature, and malformed ciphertext attacks—without
            needing a live backend server.
          </p>
        </div>

        <div className="shrink-0 rounded-xl border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-xs text-amber-100">
          <div className="flex items-center gap-2 font-mono font-semibold text-amber-300">
            <AlertCircle className="h-4 w-4" />
            <span>Illustrative Client-Side Simulation</span>
          </div>
          <p className="mt-1 text-amber-100/80">
            Uses precomputed synthetic envelopes modeled on <code className="text-amber-200">app/crypto/session.py</code>.
          </p>
        </div>
      </header>

      {/* Split-Screen Workspace */}
      <section className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* Left Pane: Scenario Selector + Mock Alice/Bob Chat */}
        <div className="lg:col-span-6 space-y-5">
          {/* Scenario Selector */}
          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-5">
            <h2 className="font-display text-base font-bold text-white">1. Choose Packet Scenario</h2>
            <p className="mt-1 text-xs text-slate-400">
              Select a scenario to inspect the wire JSON and trace which validation stage accepts or rejects it.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(Object.values(scenarios) as ScenarioSpec[]).map((s) => {
                const isSelected = s.id === selectedId;
                const badgeColor =
                  s.outcomeType === 'accept'
                    ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/40'
                    : 'bg-rose-400/15 text-rose-300 border-rose-400/40';
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(s.id);
                      if (s.id !== 'accepted') setCustomSent(null);
                    }}
                    aria-pressed={isSelected}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition ${
                      isSelected
                        ? 'border-cyan-400 bg-[#111c33] text-white'
                        : 'border-[#1e2d4a] bg-[#070d19] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className={`font-mono rounded border px-1.5 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
                      {s.statusCode}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mock Alice & Bob Chat Room */}
          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#1e2d4a] bg-[#0e182e] px-4 py-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-300" />
                <span className="font-display text-sm font-semibold text-white">Mock Alice → Bob Chat Stream</span>
              </div>
              <span className="font-mono text-[11px] text-amber-300">ILLUSTRATIVE</span>
            </div>

            <div className="space-y-4 p-4 sm:p-5 bg-[#070d19]">
              {/* Alice Outbound */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-xs sm:text-sm text-slate-100">
                  <div className="font-mono text-[10px] text-cyan-300 mb-1">Alice (Sender) • seqno={active.packet.seqno}</div>
                  {selectedId === 'accepted' ? (
                    <p>{displayMessage}</p>
                  ) : (
                    <p className="italic text-slate-300">
                      Simulated attacker / faulted frame injected onto wire ({active.label}).
                    </p>
                  )}
                </div>
              </div>

              {/* Bob / Receiver Result */}
              <div className="flex justify-start">
                <div
                  className={`max-w-[90%] rounded-2xl rounded-bl-sm border px-4 py-3 text-xs sm:text-sm ${
                    active.outcomeType === 'accept'
                      ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
                      : 'border-rose-400/40 bg-rose-400/10 text-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono text-[11px] font-semibold">
                    {active.outcomeType === 'accept' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-300" />
                    )}
                    <span>
                      Receiver Status: {active.statusCode} (Illustrative)
                    </span>
                  </div>
                  <p className="mt-1.5 text-slate-100">{displayMessage}</p>
                  <p className="mt-1.5 text-[11px] opacity-85">{active.reason}</p>
                </div>
              </div>
            </div>

            {/* Synthetic message composer */}
            <form onSubmit={handleSimulateCustom} className="border-t border-[#1e2d4a] bg-[#0b1324] p-3.5">
              <label htmlFor="demo-msg-input" className="sr-only">
                Synthetic message text
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="demo-msg-input"
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter synthetic message to preview accepted delivery..."
                  className="min-w-0 flex-1 rounded-lg border border-[#1e2d4a] bg-[#060b16] px-3 py-2 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-cyan-400 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  <Send className="h-3.5 w-3.5" /> Simulate OK
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Pane: Packet Inspector + 4-Stage Receiver Feedback */}
        <div className="lg:col-span-6 space-y-5">
          {/* Packet Inspector with Tooltips */}
          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-white">2. Illustrative Packet Inspector</h2>
              <span className="font-mono text-[11px] text-slate-400">Hover or click field labels</span>
            </div>

            <pre className="font-mono mt-3 overflow-x-auto rounded-xl border border-[#1e2d4a] bg-[#040811] p-4 text-xs leading-relaxed text-cyan-200">
              {JSON.stringify(active.packet, null, 2)}
            </pre>

            {/* Field Tooltip Buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(fieldTooltips).map(([field]) => {
                const isOpen = activeTooltip === field;
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => setActiveTooltip(isOpen ? null : field)}
                    aria-expanded={isOpen}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-xs transition ${
                      isOpen
                        ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
                        : 'border-[#1e2d4a] bg-[#070d19] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <HelpCircle className="h-3 w-3" />
                    <span>{field}</span>
                  </button>
                );
              })}
            </div>

            {activeTooltip && (
              <div className="mt-2.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
                <strong className="font-mono">{activeTooltip}:</strong> {fieldTooltips[activeTooltip]}
              </div>
            )}
          </div>

          {/* 4-Stage Ordered Receiver Validation Feedback */}
          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-5">
            <h2 className="font-display text-base font-bold text-white">
              3. Receiver 4-Stage Validation Pipeline (Illustrative)
            </h2>
            <div className="mt-4 space-y-2.5">
              {stages.map((st) => {
                let state: 'pass' | 'fail' | 'skipped' = 'pass';
                if (active.failedStage !== 0) {
                  if (st.num < active.failedStage) state = 'pass';
                  else if (st.num === active.failedStage) state = 'fail';
                  else state = 'skipped';
                }

                return (
                  <div
                    key={st.num}
                    className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${
                      state === 'pass'
                        ? 'border-emerald-400/30 bg-emerald-400/10'
                        : state === 'fail'
                        ? 'border-rose-400/50 bg-rose-400/15'
                        : 'border-[#1e2d4a] bg-[#070d19] opacity-55'
                    }`}
                  >
                    <div>
                      <p className="font-display text-xs font-semibold text-white">
                        Stage {st.num}: {st.title}
                      </p>
                      <p className="font-mono mt-0.5 text-[11px] text-slate-300">{st.rule}</p>
                    </div>
                    <span
                      className={`font-mono shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                        state === 'pass'
                          ? 'bg-emerald-400/20 text-emerald-200'
                          : state === 'fail'
                          ? 'bg-rose-500/25 text-rose-200'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {state === 'pass' ? 'PASS' : state === 'fail' ? st.failCode : 'SKIPPED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Authentic Flask Dashboard Screenshots */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-cyan-300">
              Authentic Runtime Captures
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold text-white">
              Flask Command Center Screenshots (port 5000)
            </h2>
          </div>
          <span className="font-mono rounded border border-emerald-400/35 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-200">
            Captured from live app/web_ui.py sessions (charlie &amp; dana)
          </span>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {siteConfig.dashboardScreenshots
            .filter((s) =>
              ['auth-screen', 'multi-client-charlie', 'multi-client-dana', 'packet-wire', 'attack-sandbox'].includes(
                s.id
              )
            )
            .map((item) => (
              <figure
                key={item.id}
                className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] overflow-hidden flex flex-col"
              >
                {item.src && (
                  <div className="border-b border-[#1e2d4a] bg-[#060b16] p-2">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="h-52 w-full rounded-lg object-contain bg-[#060b16]"
                    />
                  </div>
                )}
                <figcaption className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-sm font-semibold text-white">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{item.caption}</p>
                  </div>
                  <code className="mt-3 block text-[10px] text-cyan-300">{item.recreatedModule}</code>
                </figcaption>
              </figure>
            ))}
        </div>
      </section>

      <PagePager currentPath="/demo" />
    </div>
  );
};
