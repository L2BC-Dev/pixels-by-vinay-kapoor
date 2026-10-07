import type { Metadata } from "next";
import Link from "next/link";
import Stage from "@/components/portfolio/Stage";
import PromoFilm from "@/components/PromoFilm";
import { ArchPic, PageHeader } from "@/components/ui";
import { shoots, promoFilm } from "@/content/shoots";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Wedding stories by Pixels — cinematic candid photography and films from Faridabad, Delhi NCR and across India.",
};

export default function Portfolio() {
  const items = shoots.flatMap((s) =>
    [0, 3, 7].map((i) => s.photos[i]).filter(Boolean).map((p) => ({ src: p.sm, w: p.w, h: p.h, href: `/portfolio/${s.slug}`, title: s.title })),
  );

  return (
    <>
      <PageHeader eyebrow="Portfolio · कहानियाँ" title={<>Stories, <em className="text-gradient">not shoots.</em></>} hi="कहानियाँ">
        Every frame here belonged to someone&apos;s best day. Spin the mandap, pick a story, step inside.
      </PageHeader>

      <Stage items={items} />

      <section className="px-5 py-24 md:px-10">
        <div className="mx-auto grid max-w-[1600px] gap-x-10 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
          {shoots.map((s, i) => (
            <Link key={s.slug} href={`/portfolio/${s.slug}`} data-cursor="Open" className={`group block ${i % 3 === 1 ? "lg:mt-24" : ""}`} data-reveal>
              <ArchPic p={s.photos[s.cover]} alt={s.title} small className="aspect-[3/4] w-full" sizes="(max-width:768px) 90vw, 33vw" />
              <div className="mt-6 flex items-baseline justify-between">
                <h2 className="display text-4xl md:text-5xl">{s.title}</h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream-dim">{s.photos.length} frames</span>
              </div>
              <p className="mt-2 text-cream-dim">
                <span className="text-rani">{s.chapter}</span> · {s.place} — {s.line}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 pb-32 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <p className="eyebrow" data-reveal>Film · फ़िल्म</p>
          <h2 className="display mt-4 text-5xl md:text-7xl" data-reveal>{promoFilm.title}</h2>
          <div className="mt-10">
            <PromoFilm />
          </div>
        </div>
      </section>
    </>
  );
}
