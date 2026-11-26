import React, { useState } from 'react';
import { Cpu, FileCode2, Info, Lock, ShieldAlert, KeyRound } from 'lucide-react';
import { sourceMapItems } from '../data/projectEvidence';
import { assetUrl } from '../config/siteConfig';
import { PagePager } from '../components/PagePager';

const primitives = [
  {
    name: 'X.509 Certificates & Private Root CA',
    color: 'border-cyan-400/35 bg-cyan-400/5',
    badgeClass: 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10',
    step: 'Steps 1–2 (Handshake) & Step 3 (CN Binding)',
    purpose:
      'Establishes a project-local Public Key Infrastructure. scripts/gen_ca.py generates a 2048-bit RSA Root CA (BasicConstraints ca=True), and scripts/gen_cert.py signs role-scoped leaf certificates (serverAuth + localhost/127.0.0.1 SAN, or clientAuth).',
    protection:
      'Prevents endpoint impersonation. validate_certificate() checks issuer == Root CA subject, blocks unauthorized self-signed certs (UNTRUSTED_ISSUER), verifies RSA PKCS#1 v1.5 CA signature (BAD_CERT_SIGNATURE), enforces UTC validity (CERT_EXPIRED), and checks expected CN (CERT_CN_MISMATCH).',
    files: 'scripts/gen_ca.py, scripts/gen_cert.py, app/crypto/pki.py',
  },
  {
    name: 'Diffie–Hellman Key Agreement (RFC 3526 Group 14)',
    color: 'border-violet-400/35 bg-violet-400/5',
    badgeClass: 'text-violet-300 border-violet-400/40 bg-violet-400/10',
    step: 'Step 3 (K_temp) & Steps 4–5 (K_session)',
    purpose:
      'Negotiates 128-bit AES keys over an untrusted channel without transmitting key material. Uses a 2048-bit MODP Group 14 prime p and generator g = 2, strictly validating peer public values (1 < y < p - 1).',
    protection:
      'Step 3 creates K_temp to shield login/register credentials on the wire. Steps 4–5 bind fresh DH public values and 16-byte nonces with RSA-PSS signatures to stop MITM substitution and provide per-session forward secrecy.',
    files: 'app/crypto/dh.py (DiffieHellman, sign_dh_exchange, verify_dh_exchange)',
  },
  {
    name: 'AES-128-CBC with PKCS#7 Padding',
    color: 'border-emerald-400/35 bg-emerald-400/5',
    badgeClass: 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10',
    step: 'Step 3 (Auth Envelope) & Steps 6–7 (Chat Payload)',
    purpose:
      'Provides symmetric confidentiality for variable-length JSON auth payloads and UTF-8 chat messages. Each encryption generates a fresh 16-byte os.urandom(16) IV and prepends it to the ciphertext (minimum 32 bytes).',
    protection:
      'Prevents passive eavesdropping on port 8443. Fresh per-message IVs ensure identical plaintexts produce distinct ciphertexts (semantic security under CPA).',
    files: 'app/crypto/aes.py (encrypt_aes_cbc, decrypt_aes_cbc)',
  },
  {
    name: 'RSA Digital Signatures (PKCS#1 v1.5 & RSA-PSS)',
    color: 'border-amber-400/35 bg-amber-400/5',
    badgeClass: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
    step: 'Step 4 (RSA-PSS), Steps 6–7 (PKCS#1 v1.5), Step 8 (SessionReceipt)',
    purpose:
      'Provides asymmetric origin authentication and integrity. Step 4 uses RSA-PSS (MGF1-SHA256, MAX_LENGTH salt) over (dh_pub || nonce); Steps 6–8 use RSA PKCS#1 v1.5 over 32-byte SHA-256 digests.',
    protection:
      'Detects in-transit tampering of seqno, ts, or ciphertext before decryption (SIG_FAIL) and cryptographically binds messages and SessionReceipts to the signer’s certificate.',
    files: 'app/crypto/sign.py, app/crypto/dh.py, app/storage/transcript.py',
  },
  {
    name: 'SHA-256 Hashing',
    color: 'border-cyan-400/35 bg-cyan-400/5',
    badgeClass: 'text-cyan-300 border-cyan-400/40 bg-cyan-400/10',
    step: 'Steps 3, 5, 6–7, 8 & Credential Store',
    purpose:
      'Computes message digests h = SHA-256(str(seqno) || str(ts) || ct_b64), key derivation Trunc16(SHA-256(big_endian(s))), X.509 cert fingerprints, whole-transcript hashes, and salted password hashes.',
    protection:
      'Binds sequence number, timestamp, and ciphertext into one collision-resistant digest so modifying any field invalidates the RSA signature and transcript summary.',
    files: 'app/crypto/sign.py, app/crypto/dh.py, app/storage/db.py, app/storage/transcript.py',
  },
];

export const ImplementationPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState(sourceMapItems[0].path);
  const activeSource = sourceMapItems.find((m) => m.path === selectedModule) ?? sourceMapItems[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-300">
          04 // Cryptography &amp; Implementation
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">
          Cryptographic primitives, source map &amp; security precision
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          Every claim on this page is verified directly against the Python modules inside{' '}
          <code className="text-cyan-300">CNS_courseproject/app/</code>, including exact padding schemes, key
          derivation formulas, and trust-model boundaries.
        </p>
      </header>

      {/* HKDF Verification / Reconciliation Callout */}
      <section className="mt-8 rounded-2xl border border-violet-400/40 bg-violet-400/10 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
          <div>
            <h2 className="font-display text-base font-bold text-white">
              Source-Code Verification Note: HKDF vs <code className="text-violet-200">Trunc16(SHA-256)</code>
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-200">
              While the overview architecture illustration labels the key derivation block as <em>“Key Derivation Engine
              (HKDF)”</em>, inspecting <code className="text-violet-200">DiffieHellman.derive_key()</code> in{' '}
              <code className="text-violet-200">app/crypto/dh.py</code> confirms that the implementation derives 16-byte
              AES-128 keys using single-step truncation:{' '}
              <code className="rounded bg-[#060b16] px-2 py-0.5 text-xs text-cyan-200">
                hashlib.sha256(shared_secret.to_bytes(256, "big")).digest()[:16]
              </code>
              . Adopting full RFC 5869 HKDF-Extract/Expand with domain separation salts (distinct info strings for{' '}
              <code className="text-violet-200">K_temp</code> and <code className="text-cyan-200">K_session</code>) is
              documented on our Results &amp; Future Work page.
            </p>
          </div>
        </div>
      </section>

      {/* Primitive Explainers */}
      <section className="mt-10 space-y-4">
        <h2 className="font-display text-2xl font-bold text-white">Cryptographic Mechanisms</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {primitives.map((prim) => (
            <article key={prim.name} className={`rounded-2xl border p-5 sm:p-6 ${prim.color}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-white">{prim.name}</h3>
                <span className={`font-mono rounded-lg border px-2.5 py-0.5 text-[11px] ${prim.badgeClass}`}>
                  {prim.step}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                <strong className="text-white">Purpose:</strong> {prim.purpose}
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                <strong className="text-white">Protection depending on it:</strong> {prim.protection}
              </p>
              <p className="font-mono mt-3 text-xs text-slate-400">Implementation: {prim.files}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Interactive Source Map */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <FileCode2 className="h-5 w-5 text-cyan-300" />
          <h2 className="font-display text-2xl font-bold text-white">Interactive Source Map</h2>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Select a file or subsystem to inspect its exported symbols and architectural role.
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-2 max-h-[470px] overflow-y-auto pr-1">
            {sourceMapItems.map((item) => {
              const active = item.path === activeSource.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => setSelectedModule(item.path)}
                  aria-pressed={active}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-cyan-400 bg-[#111c33]'
                      : 'border-[#1e2d4a] bg-[#0b1324] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-semibold text-cyan-300">{item.path}</code>
                    <span className="text-[11px] text-slate-400">{item.keySymbols.length} symbols</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">{item.role}</p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6">
            <div className="flex items-center gap-2 text-cyan-300">
              <Cpu className="h-4 w-4" />
              <code className="text-sm font-semibold">{activeSource.path}</code>
            </div>
            <h3 className="font-display mt-2 text-xl font-bold text-white">{activeSource.role}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{activeSource.details}</p>

            <div className="mt-5">
              <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
                Key Classes, Functions &amp; Constants
              </span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {activeSource.keySymbols.map((sym) => (
                  <code
                    key={sym}
                    className="rounded-lg border border-[#1e2d4a] bg-[#060b16] px-2.5 py-1 text-xs text-violet-300"
                  >
                    {sym}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational PoC, Credential Storage & Terminology Precision */}
      <section className="mt-12 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6">
          <div className="flex items-center gap-2 text-amber-300">
            <Lock className="h-5 w-5" />
            <h2 className="font-display text-lg font-bold text-white">Credential Storage &amp; Limitations</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            In <code className="text-cyan-300">app/storage/db.py</code>, registration generates a 16-byte salt via{' '}
            <code className="text-cyan-300">os.urandom(16)</code> and stores{' '}
            <code className="text-cyan-300">SHA-256(salt || password)</code> using parameterized SQL queries (MySQL or
            SQLite fallback). Login checks compare hashes in constant time via{' '}
            <code className="text-cyan-300">hmac.compare_digest</code>.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-amber-200/90">
            <strong>Known limitation:</strong> Single-pass SHA-256—even salted—is fast on GPUs if a database snapshot
            leaks. Production deployments must replace it with a slow, memory-hard password KDF such as{' '}
            <strong>Argon2id</strong>, <strong>bcrypt</strong>, or <strong>scrypt</strong>, plus login rate limiting.
          </p>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6">
          <div className="flex items-center gap-2 text-cyan-300">
            <ShieldAlert className="h-5 w-5" />
            <h2 className="font-display text-lg font-bold text-white">
              Educational Proof-of-Concept: Exact Scope of Security Claims
            </h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs leading-relaxed">
            <div className="rounded-xl border border-[#1e2d4a] bg-[#070d19] p-3.5">
              <p className="font-mono font-semibold text-cyan-300">“mTLS” → Application-Layer Mutual PKI</p>
              <p className="mt-1 text-slate-300">
                Mutual X.509 certificate verification runs over custom 4-byte length-prefixed TCP JSON frames rather
                than OS/OpenSSL TLS 1.3 sockets.
              </p>
            </div>
            <div className="rounded-xl border border-[#1e2d4a] bg-[#070d19] p-3.5">
              <p className="font-mono font-semibold text-amber-300">“End-to-End Encryption” → Client↔Server Hop</p>
              <p className="mt-1 text-slate-300">
                Sessions terminate at the TCP server: the server decrypts Alice’s payload and re-encrypts it under Bob’s
                session key. The server is trusted with plaintext.
              </p>
            </div>
            <div className="rounded-xl border border-[#1e2d4a] bg-[#070d19] p-3.5">
              <p className="font-mono font-semibold text-violet-300">“Forward Secrecy” → Supported per Session</p>
              <p className="mt-1 text-slate-300">
                Each session negotiates a fresh ephemeral 2048-bit DH secret; later compromise of RSA signing keys does
                not allow passive decryption of past traffic.
              </p>
            </div>
            <div className="rounded-xl border border-[#1e2d4a] bg-[#070d19] p-3.5">
              <p className="font-mono font-semibold text-emerald-300">“Non-Repudiation” → Key-Dependent</p>
              <p className="mt-1 text-slate-300">
                RSA signatures on messages and SessionReceipts bind authorship to the signer’s certificate, assuming
                private keys on disk (<code className="text-slate-200">certs/*.key</code>) and the Root CA remain uncompromised.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <KeyRound className="h-4 w-4 text-violet-300" />
        <span>
          Note: Local private keys in <code className="text-slate-300">certs/*.key</code> are stored unencrypted PEM files
          with <code className="text-slate-300">0600</code> permissions for automated lab/viva runs.
        </span>
      </div>

      {/* Live X.509 Hub Capture */}
      <section className="mt-12 rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2d4a] pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Captured X.509 Certificate Inspector (<code className="text-cyan-300">/api/certs_info</code>)
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Live dashboard output displaying parsed Root CA and Server certificate fields from <code className="text-slate-200">certs/</code>.
            </p>
          </div>
          <span className="font-mono rounded border border-emerald-400/35 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-200">
            Demo Screenshot
          </span>
        </div>

        <figure className="mt-5 grid gap-6 items-center lg:grid-cols-12">
          <div className="lg:col-span-6 rounded-xl border border-[#1e2d4a] bg-[#060b16] p-2">
            <img
              src={assetUrl('demo-screenshots/X509.jpeg')}
              alt="SecureChat Flask dashboard X.509 Hub showing Root CA and Server 2048-bit RSA certificate details and SHA-256 fingerprints."
              className="mx-auto max-h-96 w-full rounded-lg object-contain"
            />
          </div>
          <figcaption className="lg:col-span-6 space-y-3 text-sm text-slate-300">
            <p>
              The <strong className="text-white">X.509 Hub</strong> tab in <code className="text-cyan-300">app/web_ui.py</code>{' '}
              parses the certificate chain on disk and displays:
            </p>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li>• <strong className="text-white">Root CA:</strong> <code className="text-cyan-300">CN=SecureChat Root CA, O=SecureChat Security, C=US</code> (2048-bit RSA).</li>
              <li>• <strong className="text-white">Server Leaf Cert:</strong> <code className="text-cyan-300">CN=server, O=SecureChat Network, C=US</code> signed by Root CA.</li>
              <li>• <strong className="text-white">Fingerprints &amp; Validity:</strong> Full SHA-256 DER fingerprints, serial numbers, and UTC validity window (<code className="text-slate-200">2026-11-16</code> to <code className="text-slate-200">2027-11-16</code>).</li>
            </ul>
          </figcaption>
        </figure>
      </section>

      <PagePager currentPath="/implementation" />
    </div>
  );
};
