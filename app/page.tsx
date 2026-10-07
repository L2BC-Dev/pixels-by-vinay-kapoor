import Link from "next/link";
import Hero from "@/components/home/Hero";
import ShowReel from "@/components/home/ShowReel";
import Chapters from "@/components/home/Chapters";
import Mandala from "@/components/Mandala";
import PromoFilm from "@/components/PromoFilm";
import { ArchPic, Marquee, Pic, Diya } from "@/components/ui";
import { featuredPhotos, shoots, promoFilm } from "@/content/shoots";
import { founder, testimonials } from "@/content/site";

export default function Home() {
  const nitika = shoots.find((s) => s.slug === "vishal-nitika") ?? shoots[0];
  // HeroScene treats the last image as the centred finale print.
  const finale = nitika.photos[nitika.cover];
  const hero = [...featuredPhotos(10).filter((p) => p !== finale).slice(0, 9), finale];
  const strip = featuredPhotos(14).slice(4);
  const byChapter = shoots.map((s) => s.photos[Math.min(s.photos.length - 1, 3)]);

  return (
    <>
      <Hero photos={hero} />

      {/* Manifesto */}
      <section className="relative overflow-hidden px-5 py-32 md:px-10 md:py-48">
        <div className="deva-outline pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw]" aria-hidden>
          शुभ विवाह
        </div>
        <div className="relative mx-auto max-w-[1300px]">
          <p className="eyebrow" data-reveal>The Pixels manifesto</p>
          <p className="display mt-8 text-[9vw] leading-[1.02] md:text-[5.2vw]" data-reveal data-delay="0.1">
            We&apos;re a crew of young storytellers who&nbsp;think in <em className="text-gradient">reels</em>, shoot like <em className="text-gradient">cinema</em> and edit for the{" "}
            <em className="text-gradient">next fifty years.</em>
          </p>
          <div className="mt-14 grid gap-10 text-cream-dim md:grid-cols-3" data-reveal data-delay="0.2">
            <p>No stiff poses. No &ldquo;look here, smile&rdquo;. Just you, your people and the madness of an Indian wedding — captured honestly.</p>
            <p>Luxury palace weddings or a hundred-guest courtyard affair — the same obsessive eye, the same crew, the same care.</p>
            <p>Led by Vinay Kapoor, trusted on sets where there are no retakes — from national leaders to India&apos;s biggest celebrations.</p>
          </div>
        </div>
      </section>

      {/* Photo marquee */}
      <Marquee
        speed={60}
        className="py-6"
        items={strip.map((p, i) => (
          <div key={p.src} className={`relative mx-3 overflow-hidden ${i % 2 ? "arch-top h-[44vh] w-[30vh]" : "h-[36vh] w-[52vh] rounded-sm"}`}>
            <Pic p={p} alt="Wedding moment by Pixels" small sizes="50vh" />
          </div>
        ))}
      />
      <Marquee
        speed={30}
        className="border-y border-line py-5"
        items={["Haldi", "हल्दी", "Mehendi", "मेहंदी", "Sangeet", "संगीत", "Baraat", "बारात", "Pheras", "फेरे", "Vidaai", "विदाई"].map((w, i) => (
          <span key={w + i} className={`mx-8 flex items-center gap-8 ${i % 2 ? "font-deva text-4xl text-rani" : "display text-5xl"}`}>
            {w}
            <Diya className="h-6 w-6" />
          </span>
        ))}
      />

      <ShowReel shoots={shoots} />

      <Chapters photos={byChapter} />

      {/* Founder teaser */}
      <section className="relative overflow-hidden bg-mehendi/25 px-5 py-32 md:px-10">
        <Mandala className="pointer-events-none absolute -left-60 top-1/2 h-[720px] w-[720px] -translate-y-1/2 text-cream/[0.06]" />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-16 md:grid-cols-2">
          <ArchPic p={nitika.photos[4] ?? nitika.photos[0]} alt="Work by Vinay Kapoor" className="mx-auto aspect-[3/4] w-full max-w-[460px]" />
          <div>
            <p className="eyebrow" data-reveal>The eye behind Pixels</p>
            <h2 className="display mt-6 text-6xl md:text-8xl" data-reveal>
              {founder.name}
            </h2>
            <p className="mt-8 text-lg text-cream-dim" data-reveal>
              {founder.bio[1]}
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6" data-reveal>
              {founder.stats.slice(0, 2).map((s) => (
                <div key={s.label} className="border-t border-line pt-4">
                  <div className="display text-5xl text-rani">{s.value}</div>
                  <div className="mt-1 text-sm text-cream-dim">{s.label}</div>
                </div>
              ))}
            </div>
            <Link href="/founders" className="mt-10 inline-flex items-center gap-3 border-b border-rani pb-1 text-cream hover:text-rani" data-reveal>
              Meet Vinay →
            </Link>
          </div>
        </div>
      </section>

      {/* Services teaser */}
      <section className="px-5 py-32 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <p className="eyebrow" data-reveal>Two scales. One standard.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              { t: "Intimate", hi: "अपनापन", d: "Courtyard weddings, 100 guests, every face in focus. Average-size weddings with full-scale storytelling.", p: shoots[2]?.photos[2] },
              { t: "Luxury", hi: "शाही", d: "Palace venues, multi-day celebrations, multi-cam film crew, drones and same-day edits.", p: shoots[0]?.photos[10] },
            ].map((c) =>
              c.p ? (
                <Link key={c.t} href="/services" data-cursor="Explore" className="group relative block h-[70vh] overflow-hidden" data-reveal>
                  <Pic p={c.p} alt={`${c.t} weddings`} sizes="(max-width:768px) 100vw, 50vw" className="transition-transform duration-[1.6s] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
                    <span className="font-deva text-3xl text-rani">{c.hi}</span>
                    <h3 className="display text-7xl md:text-8xl">{c.t}</h3>
                    <p className="mt-3 max-w-md text-cream-dim">{c.d}</p>
                  </div>
                </Link>
              ) : null,
            )}
          </div>
        </div>
      </section>

      {/* Promo film */}
      <section className="px-5 pb-32 md:px-10">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex items-end justify-between gap-6">
            <h2 className="display text-5xl md:text-7xl" data-reveal>
              Press <em className="text-gradient">play</em>.
            </h2>
            <p className="eyebrow" data-reveal>{promoFilm.title}</p>
          </div>
          <div className="mt-10">
            <PromoFilm />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-line px-5 py-32 md:px-10">
        <div className="mx-auto grid max-w-[1600px] gap-12 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure key={t.by} data-reveal data-delay={String(i * 0.1)}>
              <span className="display text-8xl leading-none text-rani">&ldquo;</span>
              <blockquote className="display -mt-6 text-3xl italic leading-tight">{t.quote}</blockquote>
              <figcaption className="eyebrow mt-6">— {t.by}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
