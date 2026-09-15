export default function LogoLoop({ items, speed = 30, direction = 'left' }) {
  const track = [...items, ...items]; // duplikat buat loop seamless

  return (
    <div className="relative overflow-hidden py-1">
      {/* edge fade kiri & kanan */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-24 z-10 bg-gradient-to-r from-titanium-bg dark:from-obsidian-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-24 z-10 bg-gradient-to-l from-titanium-bg dark:from-obsidian-bg to-transparent" />

      <div
        aria-hidden="true"
        className="flex w-max items-center gap-3 animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: direction === 'right' ? 'reverse' : 'normal',
        }}
      >
        {track.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="label-mono shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border border-titanium-border dark:border-obsidian-border whitespace-nowrap"
          >
            <span className="w-1 h-1 rounded-full bg-engine shrink-0" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}