import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Gallery from "@/components/portfolio/Gallery";
import { getShoot, shoots } from "@/content/shoots";

export function generateStaticParams() {
  return shoots.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = getShoot((await params).slug);
  if (!s) return {};
  return { title: s.title, description: `${s.title} — ${s.line} Wedding photography by Pixels by Vinay Kapoor.`, openGraph: { images: [s.photos[s.cover].src] } };
}

export default async function ShootPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = getShoot((await params).slug);
  if (!s) notFound();
  const idx = shoots.indexOf(s);
  const next = shoots[(idx + 1) % shoots.length];
  const cover = s.photos[s.cover];

  return (
    <>
      <section className="relative h-[100svh] overflow-hidden">
        <Image src={cover.src} alt={s.title} fill priority sizes="100vw" placeholder="blur" blurDataURL={cover.blur} className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-16 md:px-10">
          <div className="mx-auto max-w-[1600px]">
            <p className="eyebrow !text-cream/80" data-reveal>
              {s.chapter} · {s.place} · {s.photos.length} frames
            </p>
            <h1 className="display mt-4 text-[16vw] md:text-[10vw]" data-reveal data-delay="0.1">
              {s.title}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-cream/80" data-reveal data-delay="0.2">
              {s.line}
            </p>
          </div>
        </div>
      </section>

      <section className="px-3 py-20 md:px-8">
        <div className="mx-auto max-w-[1700px]">
          <Gallery photos={s.photos} title={s.title} />
        </div>
      </section>

      <Link href={`/portfolio/${next.slug}`} data-cursor="Next" className="group relative block h-[70vh] overflow-hidden">
        <Image src={next.photos[next.cover].src} alt={next.title} fill sizes="100vw" className="object-cover opacity-40 transition-all duration-[1.4s] group-hover:scale-105 group-hover:opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="eyebrow">Next story</p>
          <p className="display mt-4 text-[12vw] md:text-[8vw]">{next.title}</p>
        </div>
      </Link>
    </>
  );
}
