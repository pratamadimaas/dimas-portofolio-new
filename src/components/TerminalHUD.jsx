import { useEffect, useState } from 'react';

const LINES = [
  'SYSTEM: ALL STACKS OPERATIONAL // LATENCY: OPTIMAL',
  'DOMAIN: PUBLIC TREASURY ENGINEERING // ACCESS: GRANTED',
];

export default function TerminalHUD() {
  const [lineIndex, setLineIndex] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('typing'); // typing | pausing | deleting

  useEffect(() => {
    const full = LINES[lineIndex];
    let timeout;

    if (phase === 'typing') {
      if (text.length < full.length) {
        timeout = setTimeout(() => setText(full.slice(0, text.length + 1)), 28);
      } else {
        timeout = setTimeout(() => setPhase('pausing'), 1800);
      }
    } else if (phase === 'pausing') {
      timeout = setTimeout(() => setPhase('deleting'), 200);
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(text.slice(0, -1)), 14);
      } else {
        setLineIndex((i) => (i + 1) % LINES.length);
        setPhase('typing');
      }
    }

    return () => clearTimeout(timeout);
  }, [text, phase, lineIndex]);

  return (
    <div className="label-mono flex items-center gap-2 h-5">
      <span className="text-engine">$</span>
      <span>{text}</span>
      <span className="w-[6px] h-3 bg-engine animate-blink" />
    </div>
  );
}
