export const assetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

export interface TeamMember {
  name: string;
  usn: string;
  rollNumber: string;
  image: string;
}

export interface ResourceLink {
  id: string;
  label: string;
  description: string;
  url: string | null;
  category: 'repository' | 'document' | 'standard';
  available: boolean;
}

export interface ScreenshotAsset {
  id: string;
  title: string;
  caption: string;
  src: string | null;
  recreatedModule: string;
}

export const siteConfig = {
  project: {
    title: 'SecureChat',
    fullTitle: 'SecureChat — Secure Multi-Client Chat Using Hybrid Cryptography',
    subtitle: 'Secure multi-client messaging using hybrid cryptography.',
    intro:
      'Follow a message from identity verification and key agreement to encrypted delivery and a signed session receipt.',
    course: 'Cryptography and Network Security (CNS)',
    department: '[Editable: Department of Computer Science & Engineering]',
    institution: '[Editable: Institution Name]',
    semester: 'Academic Year 2026',
    projectGuide: '[Editable: Faculty Guide Name & Designation]',
    teamRepositoryUrl: 'https://github.com/Sagarmirje/CNS_Portfolio' as string | null, // Set to your GitHub/GitLab URL when public
    reviewDeckUrl: null as string | null, // Set to your exported PDF/PPTX URL if hosted
    projectReportUrl: null as string | null, // Set to your final report PDF URL if hosted
    showSdgSection: true,
    upstreamAttribution: {
      note: 'Educational course project built on Python TCP sockets, Flask, PyMySQL/SQLite, and the Python Cryptography library; includes an editable attribution slot for any upstream CNS starter skeleton or review deck reference.',
      upstreamAuthorOrSource:
        '[Editable: Preserve upstream starter repository / reference attribution from CNS_REVIEW_1.pptx if applicable]',
    },
  },

  diagrams: {
    architectureDetailed: {
      src: assetUrl('diagrams/SecureChat_Architecture_Uploaded.jpg'),
      alt: 'Detailed SecureChat 5-tier system architecture showing Alice/Bob Web Dashboard, TCP Server, MySQL/SQLite Database, Cryptography Modules, Evidence Storage, 4-stage Receiver Validation Pipeline, and JSON packet sample.',
      caption:
        'Detailed 5-tier system architecture (Flask client tier, TCP server on port 8443, database, crypto modules, and evidence store). Note: the overview graphic labels key derivation as "HKDF" and handshake as "mTLS"; in the verified Python source code, key derivation uses Trunc16(SHA-256(shared_secret)) and mutual X.509 authentication runs at the application layer over raw TCP.',
    },
    architectureOverview: {
      src: assetUrl('diagrams/SecureChat_Architecture_Diagram.png'),
      alt: 'High-level SecureChat system architecture connecting Client (Alice/Bob), TCP Server, Database, and Evidence Plane across steps 1-3, 4-5, and 6-8.',
      caption:
        'High-level component view separating the control/auth plane (Steps 1–3), authenticated session key agreement (Steps 4–5), encrypted data plane (Steps 6–8), credential lookup, and append-only evidence plane.',
    },
    protocolFlow: {
      src: assetUrl('diagrams/SecureChat_Flow_Diagram.png'),
      alt: 'Eight-step SecureChat protocol flow diagram from TCP connection and mutual PKI authentication through ephemeral DH, authenticated session DH, encrypted and signed messaging, 4-stage receiver validation with REPLAY/STALE/SIG_FAIL rejections, and SessionReceipt exchange.',
      caption:
        'Eight-step protocol sequence across Client (Alice/Bob), TCP Server, Receiver validation engine, and Evidence audit plane.',
    },
  },

  dashboardScreenshots: [
    {
      id: 'auth-screen',
      title: 'Certificate Identity & Encrypted Login View',
      caption:
        'Captured Flask dashboard (#auth-screen): selects a local cert identity (alice, bob, charlie, dana) while header status pills report Server 127.0.0.1:8443, Root CA Verified, and No Session Key prior to authentication.',
      src: assetUrl('demo-screenshots/Login%20page.jpeg'),
      recreatedModule: 'app/templates/index.html + /api/identities + /api/auth',
    },
    {
      id: 'multi-client-charlie',
      title: 'Active Session Workspace — Client "charlie" (c8538c10)',
      caption:
        'Captured Command Center for charlie showing the protocol progress bar at Step 6 & 7 (AES-128 + RSA Data Plane), Attack Defense Sandbox, Secure Chat Room, and the Evidence tab with append-only logs.',
      src: assetUrl('demo-screenshots/charlie.jpeg'),
      recreatedModule: 'app/web_ui.py + app/templates/index.html',
    },
    {
      id: 'multi-client-dana',
      title: 'Concurrent Session Workspace — Client "dana" (77b9814f)',
      caption:
        'Captured Command Center for a second concurrent client (dana, session 77b9814f) showing Packet Wire logs for Step 1 & 2 Mutual PKI + Ephemeral DH (temp_aes_derived: true) and Step 3 encrypted login.',
      src: assetUrl('demo-screenshots/dana.jpeg'),
      recreatedModule: 'app/server.py (ClientHandler) + /api/connect + /api/auth',
    },
    {
      id: 'packet-wire',
      title: 'Live TCP Framing Inspector (Packet Wire)',
      caption:
        'Close-up of the 4-Byte Length Prefix wire inspector for charlie (c8538c10) showing client_fp, server_cn, server_fp, temp_aes_derived, and encrypted login response JSON.',
      src: assetUrl('demo-screenshots/PacketWire.jpeg'),
      recreatedModule: 'app/templates/index.html (#tab-wire)',
    },
    {
      id: 'attack-sandbox',
      title: 'Attack Defense Sandbox Controls',
      caption:
        'Close-up of the live Active Defense controls triggering Tamper Ciphertext (SIG_FAIL), Replay Previous Msg (REPLAY), and Inject Stale Msg -5m (STALE) against an active session.',
      src: assetUrl('demo-screenshots/Attack%20Defense%20sandbox.jpeg'),
      recreatedModule: 'app/web_ui.py (/api/simulate_attack)',
    },
    {
      id: 'x509-hub',
      title: 'X.509 Hub — Root CA & Server Certificate Details',
      caption:
        'Captured X.509 Hub tab (/api/certs_info) inspecting 2048-bit RSA certificates for SecureChat Root CA and Server, including SHA-256 fingerprints, serial numbers, and UTC validity windows.',
      src: assetUrl('demo-screenshots/X509.jpeg'),
      recreatedModule: 'app/web_ui.py (/api/certs_info) + app/crypto/pki.py',
    },
    {
      id: 'evidence-panel',
      title: 'Evidence Panel — Transcripts & Signed Receipts',
      caption:
        'Captured Evidence tab (/api/transcripts) showing 065b9db8_client_peer_receipt.json and 065b9db8_client_receipt.json with SHA-256 digests, RSA signatures, and one-click offline audit.',
      src: assetUrl('demo-screenshots/Evidnace.jpeg'),
      recreatedModule: 'app/web_ui.py (/api/transcripts, /api/run_audit)',
    },
  ] as ScreenshotAsset[],

  teamMembers: [
    {
      name: 'Darshan R Talwar',
      usn: '01FE23BCS303',
      rollNumber: '449',
      image: assetUrl('team-photos/Darshan%20R%20Talwar.jpeg'),
    },
    {
      name: 'Sai Kiran Y',
      usn: '01FE22BCS312',
      rollNumber: '416',
      image: assetUrl('team-photos/Sai%20Kiran%20Y.jpeg'),
    },
    {
      name: 'Eranna T P',
      usn: '01FE23NCS304',
      rollNumber: '450',
      image: assetUrl('team-photos/Eranna%20T%20P.jpeg'),
    },
    {
      name: 'Sagar S Mirje',
      usn: '01FE23BCS287',
      rollNumber: '432',
      image: assetUrl('team-photos/Sagar%20S%20Mirje.jpg'),
    },
  ] as TeamMember[],

  standardsLinks: [
    {
      id: 'rfc-3526',
      label: 'RFC 3526 — MODP Diffie–Hellman Groups',
      description: 'Defines the 2048-bit MODP Group 14 prime used in app/crypto/dh.py.',
      url: 'https://datatracker.ietf.org/doc/html/rfc3526',
      category: 'standard',
      available: true,
    },
    {
      id: 'rfc-8446',
      label: 'RFC 8446 — TLS 1.3 Protocol Reference',
      description: 'Industry reference for authenticated key exchange, mTLS, and AEAD transport.',
      url: 'https://datatracker.ietf.org/doc/html/rfc8446',
      category: 'standard',
      available: true,
    },
    {
      id: 'nist-fips-197',
      label: 'NIST FIPS 197 — AES Specification',
      description: 'Standard for AES-128 block cipher encryption.',
      url: 'https://csrc.nist.gov/publications/detail/fips/197/final',
      category: 'standard',
      available: true,
    },
    {
      id: 'nist-fips-180-4',
      label: 'NIST FIPS 180-4 — Secure Hash Standard',
      description: 'Specification for SHA-256 hashing used across messages, transcripts, and credentials.',
      url: 'https://csrc.nist.gov/publications/detail/fips/180-4/final',
      category: 'standard',
      available: true,
    },
    {
      id: 'pyca-cryptography',
      label: 'Python Cryptography Library Docs',
      description: 'Official documentation for pyca/cryptography primitives used in app/crypto/.',
      url: 'https://cryptography.io/en/latest/',
      category: 'standard',
      available: true,
    },
    {
      id: 'flask-docs',
      label: 'Flask Web Framework Documentation',
      description: 'Documentation for the local web dashboard framework in app/web_ui.py.',
      url: 'https://flask.palletsprojects.com/',
      category: 'standard',
      available: true,
    },
    {
      id: 'owasp-pw',
      label: 'OWASP Password Storage Cheat Sheet',
      description: 'Guidance cited for future upgrade from salted SHA-256 to Argon2id/bcrypt.',
      url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
      category: 'standard',
      available: true,
    },
  ] as ResourceLink[],
};

export interface RouteMeta {
  path: string;
  label: string;
  shortLabel: string;
  title: string;
}

export const routeMetaList: RouteMeta[] = [
  { path: '/', label: 'Home', shortLabel: 'Home', title: 'SecureChat — Hybrid Cryptography Portfolio' },
  { path: '/overview', label: 'Project Overview', shortLabel: 'Overview', title: 'Project Overview — SecureChat' },
  { path: '/architecture', label: 'System Architecture', shortLabel: 'Architecture', title: 'System Architecture — SecureChat' },
  { path: '/protocol', label: 'Eight-Step Protocol', shortLabel: 'Protocol', title: 'Eight-Step Protocol — SecureChat' },
  { path: '/implementation', label: 'Cryptography & Code', shortLabel: 'Implementation', title: 'Cryptography & Implementation — SecureChat' },
  { path: '/demo', label: 'Interactive Demo', shortLabel: 'Demo', title: 'Interactive Demo — SecureChat' },
  { path: '/evidence', label: 'Audit & Evidence', shortLabel: 'Evidence', title: 'Audit & Evidence — SecureChat' },
  { path: '/results', label: 'Testing & Results', shortLabel: 'Results', title: 'Testing & Results — SecureChat' },
  { path: '/team', label: 'Team', shortLabel: 'Team', title: 'Team — SecureChat' },
];
