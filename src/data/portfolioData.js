export const identity = {
  name: 'Muhamad Dimas Pratama',
  role: 'Civil Servant & Freelance Software Engineer',
  location: 'Kolaka, Indonesia',
  status: 'Open to Collaborative Tech Initiatives',
  email: 'dimasmg2017@gmail.com',
  summary:
    'Software Engineer and public treasury practitioner at the Directorate General of Treasury (Ministry of Finance of Indonesia). Fusing public sector accounting principles, statutory budget execution frameworks, and modern software engineering architectures to transform complex manual workflows into high-throughput automated systems.',
  credential:
  'PKN STAN alumnus (Asset Management & Treasury) and self-funded Information Systems student at UNSIA, backed by foundational Informatics training at Universitas Sebelas Maret. Currently sharpening skills across full-stack development and machine learning.',
  telemetry: [
    { label: 'Review Latency Cut', value: 'Days to Hours' },
    { label: 'Admin Overhead Reduced', value: '>80%' },
    { label: 'Compliance Criteria Validated', value: '151 Rules' },
  ],
  socials: {
    instagram: 'https://www.instagram.com/pratama_dimaas/',
    tiktok: 'https://www.tiktok.com/@codewithdims15',
  },
};

export const stackMatrix = [
  {
    group: 'Core Systems & Backend',
    items: ['PHP (Laravel)', 'Python (Flask)', 'Java (Spring Boot)', 'Node.js (Express)', 'RESTful APIs', 'Database-Routing Middleware', 'Docker & Containerization', 'Git & Version Control', 'Laragon', 'WhatsApp API Integration (Fonnte)'],
  },
  {
    group: 'UI & Creative Engineering',
    items: ['React.js', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'Three.js / R3F', 'Interactive Analytics HUD'],
  },
 {
  group: 'Data Intelligence & Desktop OOP',
  items: ['Python (Pandas, NumPy, Regex)', 'Desktop Engine (Tkinter)', 'Data Audit & Rule Validation', 'Document Automation (python-docx)', 'Excel VBA Automation', 'Tableau', 'Google Apps Script', 'Google Looker Studio'],
},
  {
    group: 'Databases & Infrastructure',
    items: ['MySQL (Schema Design & Query Optimization)', 'SQL Server', 'MongoDB', 'Ubuntu VPS', 'Nginx Deployment', 'phpMyAdmin'],
  },
];

export const projects = [
  {
    id: 'deviasiguard',
    name: 'DeviasiGuard',
    subtitle: 'Budget Deviation Analytics & WhatsApp Dispatch Engine',
    tags: ['AUTOMATION', 'ANALYTICS', 'TREASURY'],
    metric: 'Instant Sync & Automated Dispatch',
    description:
      'Analytics and automation engine built to audit budget realization deviations against Section III DIPA cash withdrawal plans (PER-5/PB/2024 compliance). Ingests raw MyIntress Excel extracts with zero preprocessing, generates interactive risk matrices, computes IKPA performance scores, and drafts targeted WhatsApp action items for regional spending units.',
    stack: ['Google Apps Script', 'Data Analytics', 'Chart.js', 'PDF/Excel Export Engine'],
    size: 'lg',
    url: 'https://s.kemenkeu.go.id/Deviasi156',
  },
  {
    id: 'si-caput',
    name: 'SI-CAPUT 2026',
    subtitle: 'Asisten Diagnostik Capaian Output Satker',
    tags: ['AUTOMATION', 'ANALYTICS', 'TREASURY'],
    metric: '8 Data Quality Rules Validated',
    description:
      'Diagnostic web assistant that ingests raw Capaian Rincian Output (RO) exports from MyIntress/SAKTI and validates them against the 8 statutory data-quality variables under Juknis 2026 (PER-5/PB/2024). Flags PCRO/RVRO/TPCRO anomalies, computes IKPA component scores per RO, and auto-drafts the SAKTI keterangan text spending units need to get KPPN approval.',
    stack: ['Google Apps Script', 'SheetJS (xlsx)', 'Tailwind CSS', 'IKPA Scoring Engine'],
    size: 'md',
    url: 'https://s.kemenkeu.go.id/Caput156',
  },
  {
    id: 'telaah-lk-desktop',
    name: 'Telaah LK Desktop Engine',
    subtitle: 'Automated Government Ledger Compliance Auditor',
    tags: ['OOP', 'PYTHON', 'FINANCIAL AUDIT'],
    metric: '151 Validation Rules Checked',
    description:
      'Offline desktop application built on object-oriented Python architecture to audit thousands of monthly ledger transactions across accrual, cash, bank, and comparative journals. Encapsulates 151 statutory accounting rules into automated validation classes, compressing audit turnaround time from days to hours.',
    stack: ['Python', 'Pandas', 'Regex Pattern Engine', 'Tkinter GUI'],
    size: 'lg',
    url: 'https://www.linkedin.com/in/pratamadimaas/',
    linkLabel: 'Connect on LinkedIn',
  },
  {
    id: 'smart-kppn-kolaka',
    name: 'SMART KPPN Kolaka',
    subtitle: 'Guest Administration & Employee Leave Portal',
    tags: ['FULL-STACK', 'ENTERPRISE'],
    metric: 'Leave & Guest System',
    description:
      'Internal enterprise portal engineered to govern stakeholder consultations, visitor reception registries, and employee leave requests. Eliminates manual paperwork, mitigates data entry errors, and establishes transparent audit trails across KPPN Kolaka.',
    stack: ['Laravel', 'PHP', 'MySQL', 'Tailwind CSS'],
    size: 'md',
    url: 'https://smart-kppnkolaka.my.id/',
  },
  {
    id: 'up-tup-smart-generator',
    name: 'UP-TUP Smart Document Generator',
    subtitle: 'Financial Administration Document Automation',
    tags: ['AUTOMATION', 'DESKTOP'],
    metric: '>80% Cycle Time Cut',
    description:
      'Desktop automation utility designed to streamline the compilation of treasury disbursement dossiers (UP PNBP, UP KKP, and TUP). Features instantaneous numeric-to-words currency conversion (Indonesian terbilang), automated image/stamp binding, strict form input sanitization, and programmatic Word document rendering.',
    stack: ['Python', 'Tkinter', 'python-docx', 'Automation Logic'],
    size: 'lg',
    url: 'https://www.linkedin.com/in/pratamadimaas/',
    linkLabel: 'Connect on LinkedIn',
  },
  {
    id: 'cleardraft',
    name: 'ClearDraft',
    subtitle: 'Self-Serve Document Generation SaaS',
    tags: ['SAAS', 'FULL-STACK', 'AUTOMATION'],
    metric: '500+ Docs Generated',
    description:
      'Self-serve SaaS platform that turns any uploaded Word template into a reusable document generator. Parses DOCX placeholders (e.g. ${nama}, ${tanggal}, ${jabatan}) to auto build a data entry form, then renders a fully formatted output document in under 3 seconds and used by schools, HR departments, village offices, notaries, and clinics to replace repetitive manual typing.',
    stack: ['React.js', 'Laravel', 'MySQL', 'Ubuntu VPS'],
    size: 'md',
    url: 'https://cleardraft.online/',
  },
  {
  id: 'whatsapp-chatbot-gateway',
  name: 'WhatsApp Auto-Response Gateway',
  subtitle: 'Menu-Based Chatbot via Fonnte & Apps Script',
  tags: ['AUTOMATION', 'CHATBOT', 'INTEGRATION'],
  metric: 'Instant Auto Reply Routing',
  description:
    'Client-facing WhatsApp automation built by integrating the Fonnte API with Google Apps Script as the logic layer. Incoming messages are parsed and routed through a numbered menu system (e.g. reply "1" for X, "2" for Y), triggering the appropriate auto response without manual intervention reducing repetitive client inquiries into a self service flow.',
  stack: ['Google Apps Script', 'Fonnte API', 'WhatsApp Gateway', 'Webhook Routing'],
  size: 'lg',
  url: 'https://www.linkedin.com/in/pratamadimaas/',
  linkLabel: 'Connect on LinkedIn',
},
{
  id: 'konfirmasi-gaji-web',
  name: 'Payroll Web Submission Confirmation System',
  subtitle: 'Salary Reconciliation, SKPP & Related Services KPPN Kolaka',
  tags: ['AUTOMATION', 'TREASURY', 'INTEGRATION'],
  metric: 'Real Time WhatsApp Auto Notification',
  description:
    'Submission web app for spending units under KPPN Kolaka, covering Salary Reconciliation, SKPP, Payroll ADK Deletion, SK Completeness, New Employee Data, and Data Matching requests. Form entries are saved directly to a spreadsheet acting as the database and automatically trigger a real-time WhatsApp notification to KPPN staff via Fonnte, cutting down manual follow up time between spending units.',
  stack: ['Google Apps Script', 'HTML/CSS/JS', 'Google Sheets', 'Fonnte API'],
  size: 'md',
  url: 'https://bit.ly/RekondanSkppKolaka',
},
  {
  id: 'anagram-project',
  name: 'Anagram Project',
  subtitle: 'Data, Programming & AI Learning Platform',
  tags: ['EDTECH', 'CO-FOUNDED'],
  metric: 'Co-Founded & In Development',
  description:
    'Education platform built with a business partner to make data analytics, programming, and practical AI accessible to complete beginners, no IT background required. Spans bootcamps and workshops, self paced digital products like templates and case study libraries, and by request custom development and corporate training for businesses and government offices.',
  stack: ['React.js', 'Tailwind CSS','Google Apps Script','Vercel'],
  size: 'lg',
  url: 'https://anagram-project.vercel.app/',
},
];

export const experience = [
  {
    period: 'Nov 2024 — Present',
    title: 'KPPN Kolaka',
    role: 'Customer Service Officer',
    detail: 'Managing spending unit consultations, resolving core system operations (SAKTI/MyIntress), and engineering automation tools like DeviasiGuard and SMART to safeguard budget compliance.',
    badge: 'Current Assignment',
  },
  {
    period: 'Sep 2024 — Oct 2024',
    title: 'Sekretariat Direktorat Jenderal Perbendaharaan',
    role: 'On-the-Job Training (Re-Entry Program)',
    detail: 'Strategic onboarding and high-level treasury operations alignment following full-time study assignment.',
    badge: 'HQ Assignment',
  },
  {
    period: 'Aug 2022 — Sep 2024',
    title: 'Sekretariat Direktorat Jenderal Perbendaharaan',
    role: 'Tugas Belajar (Ministry-Funded Scholarship)',
    detail: 'Administratively home-based at the DG Treasury Secretariat while on a fully Ministry of Finance-funded tugas belajar, returning to PKN STAN for a second Associate Degree (D3) in Asset Management.',
    badge: 'HQ Assignment',
  },
  {
    period: 'Sep 2020 — Aug 2022',
    title: 'KPPN Masohi',
    role: 'General Affairs & Household Staff',
    detail: 'Handled procurement and payment workflows, office logistics and protocol, Public Information Disclosure (KIP) services, and social media, while monitoring infrastructure readiness.',
    badge: 'Regional Deployment',
  },
{
  period: 'Dec 2019 — Aug 2020',
  title: 'KPPN Serang',
  role: 'Bank Staff',
  detail:
    'Supported government treasury payment operations, with a focus on PPR recording and returned payment (retur) processing. Reviewed SP2D and beneficiary data, identified payment discrepancies, coordinated data corrections with spending units, and supported the reprocessing of returned funds through the treasury system.',
  badge: 'On The Job Training',
},
];


export const education = [
  {
    period: '2026 — 2028',
    title: 'Universitas Siber Asia (UNSIA)',
    role: 'B.S. in Information Systems (Currently Enrolled)',
    detail: 'Currently pursuing a bachelor\'s degree in Information Systems part-time alongside full-time work, deepening formal grounding in enterprise systems architecture, distributed database paradigms, and large-scale software engineering.',
    badge: 'Higher Education',
  },
  {
    period: '2022 — 2024',
    title: 'Politeknik Keuangan Negara STAN',
    role: 'Associate Degree (D3 Extension) — Asset Management',
    detail: 'Graduated with a 3.76 GPA specializing in business valuation, government financial accounting, and state asset optimization. It was also during this period that programming re-entered the picture, self-driven coding practice alongside formal coursework became the seed of the full-stack engineering path that followed.',
    badge: 'Study Assignment',
  },
  {
    period: '2018 — 2019',
    title: 'Politeknik Keuangan Negara STAN',
    role: 'Diploma 1 — State Treasury',
    detail: 'Graduated with a 3.50 GPA. Completed foundational training in state budget cycles, fund disbursement, and public cash management.',
    badge: 'Foundational Academy',
  },
  {
    period: '2017 — 2018',
    title: 'Universitas Sebelas Maret (UNS)',
    role: 'Informatics',
    detail: 'Completed coursework with a 3.56 GPA. Established rigorous foundations in algorithms, data structures, C, and Python.',
    badge: 'Foundational CS',
  },
  {
    period: '2014 — 2017',
    title: 'SMA Negeri 1 Purworejo',
    role: 'Natural Sciences & Mathematics (MIPA)',
    detail: 'Developed a strong personal draw toward mathematics and logic — the analytical instinct that would later carry directly into algorithmic thinking and systems design.',
    badge: 'Secondary Education',
  },
];