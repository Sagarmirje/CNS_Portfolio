import React, { useState } from 'react';
import { Database, Cpu, FileSignature, LayoutDashboard, Server, ShieldAlert, ArrowDown } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { architectureComponents } from '../data/projectEvidence';
import { DiagramViewer } from '../components/DiagramViewer';
import { PagePager } from '../components/PagePager';

const iconMap = {
  dashboard: LayoutDashboard,
  server: Server,
  database: Database,
  crypto: Cpu,
  evidence: FileSignature,
};

export const ArchitecturePage: React.FC = () => {
  const [diagramTab, setDiagramTab] = useState<'detailed' | 'overview'>('detailed');
  const [selectedId, setSelectedId] = useState<string>('server');

  const activeComponent =
    architectureComponents.find((c) => c.id === selectedId) ?? architectureComponents[1];

  const activeDiagram =
    diagramTab === 'detailed'
      ? {
          title: 'Detailed 5-Tier System Architecture & Validation Pipeline',
          ...siteConfig.diagrams.architectureDetailed,
        }
      : {
          title: 'High-Level Component & Plane Architecture',
          ...siteConfig.diagrams.architectureOverview,
        };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-300">02 // System Architecture</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">
          Five coordinated tiers, explicit trust boundaries
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          Inspect the supplied architecture diagrams, select individual components to review their inputs/outputs, and
          trace exactly where credentials, session keys, plaintext, and audit records reside.
        </p>
      </header>

      {/* Diagram Canvas with Switcher */}
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Select architecture diagram view">
          <button
            type="button"
            role="tab"
            aria-selected={diagramTab === 'detailed'}
            onClick={() => setDiagramTab('detailed')}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              diagramTab === 'detailed'
                ? 'border border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
                : 'border border-[#1e2d4a] bg-[#0b1324] text-slate-300 hover:text-white'
            }`}
          >
            Detailed 5-Tier Architecture
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={diagramTab === 'overview'}
            onClick={() => setDiagramTab('overview')}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              diagramTab === 'overview'
                ? 'border border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
                : 'border border-[#1e2d4a] bg-[#0b1324] text-slate-300 hover:text-white'
            }`}
          >
            High-Level Plane Overview
          </button>
        </div>

        <DiagramViewer
          src={activeDiagram.src}
          alt={activeDiagram.alt}
          caption={activeDiagram.caption}
          title={activeDiagram.title}
          textEquivalentTitle="Text Equivalent: Architecture Tiers & Source Reconciliation"
          textEquivalent={
            <div className="space-y-3 text-xs sm:text-sm">
              <p>
                <strong>1. Alice / Bob Web Dashboard (127.0.0.1:5000):</strong> Flask frontend + REST APIs managing
                local <code className="text-cyan-300">SecureChatClient</code> instances, packet wire inspector, and
                attack defense triggers.
              </p>
              <p>
                <strong>2. SecureChat TCP Server (127.0.0.1:8443):</strong> Multithreaded{' '}
                <code className="text-cyan-300">ClientHandler</code> threads running mutual X.509 validation, temporary
                DH auth, RSA-PSS signed session DH, 4-stage receiver verification, peer relay, and receipt exchange.
              </p>
              <p>
                <strong>3. Database (MySQL 3306 / SQLite securechat.db):</strong> Stores{' '}
                <code className="text-emerald-300">users(id, email, username, salt, pwd_hash, created_at)</code> using
                parameterized queries and 16-byte random salts.
              </p>
              <p>
                <strong>4. Cryptography Modules (app/crypto/):</strong> X.509 CA validation, RFC 3526 MODP Group 14 DH
                (<code className="text-violet-300">Trunc16(SHA-256)</code>), AES-128-CBC (PKCS#7), SHA-256 + RSA, and
                ordered session verification.
              </p>
              <p>
                <strong>5. Evidence Storage (transcripts/):</strong> Append-only{' '}
                <code className="text-amber-300">.log</code> transcripts, whole-file SHA-256 summaries, RSA-signed{' '}
                <code className="text-amber-300">SessionReceipt</code> JSONs, and{' '}
                <code className="text-amber-300">tools/verify_transcript.py</code>.
              </p>
            </div>
          }
        />
      </section>

      {/* Selectable Component Cards */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-white">Interactive Component Explorer</h2>
        <p className="mt-1 text-sm text-slate-400">
          Select any architectural tier below to inspect its exact responsibilities, endpoints, and source files.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {architectureComponents.map((comp) => {
            const Icon = iconMap[comp.id];
            const isSelected = comp.id === activeComponent.id;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => setSelectedId(comp.id)}
                aria-pressed={isSelected}
                className={`rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? 'border-cyan-400 bg-[#111c33] shadow-[0_0_24px_rgba(34,211,238,0.12)]'
                    : 'border-[#1e2d4a] bg-[#0b1324] hover:border-slate-600'
                }`}
              >
                <Icon className={`h-5 w-5 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span className="font-display mt-3 block text-sm font-semibold text-white">{comp.name}</span>
                <span className="font-mono mt-1 block text-[11px] text-slate-400">{comp.endpointOrPath}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Component Detail Panel */}
        <div className="mt-4 rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#1e2d4a] pb-4">
            <div>
              <h3 className="font-display text-xl font-bold text-white">{activeComponent.name}</h3>
              <p className="text-sm text-cyan-300">{activeComponent.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="font-mono rounded-lg border border-[#1e2d4a] bg-[#060b16] px-3 py-1 text-xs text-slate-200">
                {activeComponent.endpointOrPath}
              </span>
              <span
                className={`font-mono rounded-lg border px-3 py-1 text-xs ${
                  activeComponent.plaintextAccess.startsWith('Yes')
                    ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                    : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
                }`}
              >
                Plaintext Access: {activeComponent.plaintextAccess}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400">Verified Responsibilities</h4>
              <ul className="mt-2.5 space-y-2 text-sm text-slate-300">
                {activeComponent.responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400">Inputs / Outputs</h4>
                <p className="mt-1.5 text-xs text-slate-300">
                  <strong className="text-white">In:</strong> {activeComponent.inputs.join('; ')}
                </p>
                <p className="mt-1.5 text-xs text-slate-300">
                  <strong className="text-white">Out:</strong> {activeComponent.outputs.join('; ')}
                </p>
              </div>
              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400">Source Files</h4>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {activeComponent.sourceFiles.map((f) => (
                    <code
                      key={f}
                      className="rounded border border-[#1e2d4a] bg-[#060b16] px-2 py-0.5 text-[11px] text-violet-300"
                    >
                      {f}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trace One Message + SQLite/MySQL Behavior */}
      <section className="mt-12 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6">
          <h2 className="font-display text-xl font-bold text-white">Trace One Message Across Components</h2>
          <ol className="mt-5 space-y-4 text-sm text-slate-300">
            {[
              {
                title: '1. Authentication & Credential Storage',
                body: 'Alice authenticates via mutual X.509 handshake (_do_handshake), negotiates temporary DH key K_temp, and sends AES-encrypted login JSON. Server decrypts in _do_auth(), verifies CN == username, and checks DatabaseManager (MySQL primary → SQLite securechat.db fallback) via 16-byte salt + SHA-256 + hmac.compare_digest.',
              },
              {
                title: '2. Outbound Processing on Alice’s Client',
                body: 'After Step 4–5 RSA-PSS signed session DH derives K_session_alice, Alice’s SecureChatSession.create_message() encrypts the UTF-8 text with AES-128-CBC (random IV + PKCS#7) and signs SHA-256(seqno || ts || ct_b64) with Alice’s RSA key.',
              },
              {
                title: '3. Server Validation, Evidence Write & Relay',
                body: 'On port 8443, Alice’s ClientHandler validates REPLAY → STALE → SIG_FAIL → DECRYPT_FAIL, appends the ciphertext + signature line to transcripts/<sid>_server.log, and passes the recovered plaintext to server.broadcast().',
              },
              {
                title: '4. Re-Encryption & Delivery to Bob',
                body: 'Bob’s ClientHandler calls send_chat_message("alice", text) using K_session_bob and the server’s RSA key. Bob’s client runs the same 4-stage check, logs to Bob’s client transcript, and displays the message.',
              },
            ].map((item, idx) => (
              <li key={item.title} className="rounded-xl border border-[#1e2d4a] bg-[#070d19] p-4">
                <p className="font-display font-semibold text-cyan-200">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.body}</p>
                {idx < 3 && <ArrowDown className="mt-2 h-3.5 w-3.5 text-slate-600" />}
              </li>
            ))}
          </ol>
        </div>

        {/* Trust Boundary & Database Fallback */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6">
            <div className="flex items-center gap-2 text-amber-300">
              <ShieldAlert className="h-5 w-5" />
              <h2 className="font-display text-lg font-bold text-white">Trust Boundary &amp; Plaintext Access</h2>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Careful inspection of <code className="text-amber-200">app/server.py</code> shows that SecureChat operates
              authenticated <strong className="text-white">client ↔ server encrypted hops</strong> rather than
              server-blind client-to-client E2EE:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              <li className="rounded-lg border border-amber-400/20 bg-[#0b1324] p-2.5">
                <strong className="text-amber-200">Can access plaintext:</strong> Alice client, Bob client, local Flask
                <code className="text-cyan-300"> web_ui.py</code> process, and the{' '}
                <code className="text-cyan-300">SecureChatServer</code> during <code className="text-cyan-300">_chat_loop()</code>{' '}
                and <code className="text-cyan-300">broadcast()</code>.
              </li>
              <li className="rounded-lg border border-emerald-400/20 bg-[#0b1324] p-2.5">
                <strong className="text-emerald-200">Never sees plaintext:</strong> TCP network wire (port 8443), MySQL /
                SQLite database (salted hashes only), and <code className="text-amber-200">transcripts/*.log</code>{' '}
                (stores Base64 ciphertext + signatures only).
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6">
            <h2 className="font-display text-lg font-bold text-white">SQLite &amp; MySQL Storage Behavior</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              <code className="text-cyan-300">DatabaseManager._init_storage()</code> in{' '}
              <code className="text-cyan-300">app/storage/db.py</code> attempts to connect to MySQL (
              <code className="text-slate-200">DB_HOST:3306</code>) using <code className="text-slate-200">pymysql</code>{' '}
              and creates the <code className="text-slate-200">users</code> table (<code className="text-slate-200">VARBINARY(16)</code>{' '}
              salt, <code className="text-slate-200">CHAR(64)</code> hash). If MySQL is unavailable, it catches the
              connection error, logs a warning, switches <code className="text-cyan-300">self.db_type = "sqlite"</code>,
              and initializes <code className="text-emerald-300">securechat.db</code> automatically.
            </p>
          </div>
        </div>
      </section>

      <PagePager currentPath="/architecture" />
    </div>
  );
};
