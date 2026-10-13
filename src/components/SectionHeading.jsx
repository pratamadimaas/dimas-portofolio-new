// Mono eyebrow + heading, shared by the four story sections so they read as one system.
export default function SectionHeading({ eyebrow, children, className = '' }) {
  return (
    <div className={className}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">{children}</h2>
    </div>
  );
}
