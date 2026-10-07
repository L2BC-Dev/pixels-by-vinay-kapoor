import type { Metadata } from "next";
import Link from "next/link";
import LensHero from "@/components/founders/LensHero";
import Mandala from "@/components/Mandala";
import { Marquee, Pic } from "@/components/ui";
import { founder } from "@/content/site";
import { shoots } from "@/content/shoots";

export const metadata: Metadata = {
  title: "Founder — Vinay Kapoor",
  description: "Vinay Kapoor, founder of Pixels — the cinematographer trusted by India's leading public figures and biggest weddings.",
};

export default function Founders() {
  const work = shoots.flatMap((s) => s.photos.slice(12, 15));
  return (
    <>
      <LensHero portrait={founder.portrait} name={founder.name} role={founder.role} />

      <section className="relative overflow-hidden px-5 py-32 md:px-10">
        <Mandala className="pointer-events-none absolute -left-52 top-0 h-[640px] w-[640px] text-saffron/[0.07]" />
        <div className="relative mx-auto grid max-w-[1400px] gap-16 md:grid-cols-[0.9fr_1.1fr]">
          <h2 className="display text-5xl md:text-7xl" data-reveal>
            Trusted where there are <em className="text-gradient">no retakes.</em>
          </h2>
          <div className="space-y-6 text-lg text-cream-dim">
            {founder.bio.map((p, i) => (
              <p key={i} data-reveal data-delay={String(i * 0.08)}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-10 md:grid-cols-4">
          {founder.stats.map((s, i) => (
            <div key={s.label} data-reveal data-delay={String(i * 0.08)}>
              <div className="display text-7xl text-rani md:text-8xl">{s.value}</div>
              <div className="mt-2 text-cream-dim">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-32 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <p className="eyebrow" data-reveal>On the record</p>
          <ul className="mt-10 border-t border-line">
            {founder.credentials.map((c, i) => (
              <li key={c} className="flex items-baseline gap-6 border-b border-line py-7" data-reveal>
                <span className="font-mono text-xs text-saffron">0{i + 1}</span>
                <span className="display text-3xl md:text-5xl">{c}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-xl text-sm text-cream-dim">
            Discretion is part of the job. Many of Vinay&apos;s highest-profile assignments stay off the public portfolio — ask us in person.
          </p>
        </div>
      </section>

      <Marquee
        speed={55}
        className="pb-32"
        items={work.map((p, i) => (
          <div key={p.src} className={`relative mx-3 overflow-hidden ${i % 2 ? "arch-top h-[48vh] w-[34vh]" : "h-[40vh] w-[56vh]"}`}>
            <Pic p={p} alt="" small sizes="56vh" />
          </div>
        ))}
      />

      <section className="px-5 pb-32 text-center md:px-10">
        <p className="display mx-auto max-w-4xl text-4xl italic md:text-6xl" data-reveal>
          &ldquo;I don&apos;t want you to remember the camera. I want you to remember the day.&rdquo;
        </p>
        {/* TODO(client): replace with a real quote from Vinay */}
        <p className="eyebrow mt-8" data-reveal>— The Pixels way</p>
        <Link href="/book" className="mt-12 inline-block rounded-full bg-rani px-8 py-4 text-ink transition-colors hover:bg-cream" data-reveal>
          Work with Vinay →
        </Link>
      </section>
    </>
  );
}
