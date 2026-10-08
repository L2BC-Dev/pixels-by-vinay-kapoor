"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Photo } from "@/content/shoots";
import { useInView } from "@/components/three/useInView";

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
  const inView = useInView(wrap);
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
          <HeroScene images={photos.map((p) => p.sm)} progress={progress} active={inView} />
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

        <div ref={overlay} className="pointer-events-none absolute inset-0 will-change-transform">
          {/* legibility: dim the scene overall, then a soft ink plate behind the logo and a heavy fade under the headline */}
          <div className="absolute inset-0 bg-ink/30" />
          <div className="absolute left-1/2 top-[44%] h-[52vh] w-[80vw] max-w-[900px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(11,10,16,0.82),rgba(11,10,16,0.45)_55%,transparent)]" />
          <div className="absolute inset-x-0 bottom-0 h-[55vh] bg-gradient-to-t from-ink via-ink/85 to-transparent" />

          {/* centre: the mark, alone, with room to breathe */}
          <div className="absolute inset-x-0 top-[44%] flex -translate-y-1/2 justify-center px-5">
            <div className="hero-logo relative h-[24vw] w-[64vw] max-h-[220px] max-w-[620px] md:h-[14vw]">
              <Image src="/brand/logo.png" alt="Pixels by Vinay Kapoor" fill priority sizes="(max-width:768px) 64vw, 620px" className="object-contain drop-shadow-[0_2px_24px_rgba(11,10,16,0.9)]" />
            </div>
          </div>

          {/* bottom: one clean statement + CTA */}
          <div className="absolute inset-x-0 bottom-[9vh] mx-auto flex max-w-[1600px] flex-col gap-8 px-5 md:flex-row md:items-end md:justify-between md:px-10">
            <div className="max-w-[640px]">
              <p className="hero-in eyebrow !text-cream/75">Wedding films &amp; photographs · Faridabad</p>
              <h1 className="hero-in display mt-4 text-[11vw] leading-[0.95] text-cream [text-shadow:0_2px_30px_rgba(11,10,16,0.8)] md:text-[4.4vw]">
                Not your parents&apos;
                <br />
                <em className="text-blush">wedding photographers.</em>
              </h1>
            </div>
            <div className="hero-in pointer-events-auto flex items-center gap-8">
              <span className="hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-cream/60 md:flex">
                <span className="h-px w-10 animate-pulse bg-cream/50" /> Scroll
              </span>
              <Link href="/book" data-cursor="Book" className="rounded-full bg-cream px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-rani hover:text-cream">
                Check your dates →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
