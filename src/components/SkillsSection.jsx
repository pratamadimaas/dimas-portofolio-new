import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { stackMatrix } from '../data/portfolioData';
import { supportsWebGL } from '../lib/webgl';
import TechIcon from './TechIcon';

const SkillsKeyboard = lazy(() => import('./SkillsKeyboard'));

// Short legends for keycaps; anything not listed uses the text before " (".
const SHORT = {
  'PHP (Laravel)': 'Laravel',
  'Python (Flask)': 'Flask',
  'Node.js (Express)': 'Node.js',
  'RESTful APIs': 'REST APIs',
  'Database-Routing Middleware': 'DB Routing',
  'Docker & Containerization': 'Docker',
  'Git & Version Control': 'Git',
  'WhatsApp API Integration (Fonnte)': 'WhatsApp',
  'LLM API Integration': 'LLM APIs',
  'React.js': 'React',
  'Tailwind CSS': 'Tailwind',
  'Framer Motion': 'Motion',
  'Three.js / R3F': 'Three.js',
  'Interactive Analytics HUD': 'Dashboards',
  'Python (Pandas, NumPy, Regex)': 'Pandas',
  'Desktop Engine (Tkinter)': 'Tkinter',
  'Data Audit & Rule Validation': 'Data Audit',
  'Document Automation (python-docx)': 'python-docx',
  'Excel VBA Automation': 'Excel VBA',
  'Google Apps Script': 'Apps Script',
  'Google Looker Studio': 'Looker',
  'Retrieval-Augmented Generation (RAG)': 'RAG',
  'MySQL (Schema Design & Query Optimization)': 'MySQL',
  'Nginx Deployment': 'Nginx',
};
const GROUP_SHORT = ['Backend', 'Frontend', 'Data', 'Infra'];

const rows = stackMatrix.map((g, i) => ({
  group: g.group,
  short: GROUP_SHORT[i] ?? g.group.split(' ')[0],
  items: g.items.map((name) => ({ name, label: SHORT[name] ?? name.split(' (')[0] })),
}));
const total = rows.reduce((n, r) => n + r.items.length, 0);

export default function SkillsSection({ isDark }) {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { margin: '200px' });
  const reduceMotion = useReducedMotion();
  const [env, setEnv] = useState({ webgl: true, fine: false });
  const [hovered, setHovered] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  useEffect(() => {
    setEnv({ webgl: supportsWebGL(), fine: window.matchMedia('(pointer: fine)').matches });
  }, []);

  const hoveredInfo = useMemo(() => {
    if (!hovered) return null;
    for (const [r, row] of rows.entries()) {
      if (hovered === `mod-${r}`) return { name: row.group, group: `${row.items.length} tools` };
      const item = row.items.find((i) => hovered === `${r}-${i.name}`);
      if (item) return { name: item.name, group: row.group };
    }
    return null;
  }, [hovered]);

  const caption = hoveredInfo
    ? hoveredInfo
    : activeRow !== null
      ? { name: rows[activeRow].group, group: `${rows[activeRow].items.length} tools` }
      : { name: `${total} tools across ${rows.length} areas`, group: 'Hover a key for details' };

  return (
    <section ref={sectionRef} id="skills" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">
        Skills & tools
      </h2>

      {env.webgl && (
        <>
          <div className="relative h-[180px] sm:h-[300px] lg:h-[400px]">
            {inView && (
              <Suspense fallback={null}>
                <SkillsKeyboard
                  rows={rows}
                  isDark={isDark}
                    interactive={env.fine && !reduceMotion}
                  hovered={hovered}
                  setHovered={setHovered}
                  activeRow={activeRow}
                  setActiveRow={setActiveRow}
                  onPick={(k) => setHovered(k.id)}
                />
              </Suspense>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter skills by area">
              {rows.map((row, i) => (
                <button
                  key={row.group}
                  type="button"
                  aria-pressed={activeRow === i}
                  onClick={() => setActiveRow((r) => (r === i ? null : i))}
                  className={`label-mono px-3.5 py-1.5 rounded-full border transition-colors duration-200 ${
                    activeRow === i
                      ? 'bg-titanium-text dark:bg-obsidian-text text-titanium-bg dark:text-obsidian-bg border-transparent'
                      : 'border-titanium-border dark:border-obsidian-border hover:text-titanium-text dark:hover:text-obsidian-text'
                  }`}
                >
                  {row.short}
                </button>
              ))}
            </div>
            <div className="md:text-right min-h-[3rem]" aria-live="polite">
              <p className="font-display font-semibold">{caption.name}</p>
              <p className="label-mono mt-1">{caption.group}</p>
            </div>
          </div>
        </>
      )}

      {/* Full list: always there for screen readers and SEO, visible only without WebGL. */}
      <div className={env.webgl ? 'sr-only' : 'grid sm:grid-cols-2 gap-x-10 gap-y-8'}>
        {rows.map((row) => (
          <div key={row.group}>
            <h3 className="font-medium mb-3">{row.group}</h3>
            <ul className="flex flex-wrap gap-2">
              {row.items.map((item) => (
                <li
                  key={item.name}
                  className="label-mono flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-titanium-border dark:border-obsidian-border"
                >
                  <TechIcon name={item.name} size={13} />
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
