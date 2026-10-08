"use client";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Shoot } from "@/content/shoots";
import { ArchPic } from "@/components/ui";

gsap.registerPlugin(ScrollTrigger);

// Pinned horizontal "film strip" of featured weddings.
export default function ShowReel({ shoots }: { shoots: Shoot[] }) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // Layout effect so the pin is reverted before React detaches the DOM on route change.
  useLayoutEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || innerWidth < 768) return;
    const ctx = gsap.context(() => {
      const t = track.current!;
      gsap.to(t, {
        x: () => -(t.scrollWidth - innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${t.scrollWidth - innerWidth}`,
          scrub: 0.8,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
      gsap.utils.toArray<HTMLElement>(".reel-card").forEach((card, i) => {
        gsap.fromTo(card, { rotate: i % 2 ? 2 : -2 }, { rotate: i % 2 ? -2 : 2, ease: "none", scrollTrigger: { trigger: section.current, scrub: true, start: "top top", end: "+=2000" } });
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    // Extra wrapper: GSAP wraps the pinned <section> in a pin-spacer, so React must own a parent node it can remove.
    <div>
    <section ref={section} className="relative overflow-hidden bg-ink py-24 md:flex md:h-screen md:items-center md:py-0">
      <div ref={track} className="flex flex-col gap-16 px-5 md:w-max md:flex-row md:items-center md:gap-[6vw] md:px-[8vw]">
        <div className="md:w-[34vw] md:shrink-0">
          <p className="eyebrow">Recent stories · कहानियाँ</p>
          <h2 className="display mt-6 text-6xl md:text-[6vw]">
            Weddings that look like <em className="text-gradient">cinema.</em>
          </h2>
          <p className="mt-6 max-w-md text-cream-dim">
            Every couple gets a story, not a template. Scroll through a few of our favourite chapters.
          </p>
        </div>
        {shoots.map((s, i) => (
          <Link
            key={s.slug}
            href={`/portfolio/${s.slug}`}
            data-cursor="Watch"
            className="reel-card group relative block md:w-[26vw] md:shrink-0"
            style={{ marginTop: i % 2 ? "8vh" : 0 }}
          >
            <ArchPic p={s.photos[s.cover]} alt={s.title} className="aspect-[3/4] w-full" sizes="(max-width:768px) 90vw, 26vw" />
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <h3 className="display text-4xl">{s.title}</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-rani">{s.chapter}</span>
            </div>
            <p className="mt-1 text-sm text-cream-dim">{s.line}</p>
          </Link>
        ))}
        <Link href="/portfolio" className="display shrink-0 text-5xl text-cream-dim transition-colors hover:text-rani md:text-[4vw]">
          All stories →
        </Link>
      </div>
    </section>
    </div>
  );
}
