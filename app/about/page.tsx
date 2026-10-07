import type { Metadata } from "next";
import Link from "next/link";
import Mandala from "@/components/Mandala";
import { ArchPic, PageHeader, Pic } from "@/components/ui";
import { process, team } from "@/content/site";
import { shoots } from "@/content/shoots";

export const metadata: Metadata = {
  title: "About",
  description: "A young Gen Z crew of wedding photographers and filmmakers from Faridabad, led by Vinay Kapoor.",
};

const beliefs = [
  { t: "Feel first, frame second.", d: "We chase the moment, then make it beautiful — never the other way round." },
  { t: "Invisible at the pheras. Loud at the sangeet.", d: "We read the room like guests and move like a film unit." },
  { t: "Made for the feed and the family album.", d: "Reels your friends repost, prints your grandparents treasure." },
  { t: "One standard for every budget.", d: "A 100-guest wedding gets the same eye as a palace affair." },
];

export default function About() {
  const a = shoots[0]?.photos ?? [];
  const b = shoots[1]?.photos ?? [];
  return (
    <>
      <PageHeader eyebrow="About · हम" title={<>Young crew. <em className="text-gradient">Old soul.</em></>} hi="हम कौन हैं">
        Pixels is a Faridabad studio of Gen Z photographers, filmmakers and editors who grew up on cinema and Instagram — and fell in love with the beautiful madness of Indian weddings.
      </PageHeader>

      <section className="px-5 py-16 md:px-10">
        <div className="mx-auto grid max-w-[1600px] items-end gap-6 md:grid-cols-12">
          {a[8] && (
            <div className="relative aspect-[4/5] overflow-hidden md:col-span-5" data-reveal>
              <Pic p={a[8]} alt="Pixels wedding moment" sizes="(max-width:768px) 100vw, 40vw" />
            </div>
          )}
          {b[3] && <ArchPic p={b[3]} alt="Bride portrait by Pixels" className="aspect-[3/4] md:col-span-4 md:mb-24" sizes="(max-width:768px) 100vw, 33vw" />}
          <div className="md:col-span-3">
            <p className="text-lg text-cream-dim" data-reveal>
              We&apos;re not the &ldquo;stand here, smile there&rdquo; kind. We&apos;re the crew dancing in the baraat with a gimbal, catching your dadi&apos;s side-eye and your best friend&apos;s ugly cry.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-32 md:px-10">
        <Mandala className="pointer-events-none absolute -right-40 top-10 h-[600px] w-[600px] text-rani/[0.07]" />
        <div className="relative mx-auto max-w-[1600px]">
          <p className="eyebrow" data-reveal>What we believe</p>
          <div className="mt-12 grid gap-px bg-line md:grid-cols-2">
            {beliefs.map((x, i) => (
              <div key={x.t} className="bg-ink p-8 md:p-14" data-reveal data-delay={String((i % 2) * 0.1)}>
                <span className="font-mono text-xs text-saffron">0{i + 1}</span>
                <h3 className="display mt-4 text-4xl md:text-5xl">{x.t}</h3>
                <p className="mt-4 text-cream-dim">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-2 px-5 py-32 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="display text-6xl md:text-8xl" data-reveal>
              The <em className="text-gradient">crew.</em>
            </h2>
            <Link href="/founders" className="border-b border-rani pb-1 hover:text-rani" data-reveal>
              Meet the founder →
            </Link>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-5">
            {team.map((m, i) => {
              const p = shoots[i % shoots.length]?.photos[9 + i] ?? shoots[0].photos[i];
              return (
                <div key={i} data-reveal data-delay={String(i * 0.06)}>
                  <div className="arch-top relative aspect-[3/4] overflow-hidden bg-ink-3 grayscale transition-all duration-700 hover:grayscale-0">
                    {p && <Pic p={p} alt="" small sizes="20vw" />}
                  </div>
                  <p className="display mt-4 text-2xl">{m.name}</p>
                  <p className="text-sm text-cream-dim">{m.role}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-cream-dim">Team portraits coming soon</p>
        </div>
      </section>

      <section className="px-5 py-32 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <h2 className="display text-6xl md:text-8xl" data-reveal>
            From chai to <em className="text-gradient">forever.</em>
          </h2>
          <ol className="mt-16 space-y-0 border-t border-line">
            {process.map((s) => (
              <li key={s.n} className="grid gap-4 border-b border-line py-8 md:grid-cols-[120px_1fr_1.2fr] md:items-baseline" data-reveal>
                <span className="font-mono text-sm text-rani">{s.n}</span>
                <h3 className="display text-4xl">{s.title}</h3>
                <p className="text-cream-dim">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
