import { useEffect, useState } from 'react';

export default function CountUp({ value, duration = 1400, startDelay = 0, className = '' }) {
  const match = String(value).match(/^(\D*)(\d[\d.,]*)(\D*)$/);
  const [display, setDisplay] = useState(match ? `${match[1]}0${match[3]}` : value);

  useEffect(() => {
    if (!match) return; // nggak ada angka (mis. "Days to Hours") — tampilkan apa adanya
    const [, prefix, numStr, suffix] = match;
    const target = parseFloat(numStr.replace(/,/g, ''));
    const hasDecimal = numStr.includes('.');
    let raf;
    let startTime;

    const startTimeout = setTimeout(() => {
      const tick = (ts) => {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        setDisplay(prefix + (hasDecimal ? current.toFixed(1) : Math.round(current)) + suffix);
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(raf);
    };
  }, [value, duration, startDelay]);

  return <span className={className}>{display}</span>;
}