import React from 'react';
import { AlertTriangle, CheckCircle2, Globe2, Shield, Target } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { PagePager } from '../components/PagePager';

const securityMapping = [
  {
    objective: 'Confidentiality',
    threat: 'Eavesdropping / packet sniffing on TCP port 8443',
    mechanism: 'AES-128-CBC encryption with fresh 16-byte random IV per message & PKCS#7 padding',
    source: 'app/crypto/aes.py',
  },
  {
    objective: 'Credential Protection',
    threat: 'Plaintext password sniffing & rainbow-table DB cracking',
    mechanism: 'Ephemeral DH key K_temp encrypts auth JSON on wire; DB stores 16-byte random salt + SHA-256(salt || pwd) with hmac.compare_digest',
    source: 'app/server.py (_do_auth), app/storage/db.py',
  },
  {
    objective: 'Mutual Authentication',
    threat: 'Client or server impersonation / rogue endpoints',
    mechanism: 'Mutual X.509 certificate validation against Root CA (issuer, RSA signature, UTC dates, CN) + CN-to-username binding',
    source: 'app/crypto/pki.py, scripts/gen_cert.py',
  },
  {
    objective: 'Integrity & Origin',
    threat: 'In-transit bit-flipping of ciphertext, seqno, or timestamp',
    mechanism: 'h = SHA-256(seqno || ts || ct_b64) signed with sender RSA-2048 private key (PKCS#1 v1.5) and verified prior to decryption',
    source: 'app/crypto/sign.py, app/crypto/session.py',
  },
  {
    objective: 'Forward Secrecy',
    threat: 'Retroactive decryption if long-term RSA identity keys leak',
    mechanism: 'Fresh ephemeral RFC 3526 2048-bit MODP Group 14 DH keypair per chat session signed with RSA-PSS',
    source: 'app/crypto/dh.py',
  },
  {
    objective: 'Replay Protection',
    threat: 'Resending previously captured valid encrypted frames',
    mechanism: 'Strictly monotonically increasing per-session sequence number (seqno > last_seqno → else REPLAY)',
    source: 'app/crypto/session.py',
  },
  {
    objective: 'Message Freshness',
    threat: 'Delayed packet injection outside active conversation window',
    mechanism: 'Millisecond Unix timestamp validated within ±60,000 ms (60s) of receiver clock (else STALE)',
    source: 'app/crypto/session.py',
  },
  {
    objective: 'Non-Repudiation',
    threat: 'Participant later denying sent messages or session participation',
    mechanism: 'Append-only transcript log + whole-file SHA-256 + mutually exchanged RSA-signed SessionReceipts verified offline',
    source: 'app/storage/transcript.py, tools/verify_transcript.py',
  },
];

export const OverviewPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-300">01 // Project Overview</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-white sm:text-4xl">
          Why ordinary chat fails on an untrusted network
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          SecureChat is an educational Cryptography and Network Security proof of concept demonstrating how independent
          cryptographic primitives compose into a defense-in-depth multi-client chat system.
        </p>
      </header>

      {/* Alice & Bob Scenario */}
      <section className="mt-10 rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6 sm:p-8">
        <div className="flex items-center gap-2.5 text-cyan-300">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="font-display text-xl font-bold text-white">Concrete Threat Scenario: Alice &amp; Bob</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
          Suppose <strong className="text-white">Alice</strong> and <strong className="text-white">Bob</strong> need to
          register, authenticate, and exchange sensitive messages through a central server over an untrusted network
          where an active adversary can sniff packets, impersonate endpoints, flip ciphertext bytes, replay captured
          frames, or inject delayed messages—and where either party might later deny having sent a message.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Credential Exposure', 'Sending passwords in plaintext lets passive sniffers capture accounts immediately.'],
            ['Identity Spoofing', 'Without CA-signed certificates, an attacker can pose as Bob or the SecureChat server.'],
            ['Silent Tampering', 'Unauthenticated encryption allows attackers to alter sequence numbers or ciphertext blocks.'],
            ['Replay & Stale Injection', 'Copying a valid frame allows re-execution of past commands unless sequence and time are checked.'],
            ['Long-Term Key Compromise', 'Static keys expose all recorded sessions if stolen unless fresh ephemeral DH keys are negotiated.'],
            ['Repudiation', 'Without signed session summaries and message signatures, senders can deny authorship later.'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-xl border border-[#1e2d4a] bg-[#070d19] p-4">
              <h3 className="font-display text-sm font-semibold text-rose-300">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Motivation & Objectives */}
      <section className="mt-12 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2 text-violet-300">
            <Target className="h-5 w-5" />
            <h2 className="font-display text-xl font-bold text-white">Motivation &amp; Problem Statement</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Production protocols such as TLS 1.3 and Signal combine key agreement, AEAD ciphers, and PKI behind high-level
            APIs. SecureChat unpacks those concepts into explicit, inspectable Python modules so students and faculty
            reviewers can observe every handshake frame, cipher envelope, rejection status, and audit artifact.
          </p>
          <blockquote className="mt-5 rounded-xl border-l-2 border-cyan-400 bg-[#0b1324] p-4 text-sm italic text-slate-200">
            “Design and implement a multiclient chat system that provides confidentiality, integrity, mutual
            authentication, forward secrecy, replay protection, and non-repudiation using a hybrid combination of
            symmetric, asymmetric, certificate, and audit primitives.”
          </blockquote>
        </div>

        <div className="lg:col-span-7">
          <h2 className="font-display text-xl font-bold text-white">Core Project Objectives</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              'Encrypt credentials and chat payloads with AES-128-CBC.',
              'Mutually authenticate server and clients via private Root CA X.509 certs.',
              'Detect any modification to seqno, timestamp, or ciphertext via RSA-SHA256.',
              'Derive fresh ephemeral DH session keys independent of login keys.',
              'Reject duplicate or out-of-order packets with strict seqno checks.',
              'Reject delayed packets outside a ±60-second clock window.',
              'Record append-only transcripts and exchange RSA-signed SessionReceipts.',
              'Provide both CLI clients and a Flask dashboard with attack simulation & offline verification.',
            ].map((obj, i) => (
              <div key={obj} className="flex items-start gap-2.5 rounded-xl border border-[#1e2d4a] bg-[#0b1324] p-3.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <p className="text-xs leading-relaxed text-slate-300">
                  <span className="font-mono text-cyan-300 mr-1">0{i + 1}.</span>
                  {obj}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Objective -> Mechanism Table */}
      <section className="mt-12">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-cyan-300" />
          <h2 className="font-display text-xl font-bold text-white">
            Security Objective to Mechanism Mapping
          </h2>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#1e2d4a] bg-[#0b1324]">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#1e2d4a] bg-[#0e182e] text-xs uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 font-mono">Security Objective</th>
                <th className="px-4 py-3 font-mono">Addressed Threat</th>
                <th className="px-4 py-3 font-mono">Implemented Mechanism</th>
                <th className="px-4 py-3 font-mono">Source File(s)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2d4a]/70 text-xs sm:text-sm">
              {securityMapping.map((row) => (
                <tr key={row.objective} className="hover:bg-[#111c33]/60">
                  <td className="px-4 py-3 font-semibold text-cyan-200">{row.objective}</td>
                  <td className="px-4 py-3 text-slate-300">{row.threat}</td>
                  <td className="px-4 py-3 text-slate-200">{row.mechanism}</td>
                  <td className="px-4 py-3 font-mono text-xs text-violet-300">{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Functional / Non-functional Requirements + Scope & Constraints */}
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6">
          <h2 className="font-display text-lg font-bold text-white">Functional Requirements</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>• Root CA generation and role-scoped server/client X.509 certificate issuance.</li>
            <li>• Encrypted user registration &amp; login bound to certificate Common Name (CN).</li>
            <li>• Multi-client TCP chat relay supporting simultaneous Alice, Bob, Charlie, Dana sessions.</li>
            <li>• Live packet inspection and simulated Tamper / Replay / Stale probes in the Flask UI.</li>
            <li>• Graceful <code className="text-amber-300">/quit</code> receipt exchange and standalone offline CLI verification.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] p-6">
          <h2 className="font-display text-lg font-bold text-white">Non-Functional Requirements, Scope &amp; Constraints</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>• <strong className="text-white">Framing Safety:</strong> 64 KB (<code className="text-cyan-300">65536</code> B) frame cap prevents memory DoS.</li>
            <li>• <strong className="text-white">Zero Setup Barrier:</strong> Automatic SQLite fallback (<code className="text-cyan-300">securechat.db</code>) when MySQL is offline.</li>
            <li>• <strong className="text-white">Concurrency:</strong> Thread-per-client server model with mutex-protected active session map.</li>
            <li>• <strong className="text-white">Educational Scope:</strong> Designed for local coursework/viva demonstration—not a replacement for audited TLS 1.3 or Signal.</li>
          </ul>
        </div>
      </section>

      {/* Optional Course Report SDG Section */}
      {siteConfig.project.showSdgSection && (
        <section className="mt-12 rounded-2xl border border-amber-400/25 bg-amber-400/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-amber-300" />
              <h2 className="font-display text-lg font-bold text-white">
                Course Report Context: UN Sustainable Development Goals (SDG) Alignment
              </h2>
            </div>
            <span className="font-mono rounded border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-200">
              Course Report Section
            </span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm text-slate-300">
            <div className="rounded-xl border border-[#1e2d4a] bg-[#0b1324] p-4">
              <h3 className="font-display font-semibold text-cyan-200">
                SDG 9 — Industry, Innovation, and Infrastructure
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                Demonstrates resilient, standards-aligned cryptographic communication infrastructure (RFC 3526, X.509,
                NIST AES/SHA-256) with bounded frame parsing and verifiable audit trails.
              </p>
            </div>
            <div className="rounded-xl border border-[#1e2d4a] bg-[#0b1324] p-4">
              <h3 className="font-display font-semibold text-amber-200">
                SDG 16 — Peace, Justice, and Strong Institutions
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                Supports accountable digital communication through privacy-preserving encryption paired with tamper-evident
                transcripts and offline cryptographic non-repudiation verification.
              </p>
            </div>
          </div>
        </section>
      )}

      <PagePager currentPath="/overview" />
    </div>
  );
};
