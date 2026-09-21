export const identity = {
  name: 'Muhamad Dimas Pratama',
  role: 'Civil Servant & Freelance Software Engineer',
  location: 'Kolaka, Indonesia',
  status: 'Open to Collaborative Tech Initiatives',
  email: 'dimasmg2017@gmail.com',
  summary:
    'Software Engineer and public treasury practitioner at the Directorate General of Treasury (Ministry of Finance of Indonesia). Fusing public sector accounting principles, statutory budget execution frameworks, and modern software engineering architectures to transform complex manual workflows into high throughput automated systems.',
  credential:
  'PKN STAN alumnus (Asset Management & Treasury) and Information Systems student at UNSIA, with an earlier year studying Informatics at Universitas Sebelas Maret. Currently sharpening skills across full-stack development and machine learning.',
  telemetry: [
    { label: 'Treasury Audit Turnaround at KPPN Kolaka', value: 'Days Cut to Hours' },
    { label: 'Manual Workload Eliminated Across Spending Units', value: '>80% Reduction' },
    { label: 'Government Automation Systems Delivered', value: '6 Systems in Active Use' },
  ],
  socials: {
    instagram: 'https://www.instagram.com/pratama_dimaas/',
    tiktok: 'https://www.tiktok.com/@codewithdims15',
  },
};

export const stackMatrix = [
  {
    group: 'Core Systems & Backend',
    items: ['PHP (Laravel)', 'Python (Flask)', 'Node.js (Express)', 'RESTful APIs', 'Database-Routing Middleware', 'Docker & Containerization', 'Git & Version Control', 'Laragon', 'WhatsApp API Integration (Fonnte)'],
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

export const coreStack = [
  'React', 'Next.js', 'Laravel', 'Python', 'Flask',
  'Node.js', 'Three.js / R3F', 'Tailwind CSS', 'Docker', 'MySQL',
  'SQL Server', 'MongoDB', 'Nginx', 'Tableau', 'Google Apps Script',
];

export const projectFilters = [
  { key: 'all', label: 'All' },
  { key: 'instansi', label: 'Internal' },
  { key: 'freelance', label: 'Freelance' },
  { key: 'personal', label: 'Data Science' },
];

export const projects = [
  {
    id: 'deviasiguard',
    name: 'DeviasiGuard',
    subtitle: 'Budget Deviation Analytics & WhatsApp Dispatch Engine',
    category: 'instansi',
    tags: ['AUTOMATION', 'ANALYTICS', 'TREASURY'],
    metric: 'Instant Sync & Automated Dispatch',
    description:
      'Audits budget deviations against DIPA cash withdrawal plans under PER-5/PB/2024. Reads raw MyIntress Excel exports, scores IKPA performance, and sends WhatsApp alerts to spending units.',
    stack: ['Google Apps Script', 'Data Analytics', 'Chart.js', 'PDF/Excel Export Engine'],
    size: 'lg',
    url: 'https://s.kemenkeu.go.id/Deviasi156',
  },
  {
    id: 'si-caput',
    name: 'SI-CAPUT 2026',
    subtitle: 'Asisten Diagnostik Capaian Output Satker',
    category: 'instansi',
    tags: ['AUTOMATION', 'ANALYTICS', 'TREASURY'],
    metric: '8 Data Quality Rules Validated',
    description:
      'Validates Capaian Rincian Output data from MyIntress/SAKTI against the 8 statutory data-quality variables in PER-5/PB/2024. Flags anomalies, scores IKPA per output, and drafts the SAKTI approval notes.',
    stack: ['Google Apps Script', 'SheetJS (xlsx)', 'Tailwind CSS', 'IKPA Scoring Engine'],
    size: 'md',
    url: 'https://s.kemenkeu.go.id/Caput156',
  },
  {
    id: 'telaah-lk-desktop',
    name: 'Telaah LK Desktop Engine',
    subtitle: 'Automated Government Ledger Compliance Auditor',
    category: 'instansi',
    tags: ['OOP', 'PYTHON', 'FINANCIAL AUDIT'],
    metric: '151 Validation Rules Checked',
    description:
      'Audits government ledger transactions against 151 statutory accounting rules using an object-oriented Python architecture, cutting review time from days to hours.',
    stack: ['Python', 'Pandas', 'Regex Pattern Engine', 'Tkinter GUI'],
    size: 'lg',
    url: 'https://www.linkedin.com/in/pratamadimaas/',
    linkLabel: 'Available on Request',
  },
  {
    id: 'smart-kppn-kolaka',
    name: 'SMART KPPN Kolaka',
    subtitle: 'Guest Administration & Employee Leave Portal',
    category: 'instansi',
    tags: ['FULL-STACK', 'ENTERPRISE'],
    metric: 'Leave & Guest System',
    description:
      'Manages visitor registration and employee leave requests for KPPN Kolaka, replacing manual paperwork with a tracked digital workflow.',
    stack: ['Laravel', 'PHP', 'MySQL', 'Tailwind CSS'],
    size: 'md',
    url: 'https://smart-kppnkolaka.my.id/',
  },
  {
    id: 'up-tup-smart-generator',
    name: 'UP-TUP Smart Document Generator',
    subtitle: 'Financial Administration Document Automation',
    category: 'instansi',
    tags: ['AUTOMATION', 'DESKTOP'],
    metric: '>80% Cycle Time Cut',
    description:
      'Generates treasury disbursement documents (UP PNBP, UP KKP, TUP) with automatic terbilang conversion, stamp binding, and Word rendering.',
    stack: ['Python', 'Tkinter', 'python-docx', 'Automation Logic'],
    size: 'lg',
    url: 'https://www.linkedin.com/in/pratamadimaas/',
    linkLabel: 'Available on Request',
  },
  {
    id: 'cleardraft',
    name: 'ClearDraft',
    subtitle: 'Self-Serve Document Generation SaaS',
    category: 'freelance',
    tags: ['SAAS', 'FULL-STACK', 'AUTOMATION'],
    metric: '500+ Docs Generated',
    description:
      'Turns uploaded Word templates into a self-serve document generator. Parses placeholders into a form, then renders finished documents in under 3 seconds. Used by schools, HR teams, and notaries.',
    stack: ['React.js', 'Laravel', 'MySQL', 'Ubuntu VPS'],
    size: 'md',
    url: 'https://cleardraft.online/',
  },
  {
  id: 'whatsapp-chatbot-gateway',
  name: 'WhatsApp Auto-Response Gateway',
  subtitle: 'Menu-Based Chatbot via Fonnte & Apps Script',
  category: 'freelance',
  tags: ['AUTOMATION', 'CHATBOT', 'INTEGRATION'],
  metric: 'Instant Auto Reply Routing',
  description:
    'Routes incoming WhatsApp messages through a numbered menu using the Fonnte API and Google Apps Script, automating replies to common client questions.',
  stack: ['Google Apps Script', 'Fonnte API', 'WhatsApp Gateway', 'Webhook Routing'],
  size: 'lg',
  url: 'https://www.linkedin.com/in/pratamadimaas/',
  linkLabel: 'Available on Request',
},
{
  id: 'konfirmasi-gaji-web',
  name: 'Payroll Web Submission Confirmation System',
  subtitle: 'Salary Reconciliation, SKPP & Related Services KPPN Kolaka',
  category: 'instansi',
  tags: ['AUTOMATION', 'TREASURY', 'INTEGRATION'],
  metric: 'Real Time WhatsApp Auto Notification',
  description:
    'Handles salary reconciliation and SKPP submissions for spending units under KPPN Kolaka, with real-time WhatsApp notifications on each update.',
  stack: ['Google Apps Script', 'HTML/CSS/JS', 'Google Sheets', 'Fonnte API'],
  size: 'md',
  url: 'https://bit.ly/RekondanSkppKolaka',
},
  {
  id: 'anagram-project',
  name: 'Anagram Project',
  subtitle: 'Data, Programming & AI Learning Platform',
  category: 'freelance',
  tags: ['EDTECH', 'CO-FOUNDED', 'ASSESSMENT ENGINE'],
  metric: 'Co-Founded & In Development',
  description:
    'Teaches data analytics, programming, and practical AI to beginners through bootcamps, self-paced materials, and corporate training. Includes a custom quiz and grading system for tracking learner progress. Also offers custom application development services for businesses on request.',
  stack: ['React.js', 'Tailwind CSS', 'Google Apps Script', 'Vercel'],
  size: 'lg',
  url: 'https://anagram-project.vercel.app/',
},
  {
  id: 'football-player-clustering',
  name: 'Football Player Archetype Clustering',
  subtitle: 'Unsupervised Tactical Style Classification, Europe Top 5 Leagues',
  category: 'personal',
  tags: ['MACHINE LEARNING', 'CLUSTERING', 'DATA SCIENCE'],
  metric: '1,330 Players Sorted into 6 Tactical Archetypes',
  description:
    'Applies K-Means clustering on per-90-minute performance metrics (goals, assists, shots, tackles, interceptions) from the 2026-2027 season across the Premier League, La Liga, Serie A, Bundesliga, and Ligue 1. Groups outfield players into 6 tactical archetypes, from Elite Finisher to Playmaker Kreatif, validated with PCA visualization and silhouette scoring.',
  stack: ['Python', 'scikit-learn', 'Pandas', 'Matplotlib', 'Google Colab'],
  size: 'md',
  url: 'https://colab.research.google.com/drive/1fUAhrkbYdG5pUZ3f2TVSNzJDUtXbyLd4?usp=sharing',
  linkLabel: 'View on Google Colab',
},
{
    id: 'gold-price-forecasting',
    name: 'Gold Price Forecasting & Risk Analysis',
    subtitle: 'Time Series Analysis of 16 Years of Indonesian Gold Prices',
    category: 'personal',
    tags: ['MACHINE LEARNING', 'TIME SERIES', 'FORECASTING'],
    metric: '6.104 Daily Observations, 2010 to 2026',
    description:
      'Forecasts Antam gold prices using Prophet, decomposed against trend and seasonality across 16 years of daily data. Detects bull and bear regimes through moving average crossovers, quantifies risk through rolling volatility and maximum drawdown, and overlays major macroeconomic events including the 2011 European debt crisis, the 2020 COVID crash, and the 2025 to 2026 rally.',
    stack: ['Python', 'Prophet', 'Pandas', 'NumPy', 'Matplotlib', 'Google Colab', 'Next.js'],
    size: 'lg',
    url: 'https://antam-insight.vercel.app/',
    linkLabel: 'Visit Live Dashboard',
    secondaryUrl: 'https://colab.research.google.com/drive/1F4bZXQ_6YMfbfyxM0s5WXHWJbiHtuyrx?usp=sharing',
    secondaryLabel: 'View Notebook on Google Colab',
  },
  {
  id: 'budget-deviation-risk-model',
  name: 'Budget Deviation Early Warning Model',
  subtitle: 'Binary Classification for Spending Unit Compliance Risk',
  category: 'personal',
  tags: ['MACHINE LEARNING', 'CLASSIFICATION', 'TREASURY'],
  metric: '55 Spending Units Scored for Year End Risk',
  description:
    'Random Forest classifier trained on 2024-2025 monthly deviation patterns across 5 spending categories to predict which spending units are likely to fall below the compliance threshold by year end. Applied live to September 2026 data to flag at risk units before Q4 closes, alongside a pace tracking metric identifying which units are falling behind their own disbursement plan.',
  stack: ['Python', 'scikit-learn', 'Pandas', 'Random Forest', 'Google Colab'],
  size: 'lg',
  url: 'https://www.linkedin.com/in/pratamadimaas/',
  linkLabel: 'Discuss via LinkedIn (Data Confidential)',
},
];

export const experience = [
  {
    period: 'Nov 2024 — Present',
    title: 'KPPN Kolaka',
    role: 'Customer Service Officer',
    detail: 'Managing spending unit consultations, resolving core system operations (SAKTI/MyIntress), and engineering automation tools like DeviasiGuard and SI-CAPUT to safeguard budget compliance.',
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
    title: 'Universitas Siber Asia',
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
    title: 'Universitas Sebelas Maret',
    role: 'Informatics',
    detail: 'Admitted through SBMPTN. Spent one deeply engaged year here building a foundation in algorithms, data structures, C, and Python (3.56 GPA) before leaving to pursue an opportunity at PKN STAN.',
    badge: 'Foundational CS',
  },
  {
    period: '2014 — 2017',
    title: 'SMA Negeri 1 Purworejo',
    role: 'Natural Sciences & Mathematics (MIPA)',
    detail: 'Developed a strong personal draw toward mathematics and logic, the analytical instinct that would later carry directly into algorithmic thinking and systems design.',
    badge: 'Secondary Education',
  },
];