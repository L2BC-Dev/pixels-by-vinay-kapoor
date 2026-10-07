import type { Metadata } from "next";
import Link from "next/link";
import Packages from "@/components/services/Packages";
import { Marquee, PageHeader, Pic } from "@/components/ui";
import { addons, packages } from "@/content/packages";
import { process } from "@/content/site";
import { shoots } from "@/content/shoots";

export const metadata: Metadata = {
  title: "Services & Packages",
  description: "Wedding photography and film packages for intimate and luxury weddings in Faridabad, Delhi NCR and destination India.",
};

const offerings = [
  { t: "Candid photography", d: "Unposed, emotional, editorial. The frames you'll frame." },
  { t: "Cinematic films", d: "Teasers, feature films and documentary edits, colour-graded like cinema." },
  { t: "Reels & same-day edits", d: "Vertical-first edits your guests are posting before the vidaai." },
  { t: "Pre-wedding stories", d: "Concept-led shoots — from Old Delhi lanes to Himalayan roads." },
  { t: "Drone & aerials", d: "The baraat from above. The venue like you've never seen it." },
  { t: "Heirloom albums", d: "Hand-finished albums made to outlive all of us." },
];

const faqs = [
  { q: "How early should we book?", a: "Peak wedding season (Oct–Feb) dates go 6–10 months ahead. Check live availability on our booking page." },
  { q: "Do you travel for destination weddings?", a: "Yes — anywhere in India and abroad. Travel and stay are quoted separately and transparently." },
  { q: "When do we get our photos and film?", a: "Sneak peeks within 72 hours, reels within a week, full gallery and films in 6–10 weeks." },
  { q: "Can we customise a package?", a: "Always. Every package is a starting point — mix in add-ons or tell us what you need." },
];

export default function Services() {
  const strip = shoots.flatMap((s) => s.photos.slice(5, 8));
  return (
    <>
      <PageHeader eyebrow="Services · सेवाएँ" title={<>Built for <em className="text-gradient">your</em> kind of wedding.</>} hi="सेवाएँ">
        Average-size or the big fat one — choose the scale, we bring the same obsession.
      </PageHeader>

      <section className="px-5 pb-32 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <Packages packages={packages} />
          <div className="mt-16 flex flex-wrap items-center justify-center gap-3" data-reveal>
            <span className="eyebrow mr-2">Add-ons</span>
            {addons.map((a) => (
              <span key={a} className="rounded-full border border-line px-4 py-2 text-sm text-cream-dim">
                + {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Marquee
        speed={70}
        items={strip.map((p) => (
          <div key={p.src} className="relative mx-2 h-[38vh] w-[28vh] overflow-hidden">
            <Pic p={p} alt="" small sizes="28vh" />
          </div>
        ))}
      />

      <section className="px-5 py-32 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <p className="eyebrow" data-reveal>What we do</p>
          <div className="mt-10 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((o, i) => (
              <div key={o.t} className="group border-b border-r border-line p-8 transition-colors hover:bg-ink-2 md:p-12" data-reveal data-delay={String((i % 3) * 0.08)}>
                <span className="font-mono text-xs text-rani">0{i + 1}</span>
                <h3 className="display mt-6 text-4xl transition-transform group-hover:translate-x-2">{o.t}</h3>
                <p className="mt-3 text-cream-dim">{o.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mehendi/25 px-5 py-32 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <h2 className="display text-6xl md:text-8xl" data-reveal>
            How it <em className="text-gradient">flows.</em>
          </h2>
          <ol className="mt-16 grid gap-10 md:grid-cols-5">
            {process.map((s) => (
              <li key={s.n} className="border-t border-cream/30 pt-6" data-reveal>
                <span className="font-mono text-xs text-saffron">{s.n}</span>
                <h3 className="display mt-3 text-3xl">{s.title}</h3>
                <p className="mt-3 text-sm text-cream-dim">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-32 md:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-16 md:grid-cols-[0.8fr_1.2fr]">
          <h2 className="display text-6xl" data-reveal>
            Questions, <em className="text-gradient">answered.</em>
          </h2>
          <div className="border-t border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-line py-6" data-reveal>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl">
                  {f.q}
                  <span className="text-rani transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-xl text-cream-dim">{f.a}</p>
              </details>
            ))}
            <Link href="/contact" className="mt-10 inline-block border-b border-rani pb-1 hover:text-rani">
              Something else? Talk to us →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
