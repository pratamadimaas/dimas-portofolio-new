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
// Names in the visible list: clear enough for someone outside IT, not too long to wrap badly.
const LIST = {
  'Database-Routing Middleware': 'Database routing middleware',
  'Docker & Containerization': 'Docker',
  'Git & Version Control': 'Git',
  'WhatsApp API Integration (Fonnte)': 'WhatsApp API (Fonnte)',
  'Three.js / R3F': 'Three.js (3D on the web)',
  'Interactive Analytics HUD': 'Interactive dashboards',
  'Python (Pandas, NumPy, Regex)': 'Python (Pandas, NumPy)',
  'Desktop Engine (Tkinter)': 'Desktop apps (Tkinter)',
  'Document Automation (python-docx)': 'Word automation (python-docx)',
  'Retrieval-Augmented Generation (RAG)': 'RAG (AI answers from documents)',
  'MySQL (Schema Design & Query Optimization)': 'MySQL',
  'Nginx Deployment': 'Nginx',
  'LLM API Integration': 'LLM APIs (Gemini)',
};
const GROUP_SHORT = ['Backend', 'Frontend', 'Data', 'Infra'];

const rows = stackMatrix.map((g, i) => ({
  group: g.group,
  about: g.about,
  short: GROUP_SHORT[i] ?? g.group.split(' ')[0],
  items: g.items.map((name) => ({ name, label: SHORT[name] ?? name.split(' (')[0], listLabel: LIST[name] ?? name })),
}));

// The 3D keyboard needs room for its legends to be readable: tablet and up only.
function useKeyboardEnv() {
  const [env, setEnv] = useState({ show: false, fine: false });

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 768px)');
    const update = () =>
      setEnv({ show: wide.matches && supportsWebGL(), fine: window.matchMedia('(pointer: fine)').matches });
    update();
    wide.addEventListener('change', update);
    return () => wide.removeEventListener('change', update);
  }, []);

  return env;
}

export default function SkillsSection({ isDark }) {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { margin: '200px' });
  const reduceMotion = useReducedMotion();
  const env = useKeyboardEnv();
  const [hovered, setHovered] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const caption = useMemo(() => {
    if (hovered) {
      for (const [r, row] of rows.entries()) {
        if (hovered === `mod-${r}`) return `${row.group}: ${row.items.length} tools`;
        const item = row.items.find((i) => hovered === `${r}-${i.name}`);
        if (item) return `${item.name} · ${row.group}`;
      }
    }
    return 'Point at a key, or at a tool in the list below.';
  }, [hovered]);

  return (
    <section ref={sectionRef} id="skills" className="px-6 md:px-10 max-w-6xl mx-auto py-24 md:py-32">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Skills & tools</h2>
      <p className="mt-3 max-w-xl text-titanium-muted dark:text-obsidian-muted">
        What I use to build the projects above, grouped by the part of an app it covers.
      </p>

      {env.show && (
        <div className="mt-10">
          <div className="relative h-[300px] lg:h-[380px]">
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
          <p className="mt-2 text-center label-mono min-h-[1rem]" aria-live="polite">
            {caption}
          </p>
        </div>
      )}

      <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">
        {rows.map((row, r) => {
          const dimmed = activeRow !== null && activeRow !== r;
          return (
            <div
              key={row.group}
              onPointerEnter={() => env.show && setActiveRow(r)}
              onPointerLeave={() => env.show && setActiveRow(null)}
              className={`border-t border-titanium-border dark:border-obsidian-border pt-5 transition-opacity duration-300 ${
                dimmed ? 'opacity-40' : ''
              }`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-semibold">{row.group}</h3>
                <span className="label-mono">{row.items.length} tools</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-titanium-muted dark:text-obsidian-muted">
                {row.about}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {row.items.map((item) => {
                  const id = `${r}-${item.name}`;
                  const on = hovered === id;
                  return (
                    <li
                      key={item.name}
                      onPointerEnter={() => setHovered(id)}
                      onPointerLeave={() => setHovered(null)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors duration-200 ${
                        on
                          ? 'border-engine text-engine'
                          : 'border-titanium-border dark:border-obsidian-border'
                      }`}
                    >
                      <TechIcon name={item.name} size={14} />
                      {item.listLabel}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
