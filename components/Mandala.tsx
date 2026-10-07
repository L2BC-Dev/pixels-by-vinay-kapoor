// Line-art mandala (rangoli-inspired). Strokes use currentColor; add data-draw to animate on scroll.
export default function Mandala({ className = "", draw = false }: { className?: string; draw?: boolean }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);
  const small = Array.from({ length: 32 }, (_, i) => i * 11.25);
  return (
    <svg viewBox="-200 -200 400 400" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden data-draw={draw || undefined}>
      <circle r="190" />
      <circle r="176" strokeDasharray="2 6" />
      <circle r="120" />
      <circle r="60" />
      <circle r="22" />
      {petals.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 -60 C 26 -90 26 -110 0 -150 C -26 -110 -26 -90 0 -60Z" />
          <path d="M0 -75 C 12 -95 12 -108 0 -130 C -12 -108 -12 -95 0 -75Z" />
          <circle cy="-163" r="6" />
        </g>
      ))}
      {small.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 -22 C 8 -34 8 -44 0 -58 C -8 -44 -8 -34 0 -22Z" />
          <path d="M0 -176 L 4 -190 L 0 -198 L -4 -190Z" />
        </g>
      ))}
    </svg>
  );
}
