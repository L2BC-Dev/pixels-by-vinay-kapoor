"use client";
import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/content/shoots";

const chapters = [
  { en: "Haldi", hi: "हल्दी", note: "Turmeric, chaos, and the first happy tears." },
  { en: "Mehendi", hi: "मेहंदी", note: "Slow afternoons, stained hands, loud cousins." },
  { en: "Sangeet", hi: "संगीत", note: "Choreographed by family. Ruined by uncles. Perfect." },
  { en: "Pheras", hi: "फेरे", note: "Seven rounds. A thousand frames. One forever." },
  { en: "Vidaai", hi: "विदाई", note: "The goodbye nobody is ever ready for." },
];

// Hover list: the image follows which wedding ritual you're on.
export default function Chapters({ photos }: { photos: Photo[] }) {
  const [i, setI] = useState(0);
  return (
    <section className="relative px-5 py-32 md:px-10">
      <div className="mx-auto grid max-w-[1600px] gap-16 md:grid-cols-[1fr_0.8fr] md:items-center">
        <div>
          <p className="eyebrow" data-reveal>Every chapter, covered</p>
          <ul className="mt-10 border-t border-line">
            {chapters.map((c, n) => (
              <li key={c.en} className="border-b border-line" onMouseEnter={() => setI(n)} onFocus={() => setI(n)}>
                <button className="group flex w-full items-baseline gap-6 py-6 text-left" onClick={() => setI(n)} data-cursor={c.hi}>
                  <span className="font-mono text-xs text-cream-dim">0{n + 1}</span>
                  <span className={`display text-5xl transition-all duration-500 md:text-7xl ${i === n ? "translate-x-3 text-cream" : "text-cream/35"}`}>
                    {c.en}
                  </span>
                  <span className={`font-deva text-2xl transition-colors md:text-3xl ${i === n ? "text-rani" : "text-cream/20"}`}>{c.hi}</span>
                  <span className={`ml-auto hidden max-w-[22ch] text-right text-sm text-cream-dim transition-opacity lg:block ${i === n ? "opacity-100" : "opacity-0"}`}>
                    {c.note}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[460px]">
          <div className="jharokha absolute inset-0 translate-x-4 -translate-y-4 border border-rani bg-sindoor/20" aria-hidden />
          <div className="jharokha relative h-full w-full overflow-hidden bg-ink-3">
            {photos.slice(0, chapters.length).map((p, n) => (
              <Image
                key={p.src}
                src={p.src}
                alt={chapters[n].en}
                fill
                sizes="(max-width:768px) 90vw, 460px"
                placeholder="blur"
                blurDataURL={p.blur}
                className={`object-cover transition-all duration-[1.2s] ease-out ${i === n ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
