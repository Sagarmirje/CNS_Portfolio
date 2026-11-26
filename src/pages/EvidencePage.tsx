import React from 'react';
import { CheckCircle2, FileCheck2, FileText, Lock, ShieldAlert, Terminal } from 'lucide-react';
import { assetUrl } from '../config/siteConfig';
import { PagePager } from '../components/PagePager';

const sampleReceipt = {
  receipt: {
    peer: 'bob',
    first_seq: 2,
    last_seq: 3,
    transcript_sha256: 'adbc3efa57d9970264204e521d289f2a886b7e216b5f816338c36644b261c3f7',
    ts: 1795588691663,
  },
  sig: 'AHHFEapWqhziL6see31BntbOmhIag2RmyVuZL1G+mbYvCB+z827+w5pJ+HNiVsQ3bKSdMJiwUqmhumWcFOy617Zs1qn5wkQsnHUTx5YURBlqSMm3c0FizCCtzwKpjl/lLWoF8pJOkxRA/YElV+JJRRVd7VO1BBkvkbhtsq4AkUJnNkPpHJ9r4sDplXzK9YOTFzh6dybd8rX0ksV47bZ52puSY50JFo4aTp16RJnL0qh8XmOIpxA9C79iIYNsapYcrCCjcngK4G02F8fRaB4M/kLPlKCvJZH+KlVHmVYQIehRfrqXHjWr8dA73Txz6bswN/NuZit4q38oluL3ynVxZA==',
};

const sampleTranscriptLines = [
  '2 | 1795588633911 | vjI973LZqkO8o6Yim++XLujBuyQUCthSF+ijK0tnb5o= | T5WB98v0a86b...[RSA-PKCS1v1.5] | ad9a9c4b29fa88f2482fc73e1bd6b7f2e9e91bffab51be8d9237f830ab10129f',
  '3 | 1795588655013 | OrZx8mvl7OWdJqfgE62mu+D6g4adNea0mLAiX/YlXPnQHtzEv/g9swaahYj9SL5F | mm3OcmvB3Nx5...[RSA-PKCS1v1.5] | ad9a9c4b29fa88f2482fc73e1bd6b7f2e9e91bffab51be8d9237f830ab10129f',
];

export const EvidencePage: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Document-Led Editorial Header */}
      <header className="border-b border-[#1e2d4a] pb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-amber-300">06 // Audit &amp; Evidence</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">
          Non-repudiation lifecycle &amp; offline verification
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          Beyond confidentiality during transit, SecureChat generates persistent cryptographic evidence on disk so an
          independent auditor can verify session integrity and message authorship offline using{' '}
          <code className="text-amber-300">tools/verify_transcript.py</code>.
        </p>
      </header>

      {/* Lifecycle Document Flow */}
      <section className="mt-10 space-y-6">
        <h2 className="font-display text-2xl font-bold text-white">Evidence Lifecycle</h2>

        <div className="space-y-4">
          {[
            {
              step: 'Stage 01',
              title: 'Accepted Message Logging (Data Plane → Storage)',
              body: 'Only after all 4 verification checks pass (REPLAY, STALE, SIG_FAIL, DECRYPT_FAIL) does SecureChatSession.process_incoming_message() call self.transcript.log_message(seqno, ts, ct_b64, sig_b64).',
              code: 'seqno | ts | ct_b64 | sig_b64 | peer_cert_fingerprint_sha256',
            },
            {
              step: 'Stage 02',
              title: 'Transcript Digest Computation',
              body: 'TranscriptLogger.compute_transcript_hash() reads the complete binary contents of transcripts/<session_id>_<role>.log and computes a single SHA-256 digest over the concatenated log lines. Note: while the architecture diagram summarizes this as "SHA-256 Hash Chaining", the verified code hashes the whole append-only file directly rather than chaining H_i = SHA-256(H_{i-1} || line_i).',
              code: 'TranscriptHash = hashlib.sha256(open(file_path, "rb").read()).hexdigest()',
            },
            {
              step: 'Stage 03',
              title: 'Canonical SessionReceipt Signing & Mutual Exchange (/quit)',
              body: 'When a client sends /quit with its peer_summary, both sides exchange receipt_exchange and receipt_ack frames. Each receipt dictionary is serialized canonically with json.dumps(receipt_data, sort_keys=True) and signed using RSA PKCS#1 v1.5.',
              code: 'transcripts/<sid>_server_receipt.json & <sid>_server_peer_receipt.json',
            },
            {
              step: 'Stage 04',
              title: 'Offline Mathematical Verification',
              body: 'A third-party auditor invokes tools/verify_transcript.py with the .log transcript, *_receipt.json, and peer’s .crt file—requiring zero access to private keys, session AES keys, or plaintext messages.',
              code: 'python tools/verify_transcript.py <transcript.log> <receipt.json> <peer.crt>',
            },
          ].map((stage) => (
            <article key={stage.step} className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="font-mono rounded border border-amber-400/35 bg-amber-400/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                  {stage.step}
                </span>
                <h3 className="font-display text-lg font-bold text-white">{stage.title}</h3>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300 break-words">{stage.body}</p>
              <pre className="font-mono mt-3 max-w-full overflow-x-auto rounded-lg border border-[#1e2d4a] bg-[#050912] px-3 py-2 text-xs text-amber-200">
                {stage.code}
              </pre>
            </article>
          ))}
        </div>
      </section>

      {/* Sample Receipt & Labeled Fields */}
      <section className="mt-12 rounded-2xl border border-amber-400/30 bg-[#0b1324] p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2d4a] pb-4">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-amber-300" />
            <h2 className="font-display text-xl font-bold text-white">
              Recorded SessionReceipt &amp; Transcript Artifact (Session <code className="text-amber-300">15fcb2ce</code>)
            </h2>
          </div>
          <span className="font-mono text-[11px] text-amber-200">From CNS_courseproject/transcripts/</span>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-6">
            <p className="font-mono text-xs uppercase tracking-wider text-slate-400 mb-2">
              15fcb2ce_server_receipt.json
            </p>
            <pre className="font-mono max-w-full overflow-x-auto rounded-xl border border-[#1e2d4a] bg-[#040811] p-4 text-xs leading-relaxed text-amber-200">
              {JSON.stringify(sampleReceipt, null, 2)}
            </pre>
          </div>

          <div className="lg:col-span-6 space-y-2.5">
            <p className="font-mono text-xs uppercase tracking-wider text-slate-400 mb-2">Labeled Receipt Fields</p>
            {[
              ['receipt.peer', 'Authenticated peer identity covered by this receipt ("bob" or "server").'],
              ['receipt.first_seq / last_seq', 'First and last accepted message sequence numbers logged in this session (2 .. 3).'],
              ['receipt.transcript_sha256', 'Hex SHA-256 digest of the entire binary transcript .log file.'],
              ['receipt.ts', 'Millisecond Unix timestamp when the SessionReceipt was generated.'],
              ['sig', 'Base64 RSA PKCS#1 v1.5 signature over json.dumps(receipt, sort_keys=True).'],
            ].map(([field, desc]) => (
              <div key={field} className="rounded-lg border border-[#1e2d4a] bg-[#070d19] p-3 text-xs">
                <code className="font-semibold text-amber-300">{field}</code>
                <p className="mt-1 text-slate-300">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="font-mono text-xs uppercase tracking-wider text-slate-400 mb-2">
            Corresponding Pipe-Delimited Log Lines (15fcb2ce_server.log — Signatures Abbreviated)
          </p>
          <pre className="font-mono overflow-x-auto rounded-xl border border-[#1e2d4a] bg-[#040811] p-4 text-[11px] leading-relaxed text-slate-300">
            {sampleTranscriptLines.join('\n')}
          </pre>
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-300" />
            <span>
              Notice zero plaintext appears in the transcript: only <code className="text-slate-200">ct_b64</code>,{' '}
              <code className="text-slate-200">sig_b64</code>, metadata, and the peer certificate SHA-256 fingerprint.
            </span>
          </p>
        </div>
      </section>

      {/* How Verification Works Checklist */}
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6">
          <div className="flex items-center gap-2 text-emerald-300">
            <Terminal className="h-5 w-5" />
            <h2 className="font-display text-lg font-bold text-white">
              How Verification Works (<code className="text-emerald-300">verify_transcript.py</code>)
            </h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {[
              'Loads the peer’s X.509 certificate, extracts RSA public key, and computes expected SHA-256 cert fingerprint.',
              'Reads raw transcript .log bytes and checks hashlib.sha256(content).hexdigest() == receipt["transcript_sha256"].',
              'Serializes receipt_data with sort_keys=True and verifies receipt RSA signature using peer_pubkey.',
              'Parses every non-empty transcript line into 5 fields and confirms column 5 matches expected_fingerprint.',
              'Recomputes h = SHA-256(seqno || ts || ct_b64) and verifies each individual message RSA signature.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-xs sm:text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6">
          <div className="flex items-center gap-2 text-amber-300">
            <ShieldAlert className="h-5 w-5" />
            <h2 className="font-display text-lg font-bold text-white">What Verification Establishes &amp; Assumptions</h2>
          </div>
          <div className="mt-4 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-300">
            <p>
              <strong className="text-emerald-300">Mathematically established on PASS:</strong> No byte of the
              transcript log was modified after the receipt was signed, the holder of the peer’s RSA private key signed
              the SessionReceipt summary, and every logged message frame bears a valid signature from that same key.
            </p>
            <p>
              <strong className="text-amber-200">Claims depending on trusted keys &amp; records:</strong> Non-repudiation
              assumes (1) the Root CA binding <code className="text-slate-200">peer.crt</code> to the real human user is
              trustworthy, (2) the peer’s private key (<code className="text-slate-200">certs/*.key</code>) was not
              stolen or forged, and (3) an omitting party did not selectively drop messages before signing—since{' '}
              <code className="text-slate-200">verify_transcript.py</code> audits completeness against{' '}
              <code className="text-slate-200">transcript_sha256</code> rather than checking contiguous sequence gaps.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-[#1e2d4a] bg-[#050912] p-3">
            <p className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-cyan-300" /> Documented CLI Output (README.md):
            </p>
            <pre className="font-mono mt-1.5 overflow-x-auto text-[11px] text-emerald-300">
{`[PASS] Transcript Hash Match: eededf0db1ece4...
[PASS] SessionReceipt RSA Signature: VALID
[PASS] All 1 Message Signatures: VERIFIED
[SUCCESS] All non-repudiation cryptographic checks PASSED!`}
            </pre>
          </div>
        </div>
      </section>

      {/* Captured Dashboard Evidence Panel Screenshot */}
      <section className="mt-12 rounded-2xl border border-amber-400/30 bg-[#0b1324] p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2d4a] pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Captured Dashboard Evidence Tab (<code className="text-amber-300">/api/transcripts</code>)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Live screenshot showing persisted <code className="text-slate-200">065b9db8</code> receipt JSONs and the one-click <code className="text-slate-200">verify_transcript.py</code> audit trigger.
            </p>
          </div>
          <span className="font-mono rounded border border-amber-400/35 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-200">
            Demo Screenshot
          </span>
        </div>

        <figure className="mt-5 grid gap-6 items-center lg:grid-cols-12">
          <div className="lg:col-span-6 rounded-xl border border-[#1e2d4a] bg-[#060b16] p-2">
            <img
              src={assetUrl('demo-screenshots/Evidnace.jpeg')}
              alt="SecureChat Flask dashboard Evidence tab showing 065b9db8 client and peer SessionReceipt JSON files and Audit Non-Repudiation button."
              className="mx-auto max-h-96 w-full rounded-lg object-contain"
            />
          </div>
          <figcaption className="lg:col-span-6 space-y-2.5 text-xs sm:text-sm text-slate-300">
            <p>
              This runtime capture from the Flask Command Center (<code className="text-cyan-300">app/templates/index.html</code>)
              demonstrates how generated <code className="text-amber-300">*_client_receipt.json</code> and{' '}
              <code className="text-amber-300">*_client_peer_receipt.json</code> files are surfaced in the browser.
            </p>
            <p>
              Clicking <strong className="text-emerald-300">Audit Non-Repudiation (verify_transcript.py)</strong> invokes{' '}
              <code className="text-cyan-300">/api/run_audit</code> to execute the 9-scenario defense verification suite.
            </p>
          </figcaption>
        </figure>
      </section>

      <PagePager currentPath="/evidence" />
    </div>
  );
};
