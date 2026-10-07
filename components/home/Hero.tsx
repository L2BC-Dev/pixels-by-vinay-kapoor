"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Photo } from "@/content/shoots";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false, loading: () => null });

function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Hero({ photos }: { photos: Photo[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [mode, setMode] = useState<"pending" | "3d" | "static">("pending");

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(!reduced && canWebGL() ? "3d" : "static");
  }, []);

  useEffect(() => {
    const el = wrap.current!;
    let raf = 0;
    const loop = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
      progress.current = p;
      if (overlay.current) {
        overlay.current.style.opacity = String(1 - Math.min(1, p * 2.4));
        overlay.current.style.transform = `translateY(${p * -120}px) scale(${1 + p * 0.15})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-in", { y: 60, opacity: 0, duration: 1.6, ease: "expo.out", stagger: 0.12, delay: 0.7 });
      gsap.from(".hero-logo", { opacity: 0, filter: "blur(18px)", scale: 1.08, duration: 2.4, ease: "power3.out", delay: 0.4 });
      gsap.from(".letterbox", { scaleY: 2.5, duration: 1.8, ease: "expo.inOut", delay: 0.2 });
    }, overlay);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrap} className="relative h-[280vh]" aria-label="Pixels by Vinay Kapoor">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {mode === "3d" ? (
          <HeroScene images={photos.map((p) => p.sm)} progress={progress} />
        ) : (
          <div className="absolute inset-0">
            {photos[0] && (
              <Image src={photos[0].src} alt="" fill priority sizes="100vw" placeholder="blur" blurDataURL={photos[0].blur} className="object-cover opacity-50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/30 to-ink" />
          </div>
        )}

        {/* letterbox bars */}
        <div className="letterbox pointer-events-none absolute inset-x-0 top-0 h-[6vh] origin-top bg-ink" />
        <div className="letterbox pointer-events-none absolute inset-x-0 bottom-0 h-[6vh] origin-bottom bg-ink" />

        <div ref={overlay} className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-5 text-center will-change-transform">
          <div className="absolute left-1/2 top-1/2 -z-10 h-[70vh] w-[90vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(11,10,16,0.72),rgba(11,10,16,0.35)_60%,transparent)]" />
          <p className="hero-in eyebrow mb-6 !text-cream/80">
            <span className="font-deva text-sm normal-case tracking-normal text-rani">शुभ विवाह</span> · Faridabad · Est. by Vinay Kapoor
          </p>
          <div className="hero-logo relative h-[26vw] max-h-[300px] w-[78vw] max-w-[860px] md:h-[18vw]">
            <Image src="/brand/logo.png" alt="Pixels by Vinay Kapoor" fill priority sizes="(max-width:768px) 78vw, 860px" className="object-contain drop-shadow-[0_0_40px_rgba(226,54,127,0.35)]" />
          </div>
          <h1 className="hero-in display mt-6 max-w-[18ch] text-[9vw] md:text-[4.6vw]">
            Not your parents&apos; <em className="text-gradient">wedding photographers.</em>
          </h1>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-[8vh] flex items-end justify-between px-5 font-mono text-[10px] uppercase tracking-[0.25em] text-cream/60 md:px-10">
          <span className="hero-in">Luxury & intimate weddings</span>
          <span className="hero-in flex flex-col items-center gap-2">
            Scroll to enter
            <span className="h-10 w-px animate-pulse bg-gradient-to-b from-rani to-transparent" />
          </span>
          <span className="hero-in">Films · Photographs · Reels</span>
        </div>
      </div>
    </section>
  );
}
