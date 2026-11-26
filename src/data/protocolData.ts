export interface ProtocolStep {
  step: number;
  title: string;
  phase: 'Control Plane' | 'Key Agreement' | 'Data Plane' | 'Evidence Plane';
  accent: 'cyan' | 'violet' | 'mint' | 'amber';
  keyBadge: string;
  actor: string;
  whatChanges: string;
  securityObjective: string;
  wireFormat: string;
  sourceRef: string;
  details: string[];
}

export const protocolSteps: ProtocolStep[] = [
  {
    step: 1,
    title: 'Open a TCP connection',
    phase: 'Control Plane',
    accent: 'cyan',
    keyBadge: 'Plain TCP + 4-byte framing',
    actor: 'Client (Alice / Bob) → SecureChat Server (127.0.0.1:8443)',
    whatChanges:
      'Client opens a TCP socket to port 8443; SecureChatServer spawns a dedicated daemon ClientHandler thread with an 8-char session_id.',
    securityObjective: 'Session isolation & DoS memory protection (64 KB MAX_FRAME_SIZE)',
    wireFormat: '[4-byte big-endian !I length] + UTF-8 JSON (max 65,536 bytes)',
    sourceRef: 'app/common/protocol.py, app/server.py (SecureChatServer.start)',
    details: [
      'No plaintext application credentials or chat payloads are sent at this stage.',
      'recv_frame() enforces MAX_FRAME_SIZE = 65536 and raises FrameTooLargeError before allocating oversized buffers.',
      'Each client socket receives an independent ClientHandler thread and isolated state.',
    ],
  },
  {
    step: 2,
    title: 'Exchange and validate X.509 certificates',
    phase: 'Control Plane',
    accent: 'cyan',
    keyBadge: 'Mutual X.509 PKI (Root CA)',
    actor: 'Client ↔ Server (mutual handshake)',
    whatChanges:
      'Client sends its PEM certificate; server validates it against ca.crt, then replies with server.crt; client validates server.crt with expected_cn="server".',
    securityObjective: 'Mutual authentication & impersonation prevention',
    wireFormat: '{"type": "handshake", "cert": "<PEM X.509 certificate>"}',
    sourceRef: 'app/crypto/pki.py (validate_certificate), _do_handshake()',
    details: [
      'Checks issuer matches Root CA subject and blocks unauthorized self-signed certificates (UNTRUSTED_ISSUER).',
      'Verifies RSA PKCS#1 v1.5 signature over tbs_certificate_bytes using ca.crt public key (BAD_CERT_SIGNATURE).',
      'Verifies current UTC time falls within [not_valid_before, not_valid_after] (CERT_EXPIRED).',
      'Client checks expected_cn="server" (CERT_CN_MISMATCH); server later binds cert CN to login/register username.',
    ],
  },
  {
    step: 3,
    title: 'Ephemeral Diffie–Hellman for registration or login',
    phase: 'Key Agreement',
    accent: 'violet',
    keyBadge: 'K_temp (Credential Key)',
    actor: 'Client ↔ Server + DatabaseManager',
    whatChanges:
      'Both parties exchange 2048-bit MODP Group 14 DH public keys (dh_init) and derive K_temp = Trunc16(SHA-256(s)) solely to AES-128-CBC encrypt auth_req and auth_resp.',
    securityObjective: 'Credential confidentiality on wire + constant-time salted hash check',
    wireFormat: '{"type": "dh_init", "dh_pub": <int>} → {"type": "auth_req", "ct": "<base64 IV+CT>"}',
    sourceRef: 'app/server.py (_do_auth), app/storage/db.py',
    details: [
      'Both validate 1 < dh_pub < p - 1 via DiffieHellman.validate_peer_public().',
      'K_temp is an ephemeral credential-protection key used ONLY for register/login JSON envelopes—never for chat.',
      'Server verifies cert_cn.lower() == username.lower() before calling db.register_user() or db.verify_user().',
      'Database stores 16-byte random salt + SHA-256(salt || password) and compares via hmac.compare_digest.',
    ],
  },
  {
    step: 4,
    title: 'Exchange authenticated session Diffie–Hellman values',
    phase: 'Key Agreement',
    accent: 'violet',
    keyBadge: 'Signed Session DH (RSA-PSS)',
    actor: 'Server → Client, then Client → Server',
    whatChanges:
      'Each party generates a brand-new DiffieHellman() keypair and a 16-byte random nonce, signing (big_endian(dh_pub) || nonce) with its RSA private key.',
    securityObjective: 'MITM resistance on key agreement & per-session key freshness',
    wireFormat: '{"type": "session_dh", "dh_pub": <int>, "nonce": "<b64>", "sig": "<b64 RSA-PSS>"}',
    sourceRef: 'app/crypto/dh.py (sign_dh_exchange, verify_dh_exchange)',
    details: [
      'Uses RSA-PSS (MGF1-SHA256, MAX_LENGTH salt) over 256-byte big-endian dh_pub concatenated with 16-byte nonce.',
      'Client verifies server signature against server.crt public key; server verifies client signature against client cert.',
      'If verification fails, the server emits DH_AUTH_FAIL and terminates the session.',
    ],
  },
  {
    step: 5,
    title: 'Derive a fresh session key',
    phase: 'Key Agreement',
    accent: 'cyan',
    keyBadge: 'K_session (Chat Session Key)',
    actor: 'Client & Server independently',
    whatChanges:
      'Both compute shared_secret = peer_pub^priv mod p, derive K_session = Trunc16(SHA-256(big_endian(shared_secret))), instantiate SecureChatSession, and server sends session_ready.',
    securityObjective: 'Forward secrecy via separation of K_session from K_temp and RSA keys',
    wireFormat: '{"type": "session_ready", "status": "OK"}',
    sourceRef: 'app/crypto/dh.py (derive_key), app/crypto/session.py',
    details: [
      'K_session is completely independent from K_temp used in Step 3.',
      'Even if long-term RSA identity keys are later exposed, past ephemeral DH session secrets cannot be recomputed from traffic alone.',
      'Note: Diagram labels this engine "HKDF"; actual code implements Trunc16(SHA-256(big_endian(shared_secret))).',
    ],
  },
  {
    step: 6,
    title: 'Encrypt and sign the chat message',
    phase: 'Data Plane',
    accent: 'mint',
    keyBadge: 'K_session + RSA PKCS#1 v1.5',
    actor: 'Sender (Alice / Bob client or Server relay)',
    whatChanges:
      'Sender increments my_seqno, records ts = now_ms(), encrypts UTF-8 plaintext with AES-128-CBC (fresh 16-byte IV + PKCS#7), hashes (seqno || ts || ct), and signs the digest.',
    securityObjective: 'Confidentiality, message integrity, and sender origin authentication',
    wireFormat: '{"type": "msg", "seqno": 1, "ts": 1795588633911, "ct": "<b64>", "sig": "<b64>"}',
    sourceRef: 'app/crypto/session.py (create_message), aes.py, sign.py',
    details: [
      'Encrypt-then-Sign: h = SHA-256(f"{seqno}{ts}{ct_b64}".encode("utf-8")).',
      'RSA PKCS#1 v1.5 signs the prehashed 32-byte SHA-256 digest.',
      'Each message uses a fresh os.urandom(16) IV prepended to the ciphertext before Base64 encoding.',
    ],
  },
  {
    step: 7,
    title: 'Validate the received packet (4-stage ordered gate)',
    phase: 'Data Plane',
    accent: 'mint',
    keyBadge: '4-Stage Receiver Engine',
    actor: 'Receiver (Server on ingress, Peer Client on delivery)',
    whatChanges:
      'Receiver runs 4 strict sequential checks. Accepted messages advance last_seqno, append to the transcript log, and relay; failed checks abort early with REPLAY, STALE, SIG_FAIL, or DECRYPT_FAIL.',
    securityObjective: 'Replay defense, freshness enforcement, tamper rejection, and safe decryption',
    wireFormat: 'Accept: (True, "OK", plaintext) | Reject: {"type": "error", "code": "REPLAY|STALE|SIG_FAIL|DECRYPT_FAIL"}',
    sourceRef: 'app/crypto/session.py (process_incoming_message)',
    details: [
      'Stage 1: seqno > last_seqno — fails with REPLAY.',
      'Stage 2: |now_ms() - ts| <= 60,000 ms — fails with STALE.',
      'Stage 3: RSA PKCS#1 v1.5 verify over SHA-256(seqno || ts || ct) — fails with SIG_FAIL BEFORE decrypting.',
      'Stage 4: AES-128-CBC decrypt & PKCS#7 unpad — fails with DECRYPT_FAIL.',
    ],
  },
  {
    step: 8,
    title: 'Finalize transcript and exchange signed SessionReceipt',
    phase: 'Evidence Plane',
    accent: 'amber',
    keyBadge: 'SHA-256 + RSA SessionReceipt',
    actor: 'Client ↔ Server (/quit flow)',
    whatChanges:
      'On /quit, both sides compute SHA-256 over their append-only transcript logs, exchange receipt_exchange and receipt_ack packets, and persist RSA-signed *_receipt.json files.',
    securityObjective: 'Session-level non-repudiation and offline third-party auditability',
    wireFormat: '{"receipt": {"peer", "first_seq", "last_seq", "transcript_sha256", "ts"}, "sig": "<b64>"}',
    sourceRef: 'app/storage/transcript.py, tools/verify_transcript.py',
    details: [
      'Transcript lines follow: seqno | ts | ct_b64 | sig_b64 | peer_cert_fingerprint_sha256.',
      'Receipt payload is canonicalized via json.dumps(receipt_data, sort_keys=True) and signed with RSA PKCS#1 v1.5.',
      'tools/verify_transcript.py audits transcript hash, receipt signature, and every individual message signature offline.',
    ],
  },
];
