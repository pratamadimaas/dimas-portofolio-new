import { useEffect, useRef, useState } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*_+-<>/[]{}';

export default function DecryptedText({
  text,
  speed = 28,
  revealDelay = 38,
  startDelay = 0,
  className = '',
}) {
  const [display, setDisplay] = useState(() => text.replace(/\S/g, ' '));
  const revealedRef = useRef(0);
  const scrambleTimeout = useRef(null);
  const revealTimeout = useRef(null);

  useEffect(() => {
    let cancelled = false;
    revealedRef.current = 0;

    const scrambleTick = () => {
      if (cancelled) return;
      let out = '';
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') out += ' ';
        else if (i < revealedRef.current) out += text[i];
        else out += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setDisplay(out);
      if (revealedRef.current < text.length) {
        scrambleTimeout.current = setTimeout(scrambleTick, speed);
      } else {
        setDisplay(text);
      }
    };

    const revealTick = () => {
      if (cancelled) return;
      revealedRef.current += 1;
      if (revealedRef.current < text.length) {
        revealTimeout.current = setTimeout(revealTick, revealDelay);
      }
    };

    const startTimeout = setTimeout(() => {
      scrambleTick();
      revealTick();
    }, startDelay);

    return () => {
      cancelled = true;
      clearTimeout(startTimeout);
      clearTimeout(scrambleTimeout.current);
      clearTimeout(revealTimeout.current);
    };
  }, [text, speed, revealDelay, startDelay]);

  return (
    <span className={className} aria-label={text}>
      {display}
    </span>
  );
}