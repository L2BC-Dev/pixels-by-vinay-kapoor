"use client";
import { useEffect, useRef, useState } from "react";

// A viewfinder-style cursor: corner brackets that expand over links/images, with a REC dot.
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current!;
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = (e.target as HTMLElement).closest<HTMLElement>("a,button,[data-cursor]");
      setActive(!!t);
      setLabel(t?.dataset.cursor ?? "");
    };
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    el.style.opacity = "1";
    addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const size = label ? 92 : active ? 48 : 26;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[70] opacity-0 drop-shadow-[0_0_2px_rgba(11,10,16,0.9)]">
      <div
        className="relative -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-300 ease-out"
        style={{ width: size, height: size }}
      >
        {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "left-0 bottom-0 border-l border-b", "right-0 bottom-0 border-r border-b"].map((c) => (
          <span key={c} className={`absolute h-2.5 w-2.5 border-cream ${c}`} />
        ))}
        <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rani" />
        {label && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-cream">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
