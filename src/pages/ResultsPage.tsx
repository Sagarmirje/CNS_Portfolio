import React, { useState } from 'react';
import { CheckCircle2, ClipboardCheck, ShieldAlert, Wrench } from 'lucide-react';
import { testMatrixRows, TestMatrixRow } from '../data/projectEvidence';
import { assetUrl } from '../config/siteConfig';
import { PagePager } from '../components/PagePager';

const statusBadge: Record<TestMatrixRow['observedStatus'], string> = {
  'Source-Verified Test': 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  'Source-Reported Result': 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200',
  'Expected Behavior': 'border-amber-400/40 bg-amber-400/10 text-amber-200',
};

export const ResultsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | TestMatrixRow['observedStatus']>('all');

  const filtered =
    filter === 'all' ? testMatrixRows : testMatrixRows.filter((r) => r.observedStatus === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-300">07 // Testing &amp; Results</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">
          Verification matrix, observed evidence &amp; future work
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          Results below distinguish strictly between unit tests verified by inspecting <code className="text-cyan-300">tests/*.py</code>,
          results reported in the supplied <code className="text-cyan-300">README.md</code> and review deck, and
          expected runtime behaviors not executed inside this static portfolio.
        </p>
      </header>

      {/* Summary Evidence Cards */}
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-400/30 bg-[#0b1324] p-5">
          <span className="font-mono text-xs text-emerald-300">tests/*.py (Inspected)</span>
          <p className="font-display mt-1 text-3xl font-bold text-white">22 Test Cases</p>
          <p className="mt-1.5 text-xs text-slate-400">
            5 PKI + 6 Crypto + 5 Replay/Tamper + 2 Transcript + 4 parametrized Web UI tests in{' '}
            <code className="text-slate-200">tests/</code>. (README &amp; slides cite 18 tests prior to{' '}
            <code className="text-slate-200">test_web_ui.py</code>.)
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/30 bg-[#0b1324] p-5">
          <span className="font-mono text-xs text-cyan-300">scripts/demo_attacks.py</span>
          <p className="font-display mt-1 text-3xl font-bold text-white">9 Scenarios</p>
          <p className="mt-1.5 text-xs text-slate-400">
            Self-contained attack harness covering untrusted issuer, expiry, CN mismatch, ciphertext tamper, replay,
            stale timestamp, DB creds, transcript tamper, and DH/AES/RSA round-trip.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-400/30 bg-[#0b1324] p-5">
          <span className="font-mono text-xs text-amber-300">transcripts/ (Archived)</span>
          <p className="font-display mt-1 text-3xl font-bold text-white">88 Artifacts</p>
          <p className="mt-1.5 text-xs text-slate-400">
            Recorded <code className="text-slate-200">_server.log</code>, <code className="text-slate-200">_client.log</code>,
            and signed <code className="text-slate-200">_receipt.json</code> files from development test runs. No
            throughput/latency benchmarks were recorded in the archive.
          </p>
        </div>
      </section>

      {/* Filter Bar + Test Matrix */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-cyan-300" />
            <h2 className="font-display text-2xl font-bold text-white">Verification Matrix</h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['all', 'Source-Verified Test', 'Source-Reported Result', 'Expected Behavior'] as const).map(
              (f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`font-mono rounded-lg border px-2.5 py-1 text-xs transition ${
                    filter === f
                      ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200'
                      : 'border-[#1e2d4a] bg-[#0b1324] text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? `All (${testMatrixRows.length})` : f}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#1e2d4a] bg-[#0b1324]">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#1e2d4a] bg-[#0e182e] text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 font-mono">Scenario</th>
                <th className="px-4 py-3 font-mono">Expected Behavior</th>
                <th className="px-4 py-3 font-mono">Status</th>
                <th className="px-4 py-3 font-mono">Evidence &amp; Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d4a]/70 text-xs sm:text-sm">
              {filtered.map((row) => (
                <tr key={row.id} className="align-top hover:bg-[#111c33]/50">
                  <td className="px-4 py-3.5">
                    <span className="font-mono block text-[11px] text-cyan-300">{row.area}</span>
                    <span className="font-semibold text-white">{row.scenario}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">{row.expectedBehavior}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`font-mono rounded-md border px-2 py-0.5 text-[11px] ${statusBadge[row.observedStatus]}`}>
                      {row.observedStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-300">
                    <p>{row.evidenceDetail}</p>
                    <code className="mt-1 inline-block text-[11px] text-violet-300">{row.sourceRef}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Command Reference */}
      <section className="mt-10 rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6">
        <h2 className="font-display text-lg font-bold text-white">Reproducing Tests &amp; Demonstrations Locally</h2>
        <p className="mt-1 text-xs text-slate-400">
          Commands documented in <code className="text-slate-200">RUN_PROJECT.md</code> and{' '}
          <code className="text-slate-200">README.md</code> (note: local verification was not executed in this static
          browser environment because the archived <code className="text-slate-200">.venv</code> targets an external host
          Python path).
        </p>
        <pre className="font-mono mt-3 overflow-x-auto rounded-xl border border-[#1e2d4a] bg-[#040811] p-4 text-xs text-cyan-200">
{`python -m pytest tests/ -v
python scripts/demo_attacks.py
python scripts/demo_chat_e2e.py
python tools/verify_transcript.py transcripts/<sid>_server.log transcripts/<sid>_server_peer_receipt.json certs/alice.crt`}
        </pre>
      </section>

      {/* Runtime Screenshots Section */}
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Observed Runtime Captures</h2>
            <p className="mt-1 text-xs text-slate-400">
              Screenshots captured from the running SecureChat server and Flask web dashboard demonstrating concurrent
              multi-client sessions, live wire framing, and attack-defense controls.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {[
            {
              src: assetUrl('demo-screenshots/charlie.jpeg'),
              title: 'Multi-Client Session 1 — "charlie" (Session c8538c10)',
              caption:
                'Shows active Step 6 & 7 data plane status, Attack Defense Sandbox, and persisted append-only transcript logs (15fcb2ce_server.log & receipt JSON).',
            },
            {
              src: assetUrl('demo-screenshots/dana.jpeg'),
              title: 'Multi-Client Session 2 — "dana" (Session 77b9814f)',
              caption:
                'Demonstrates concurrent multi-client authentication with Mutual PKI + Ephemeral DH handshake and live Packet Wire output.',
            },
          ].map((shot) => (
            <figure key={shot.src} className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] overflow-hidden">
              <div className="border-b border-[#1e2d4a] bg-[#060b16] p-2">
                <img src={shot.src} alt={shot.title} className="w-full rounded-lg object-contain bg-[#060b16]" />
              </div>
              <figcaption className="p-4">
                <h3 className="font-display text-sm font-semibold text-white">{shot.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{shot.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Observed Limitations & Future Work */}
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-rose-400/25 bg-[#0b1324] p-6">
          <div className="flex items-center gap-2 text-rose-300">
            <ShieldAlert className="h-5 w-5" />
            <h2 className="font-display text-lg font-bold text-white">Observed Implementation Limitations</h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-slate-300">
            <li>• <strong className="text-white">Server Plaintext Relay:</strong> Server decrypts incoming messages before re-encrypting per peer in <code className="text-slate-200">broadcast()</code>.</li>
            <li>• <strong className="text-white">Fast Password Hash:</strong> Uses single-pass salted <code className="text-slate-200">SHA-256(salt || pwd)</code> instead of a memory-hard KDF.</li>
            <li>• <strong className="text-white">Unauthenticated CBC Mode:</strong> Uses AES-128-CBC + separate RSA PKCS#1 v1.5 signature rather than AEAD; Step 3 auth frames lack RSA signatures.</li>
            <li>• <strong className="text-white">Simple Key Derivation:</strong> Uses <code className="text-slate-200">Trunc16(SHA-256)</code> instead of RFC 5869 HKDF with context binding.</li>
            <li>• <strong className="text-white">No Revocation or Key Protection:</strong> No CRL/OCSP checks in <code className="text-slate-200">pki.py</code>; private keys sit unencrypted on disk; Flask runs its dev server without rate limiting.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-emerald-400/25 bg-[#0b1324] p-6">
          <div className="flex items-center gap-2 text-emerald-300">
            <Wrench className="h-5 w-5" />
            <h2 className="font-display text-lg font-bold text-white">Clearly Labeled Future Improvements</h2>
          </div>
          <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span><strong className="text-white">Authenticated Encryption (AEAD):</strong> Migrate AES-128-CBC to AES-128-GCM or ChaCha20-Poly1305.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span><strong className="text-white">Hardened Password Storage:</strong> Replace salted SHA-256 with Argon2id or bcrypt plus login lockout/rate limiting.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span><strong className="text-white">RFC 5869 HKDF &amp; True Client-to-Client E2EE:</strong> Derive separate directional keys via HKDF and negotiate pairwise client keys so the server relays ciphertext blindly.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span><strong className="text-white">Production Transport &amp; PKI Lifecycle:</strong> Wrap TCP in TLS 1.3 mTLS, enforce CRL/OCSP revocation, encrypt local keys, and deploy behind Gunicorn.</span>
            </li>
          </ul>
        </div>
      </section>

      <PagePager currentPath="/results" />
    </div>
  );
};
