export interface ArchitectureComponent {
  id: 'dashboard' | 'server' | 'database' | 'crypto' | 'evidence';
  name: string;
  subtitle: string;
  accent: 'cyan' | 'violet' | 'mint' | 'amber';
  endpointOrPath: string;
  plaintextAccess: 'Yes (Endpoint)' | 'Yes (Relay)' | 'No (Salted Hashes Only)' | 'In-Process Primitives' | 'No (Ciphertext + Signatures Only)';
  responsibilities: string[];
  inputs: string[];
  outputs: string[];
  sourceFiles: string[];
}

export const architectureComponents: ArchitectureComponent[] = [
  {
    id: 'dashboard',
    name: 'Flask Web Dashboard',
    subtitle: 'Browser Command Center & Local Client Proxy',
    accent: 'cyan',
    endpointOrPath: 'http://127.0.0.1:5000',
    plaintextAccess: 'Yes (Endpoint)',
    responsibilities: [
      'Lists local client identities with matching .crt and .key files in certs/ (/api/identities).',
      'Instantiates per-user SecureChatClient instances stored in web_sessions protected by sessions_lock.',
      'Provides interactive chat UI, live JSON wire packet inspector, X.509 hub, DB stats, and attack simulation triggers (/api/simulate_attack).',
      'Starts background_listener threads per user to poll incoming TCP frames and run process_incoming_message().',
    ],
    inputs: ['User password & messages via browser HTTP JSON', 'Incoming encrypted frames from TCP server'],
    outputs: ['TCP frames via SecureChatClient', 'Rendered plaintext & rejection codes to local browser'],
    sourceFiles: ['app/web_ui.py', 'app/templates/index.html', 'app/client.py'],
  },
  {
    id: 'server',
    name: 'Multithreaded Python TCP Server',
    subtitle: 'Central Relay, Auth Gate & Session Coordinator',
    accent: 'cyan',
    endpointOrPath: '127.0.0.1:8443 (TCP)',
    plaintextAccess: 'Yes (Relay)',
    responsibilities: [
      'Accepts concurrent TCP sockets and spawns a dedicated ClientHandler thread per client.',
      'Runs mutual X.509 certificate validation (_do_handshake) and ephemeral DH credential decryption (_do_auth).',
      'Enforces cert_cn.lower() == username.lower() binding during both register and login.',
      'Runs authenticated session DH (_do_session_key_agreement) and 4-stage verification (_chat_loop).',
      'Decrypts valid incoming messages into plaintext and re-encrypts per recipient in broadcast().',
    ],
    inputs: ['4-byte !I length-prefixed JSON frames (max 64 KB)', 'Server RSA key & ca.crt'],
    outputs: ['Per-client encrypted relay frames', 'Rejection error frames (REPLAY, STALE, SIG_FAIL, DECRYPT_FAIL)', 'Server transcripts & receipts'],
    sourceFiles: ['app/server.py', 'app/common/protocol.py', 'app/common/utils.py'],
  },
  {
    id: 'database',
    name: 'Credential Database (MySQL / SQLite)',
    subtitle: 'Parameterized User & Salted Hash Store',
    accent: 'mint',
    endpointOrPath: 'MySQL 127.0.0.1:3306 → fallback securechat.db',
    plaintextAccess: 'No (Salted Hashes Only)',
    responsibilities: [
      'Connects to MySQL via pymysql on startup and ensures the securechat database and users table exist.',
      'Automatically falls back to local SQLite (securechat.db) if MySQL is unreachable—removing local demo setup friction.',
      'Generates 16-byte random salt (os.urandom(16)) and stores SHA-256(salt || password) hex digest.',
      'Verifies logins using parameterized SQL queries and constant-time hmac.compare_digest comparison.',
    ],
    inputs: ['email, username, password (already decrypted inside _do_auth)'],
    outputs: ['OK, DUPLICATE_USER, BAD_CREDENTIALS, EMPTY_FIELDS, or DB_ERROR'],
    sourceFiles: ['app/storage/db.py', 'scripts/init_db.py'],
  },
  {
    id: 'crypto',
    name: 'Cryptography Modules',
    subtitle: 'PKI, DH Key Agreement, AES-CBC, RSA & Session Engine',
    accent: 'violet',
    endpointOrPath: 'app/crypto/*',
    plaintextAccess: 'In-Process Primitives',
    responsibilities: [
      'pki.py: Validates issuer, RSA PKCS#1 v1.5 CA signature, UTC validity window, and Common Name.',
      'dh.py: RFC 3526 2048-bit MODP Group 14 DH, range check 1 < y < p-1, Trunc16(SHA-256) key derivation, and RSA-PSS DH signing.',
      'aes.py: AES-128-CBC with fresh 16-byte random IV prepended and PKCS#7 padding.',
      'sign.py: SHA-256(seqno || ts || ct_b64) digest and RSA PKCS#1 v1.5 sign/verify.',
      'session.py: Stateful SecureChatSession enforcing strict 4-step verification before plaintext release.',
    ],
    inputs: ['Certificates, RSA keys, DH public ints, message JSON dicts'],
    outputs: ['16-byte AES keys, encrypted payloads, signatures, (ok, code, result) tuples'],
    sourceFiles: [
      'app/crypto/pki.py',
      'app/crypto/dh.py',
      'app/crypto/aes.py',
      'app/crypto/sign.py',
      'app/crypto/session.py',
    ],
  },
  {
    id: 'evidence',
    name: 'Evidence Store & Offline Verifier',
    subtitle: 'Append-Only Transcripts & RSA-Signed SessionReceipts',
    accent: 'amber',
    endpointOrPath: 'transcripts/<session_id>_<role>.log & *_receipt.json',
    plaintextAccess: 'No (Ciphertext + Signatures Only)',
    responsibilities: [
      'Appends one pipe-delimited line per accepted message: seqno | ts | ct_b64 | sig_b64 | peer_fingerprint.',
      'Computes whole-file SHA-256 digest over the transcript log on /quit.',
      'Signs canonical JSON SessionReceipt (sort_keys=True) with RSA PKCS#1 v1.5 and exchanges peer receipts.',
      'Provides standalone CLI verify_transcript.py to verify hash, receipt signature, and every message signature offline.',
    ],
    inputs: ['Accepted frame metadata (seqno, ts, ct_b64, sig_b64) & peer cert fingerprint'],
    outputs: ['.log transcript files, *_receipt.json, *_peer_receipt.json, PASS/FAIL audit report'],
    sourceFiles: ['app/storage/transcript.py', 'tools/verify_transcript.py'],
  },
];

export interface SourceModuleItem {
  path: string;
  role: string;
  keySymbols: string[];
  details: string;
}

export const sourceMapItems: SourceModuleItem[] = [
  {
    path: 'app/server.py',
    role: 'Multithreaded TCP Server & Relay',
    keySymbols: ['SecureChatServer', 'ClientHandler', '_do_handshake', '_do_auth', '_do_session_key_agreement', '_chat_loop', '_handle_quit'],
    details:
      'Listens on 127.0.0.1:8443, enforces mutual certificate checks, runs temporary DH credential encryption and authenticated session DH, validates incoming frames, logs transcripts, and relays plaintext across active client sessions.',
  },
  {
    path: 'app/client.py',
    role: 'Interactive CLI Client',
    keySymbols: ['SecureChatClient', 'connect', 'register', 'login', 'establish_session_key', '_receive_loop', 'run_chat_ui'],
    details:
      'Loads local Root CA, client cert, and private key from certs/; runs the 8-step protocol from the terminal with concurrent send/receive threads and /quit receipt exchange.',
  },
  {
    path: 'app/web_ui.py',
    role: 'Flask Command Center Backend',
    keySymbols: ['api_identities', 'api_connect', 'api_auth', 'api_send', 'api_messages', 'api_simulate_attack', 'api_run_audit', 'api_quit'],
    details:
      'Serves app/templates/index.html on 127.0.0.1:5000 and exposes REST endpoints managing SecureChatClient sessions, live wire packet inspection, DB/cert inspection, and attack simulations.',
  },
  {
    path: 'app/common/protocol.py',
    role: 'TCP Length-Prefixed JSON Framing',
    keySymbols: ['MAX_FRAME_SIZE (65536)', 'send_frame', 'recv_frame', 'send_message', 'recv_message', 'FrameTooLargeError'],
    details:
      'Wraps every JSON payload in a 4-byte big-endian unsigned integer (!I) length header and enforces a 64 KB cap to guard against memory exhaustion.',
  },
  {
    path: 'app/crypto/pki.py',
    role: 'X.509 Certificate Validation',
    keySymbols: ['validate_certificate', 'UNTRUSTED_ISSUER', 'BAD_CERT_SIGNATURE', 'CERT_EXPIRED', 'CERT_CN_MISMATCH'],
    details:
      'Validates issuer vs Root CA subject, blocks unauthorized self-signed certs, verifies RSA PKCS#1 v1.5 CA signatures, enforces UTC validity dates, and checks expected CN.',
  },
  {
    path: 'app/crypto/dh.py',
    role: 'RFC 3526 DH & Authenticated Key Agreement',
    keySymbols: ['DiffieHellman', 'DH_P (Group 14)', 'validate_peer_public', 'derive_key', 'sign_dh_exchange', 'verify_dh_exchange'],
    details:
      'Generates 2048-bit MODP Group 14 ephemeral secrets, checks 1 < y < p-1, derives 16-byte AES keys via Trunc16(SHA-256(big_endian(s))), and signs/verifies (dh_pub || nonce) with RSA-PSS.',
  },
  {
    path: 'app/crypto/aes.py',
    role: 'AES-128-CBC + PKCS#7 Cipher',
    keySymbols: ['encrypt_aes_cbc', 'decrypt_aes_cbc', 'AESDecryptionError'],
    details:
      'Pads plaintext with PKCS#7 (128-bit blocks), generates a fresh 16-byte random IV per encryption via os.urandom(16), and returns iv || ciphertext.',
  },
  {
    path: 'app/crypto/sign.py',
    role: 'SHA-256 Hashing & RSA PKCS#1 v1.5 Signatures',
    keySymbols: ['compute_message_hash', 'sign_hash', 'verify_hash', 'sign_data', 'verify_data', 'SignatureVerificationError'],
    details:
      'Hashes f"{seqno}{ts}{ct_b64}" with SHA-256 and signs/verifies 32-byte digests with RSA PKCS#1 v1.5.',
  },
  {
    path: 'app/crypto/session.py',
    role: 'Stateful 4-Step Receiver Verification Engine',
    keySymbols: ['SecureChatSession', 'create_message', 'process_incoming_message'],
    details:
      'Tracks my_seqno and last_seqno; creates encrypted+signed packets and enforces REPLAY -> STALE -> SIG_FAIL -> DECRYPT_FAIL before appending to TranscriptLogger.',
  },
  {
    path: 'app/storage/db.py',
    role: 'MySQL + SQLite Credential Store',
    keySymbols: ['DatabaseManager', 'register_user', 'verify_user'],
    details:
      'Parameterized SQL queries for MySQL with automatic SQLite fallback (securechat.db), 16-byte random salt, SHA-256(salt || password), and hmac.compare_digest.',
  },
  {
    path: 'app/storage/transcript.py',
    role: 'Append-Only Transcript & Receipt Engine',
    keySymbols: ['TranscriptLogger', 'log_message', 'compute_transcript_hash', 'generate_receipt', 'verify_session_receipt'],
    details:
      'Records ciphertext+signature lines to transcripts/<session_id>_<role>.log, hashes the file with SHA-256, and signs canonical JSON receipts.',
  },
  {
    path: 'tools/verify_transcript.py',
    role: 'Standalone Offline Audit CLI',
    keySymbols: ['verify_offline_transcript', 'main'],
    details:
      'Independently checks transcript SHA-256 match, SessionReceipt RSA signature, peer certificate fingerprint on every line, and every individual message RSA signature.',
  },
];

export interface TestMatrixRow {
  id: string;
  area: string;
  scenario: string;
  expectedBehavior: string;
  observedStatus: 'Source-Verified Test' | 'Source-Reported Result' | 'Expected Behavior';
  evidenceDetail: string;
  sourceRef: string;
}

export const testMatrixRows: TestMatrixRow[] = [
  {
    id: 'pki-valid',
    area: 'PKI / X.509',
    scenario: 'Valid Root CA-signed certificate with matching CN',
    expectedBehavior: 'validate_certificate() returns True when issuer, CA signature, UTC validity, and CN match.',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: 'Implemented in tests/test_pki.py::test_valid_cert_validation; covered in README/PPT 18-test report.',
    sourceRef: 'tests/test_pki.py',
  },
  {
    id: 'pki-cn',
    area: 'PKI / X.509',
    scenario: 'Certificate Common Name mismatch',
    expectedBehavior: 'Raises CERT_CN_MISMATCH when expected_cn="bob" is checked against CN="alice".',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: 'Implemented in tests/test_pki.py::test_cert_cn_mismatch & scripts/demo_attacks.py (Scenario 3).',
    sourceRef: 'tests/test_pki.py, scripts/demo_attacks.py',
  },
  {
    id: 'pki-expired',
    area: 'PKI / X.509',
    scenario: 'Expired X.509 certificate',
    expectedBehavior: 'Raises CERT_EXPIRED when current UTC time is past not_valid_after.',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: 'Implemented in tests/test_pki.py::test_cert_expired & scripts/demo_attacks.py (Scenario 2).',
    sourceRef: 'tests/test_pki.py, scripts/demo_attacks.py',
  },
  {
    id: 'pki-untrusted',
    area: 'PKI / X.509',
    scenario: 'Self-signed or untrusted issuer certificate',
    expectedBehavior: 'Raises UNTRUSTED_ISSUER when issuer differs from Root CA or is unauthorized self-signed.',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: 'Implemented in tests/test_pki.py::test_untrusted_issuer_self_signed & scripts/demo_attacks.py (Scenario 1).',
    sourceRef: 'tests/test_pki.py, scripts/demo_attacks.py',
  },
  {
    id: 'pki-badsig',
    area: 'PKI / X.509',
    scenario: 'Certificate claiming CA issuer signed by rogue key',
    expectedBehavior: 'Raises BAD_CERT_SIGNATURE when Root CA public key fails RSA PKCS#1 v1.5 verification.',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: 'Implemented in tests/test_pki.py::test_bad_cert_signature.',
    sourceRef: 'tests/test_pki.py',
  },
  {
    id: 'crypto-dh',
    area: 'Key Agreement & Primitives',
    scenario: 'DH shared key derivation, range check (1 < y < p-1), and RSA-PSS DH signing',
    expectedBehavior: 'Both parties derive identical 16-byte keys; 0, 1, p-1, p+5 raise DHValidationError; tampered nonce raises DHAuthError.',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: '3 unit tests in tests/test_crypto.py (test_dh_shared_key_derivation, test_dh_public_validation, test_authenticated_dh_signing).',
    sourceRef: 'tests/test_crypto.py',
  },
  {
    id: 'crypto-aes-rsa',
    area: 'Cipher & Signatures',
    scenario: 'AES-128-CBC PKCS#7 round-trip, corrupted padding rejection, and RSA-SHA256 verification',
    expectedBehavior: 'Round-trip recovers exact plaintext; flipped byte raises AESDecryptionError; modified seqno raises SignatureVerificationError.',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: '3 unit tests in tests/test_crypto.py (test_aes_cbc_encrypt_decrypt_roundtrip, test_aes_cbc_bad_padding_or_tampering, test_rsa_message_hashing_and_signing).',
    sourceRef: 'tests/test_crypto.py',
  },
  {
    id: 'dp-valid',
    area: 'Data Plane',
    scenario: 'Valid encrypted and signed message delivery',
    expectedBehavior: 'process_incoming_message() returns (True, "OK", plaintext) and appends to transcript.',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: 'Implemented in tests/test_replay_tamper.py::test_valid_message_exchange.',
    sourceRef: 'tests/test_replay_tamper.py',
  },
  {
    id: 'dp-replay',
    area: 'Replay Defense',
    scenario: 'Duplicate or lower sequence number packet',
    expectedBehavior: 'Rejected at Stage 1 with code REPLAY before freshness, signature, or decryption checks.',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: 'Implemented in tests/test_replay_tamper.py::test_replay_attack_rejected & demo_attacks.py (Scenario 5).',
    sourceRef: 'tests/test_replay_tamper.py, app/crypto/session.py',
  },
  {
    id: 'dp-stale',
    area: 'Freshness Defense',
    scenario: 'Packet timestamp outside ±60,000 ms window',
    expectedBehavior: 'Rejected at Stage 2 with code STALE even if re-signed with a valid signature.',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: 'Implemented in tests/test_replay_tamper.py::test_stale_timestamp_rejected & demo_attacks.py (Scenario 6).',
    sourceRef: 'tests/test_replay_tamper.py, app/crypto/session.py',
  },
  {
    id: 'dp-tamper',
    area: 'Tamper Defense',
    scenario: 'Bit-flip in ciphertext or altered seqno in transit',
    expectedBehavior: 'Rejected at Stage 3 with code SIG_FAIL prior to AES decryption.',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: '2 unit tests in tests/test_replay_tamper.py (test_ciphertext_tampering_rejected_sig_fail, test_seqno_tampering_rejected_sig_fail).',
    sourceRef: 'tests/test_replay_tamper.py, app/crypto/session.py',
  },
  {
    id: 'evidence-audit',
    area: 'Evidence Plane',
    scenario: 'Transcript generation, SessionReceipt signing, and tampered log detection',
    expectedBehavior: 'Valid transcript returns True in verify_offline_transcript(); 6-char log tamper returns False.',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: '2 unit tests in tests/test_transcript.py + 88 recorded session artifacts in CNS_courseproject/transcripts/.',
    sourceRef: 'tests/test_transcript.py, tools/verify_transcript.py',
  },
  {
    id: 'webui-guards',
    area: 'Web Dashboard',
    scenario: 'Identity listing, initial auth view gating, and path-traversal username rejection',
    expectedBehavior: 'Lists valid cert+key pairs; renders #auth-screen first; rejects "../outside" with HTTP 400.',
    observedStatus: 'Source-Verified Test',
    evidenceDetail: '4 parametrized test cases present in tests/test_web_ui.py (added after the 18-test count in README/slides).',
    sourceRef: 'tests/test_web_ui.py, app/web_ui.py',
  },
  {
    id: 'auth-db',
    area: 'Registration & Login',
    scenario: 'Duplicate user registration and wrong password login',
    expectedBehavior: 'Returns DUPLICATE_USER on repeat username/email and BAD_CREDENTIALS on wrong password using constant-time compare.',
    observedStatus: 'Expected Behavior',
    evidenceDetail: 'Verified by inspection of app/storage/db.py and scripts/demo_attacks.py Scenario 7 (outside pytest suite).',
    sourceRef: 'app/storage/db.py, scripts/demo_attacks.py',
  },
  {
    id: 'e2e-multiclient',
    area: 'Multi-Client E2E',
    scenario: 'Alice & Bob simultaneous login, encrypted exchange, /quit receipt exchange, and offline audit',
    expectedBehavior: 'Server broadcasts decrypted+re-encrypted messages between Alice and Bob; both transcripts verify offline.',
    observedStatus: 'Source-Reported Result',
    evidenceDetail: 'README.md & SecureChat_PPT_Content.md report successful Alice/Bob runtime exchange; sample artifacts exist in transcripts/ (e.g., 15fcb2ce_server_receipt.json).',
    sourceRef: 'scripts/demo_chat_e2e.py, transcripts/',
  },
  {
    id: 'wireshark-inspect',
    area: 'Wire Confidentiality',
    scenario: 'Loopback TCP port 8443 capture during login and chat',
    expectedBehavior: 'Payloads appear only as length-prefixed JSON envelopes with Base64 ciphertext; zero plaintext passwords or messages on wire.',
    observedStatus: 'Expected Behavior',
    evidenceDetail: 'Documented verification procedure in README.md Section 8; no .pcapng capture file included in archive.',
    sourceRef: 'README.md (Section 8)',
  },
];
