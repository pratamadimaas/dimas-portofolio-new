import {
  SiReact,
  SiNextdotjs,
  SiAngular,
  SiTypescript,
  SiLaravel,
  SiPython,
  SiFlask,
  SiNodedotjs,
  SiThreedotjs,
  SiTailwindcss,
  SiDocker,
  SiMysql,
  SiPostgresql,
  SiMongodb,
  SiNginx,
  SiGoogleappsscript,
  SiGit,
  SiLaragon,
  SiWhatsapp,
  SiPandas,
  SiUbuntu,
  SiPhpmyadmin,
  SiFramer,
  SiLooker,
} from '@icons-pack/react-simple-icons';
import {
  Database,
  BarChart3,
  Network,
  Route,
  Bot,
  Gauge,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  BrainCircuit,
} from 'lucide-react';

// Keyed by the exact labels used in coreStack / stackMatrix (portfolioData.js).
// Brand marks come from Simple Icons; labels without an official mark (SQL Server,
// Tableau, Excel were removed at the brand owners' request) or that are concepts
// rather than products fall back to the closest generic Lucide glyph.
const ICONS = {
  // coreStack
  React: SiReact,
  'Next.js': SiNextdotjs,
  Angular: SiAngular,
  TypeScript: SiTypescript,
  Laravel: SiLaravel,
  Python: SiPython,
  Flask: SiFlask,
  'Node.js': SiNodedotjs,
  'Three.js / R3F': SiThreedotjs,
  'Tailwind CSS': SiTailwindcss,
  Docker: SiDocker,
  MySQL: SiMysql,
  PostgreSQL: SiPostgresql,
  MongoDB: SiMongodb,
  Nginx: SiNginx,
  'Google Apps Script': SiGoogleappsscript,

  // stackMatrix
  'PHP (Laravel)': SiLaravel,
  'Python (Flask)': SiFlask,
  'Node.js (Express)': SiNodedotjs,
  'Docker & Containerization': SiDocker,
  'Git & Version Control': SiGit,
  Laragon: SiLaragon,
  'WhatsApp API Integration (Fonnte)': SiWhatsapp,
  'React.js': SiReact,
  'Python (Pandas, NumPy, Regex)': SiPandas,
  'Desktop Engine (Tkinter)': SiPython,
  'MySQL (Schema Design & Query Optimization)': SiMysql,
  'Ubuntu VPS': SiUbuntu,
  'Nginx Deployment': SiNginx,
  phpMyAdmin: SiPhpmyadmin,
  'Framer Motion': SiFramer,
  'Google Looker Studio': SiLooker,
};

const GENERIC_ICONS = {
  'SQL Server': Database,
  Tableau: BarChart3,
  'RESTful APIs': Network,
  'Database-Routing Middleware': Route,
  'LLM API Integration': Bot,
  'Interactive Analytics HUD': Gauge,
  'Data Audit & Rule Validation': ShieldCheck,
  'Document Automation (python-docx)': FileText,
  'Excel VBA Automation': FileSpreadsheet,
  'Retrieval-Augmented Generation (RAG)': BrainCircuit,
};

// Decorative: the tech name is always rendered next to the icon.
export default function TechIcon({ name, size = 14, className = '' }) {
  const Brand = ICONS[name];
  if (Brand) {
    return <Brand size={size} title="" aria-hidden="true" className={`shrink-0 ${className}`} />;
  }
  const Generic = GENERIC_ICONS[name];
  if (Generic) {
    return <Generic size={size} strokeWidth={1.75} aria-hidden="true" className={`shrink-0 ${className}`} />;
  }
  return null;
}
