import { useRef, useEffect, useCallback } from 'react';

export default function ClickSpark({
  children,
  sparkColor = '#22c55e',
  sparkSize = 10,
  sparkRadius = 18,
  sparkCount = 8,
  duration = 500,
  className = '',
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const sparksRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let animationId;
    const easeOut = (t) => t * (2 - t);

    const draw = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;
        const progress = elapsed / duration;
        const eased = easeOut(progress);
        const distance = eased * sparkRadius;
        const lineLength = sparkSize * (1 - eased);

        for (let i = 0; i < sparkCount; i++) {
          const angle = (2 * Math.PI * i) / sparkCount;
          const x1 = spark.x + distance * Math.cos(angle);
          const y1 = spark.y + distance * Math.sin(angle);
          const x2 = spark.x + (distance + lineLength) * Math.cos(angle);
          const y2 = spark.y + (distance + lineLength) * Math.sin(angle);

          ctx.strokeStyle = sparkColor;
          ctx.globalAlpha = 1 - progress;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        return true;
      });
      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration]);

  const handleClick = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect();
    sparksRef.current.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      startTime: performance.now(),
    });
  }, []);

  return (
    <div ref={containerRef} onClick={handleClick} className={`relative inline-block ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      {children}
    </div>
  );
}