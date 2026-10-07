import Image from "next/image";
import type { Photo } from "@/content/shoots";

export function Pic({
  p,
  alt,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className = "",
  priority = false,
  small = false,
}: {
  p: Photo;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  small?: boolean;
}) {
  return (
    <Image
      src={small ? p.sm : p.src}
      alt={alt}
      width={p.w}
      height={p.h}
      sizes={sizes}
      placeholder="blur"
      blurDataURL={p.blur}
      priority={priority}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

// A photo framed in a cusped jharokha arch, with a thin offset outline.
export function ArchPic({ p, alt, className = "", sizes, small }: { p: Photo; alt: string; className?: string; sizes?: string; small?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      <div className="jharokha absolute inset-0 translate-x-3 -translate-y-3 bg-rani/25" aria-hidden />
      <div className="jharokha relative h-full w-full overflow-hidden">
        <Pic p={p} alt={alt} sizes={sizes} small={small} className="transition-transform duration-[1.6s] ease-out group-hover:scale-105" />
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, hi, children }: { eyebrow: string; title: React.ReactNode; hi: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-40 md:px-10 md:pt-48">
      <div className="deva-outline pointer-events-none absolute -top-4 left-0 text-[34vw] md:text-[24vw]" aria-hidden>
        {hi}
      </div>
      <div className="relative mx-auto max-w-[1600px]">
        <p className="eyebrow" data-reveal>
          {eyebrow}
        </p>
        <h1 className="display mt-6 max-w-[14ch] text-[15vw] md:text-[8.5vw]" data-reveal data-delay="0.1">
          {title}
        </h1>
        {children && (
          <div className="mt-8 max-w-xl text-lg text-cream-dim" data-reveal data-delay="0.2">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export function Marquee({ items, speed = 40, className = "" }: { items: React.ReactNode[]; speed?: number; className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee" style={{ ["--marquee-speed" as string]: `${speed}s` }}>
        {[...items, ...items].map((it, i) => (
          <div key={i} className="shrink-0">
            {it}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Diya({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M20 4c3 6 5 9 5 13a5 5 0 0 1-10 0c0-4 2-7 5-13Z" fill="var(--saffron)" />
      <path d="M4 24h32c-2 8-9 12-16 12S6 32 4 24Z" fill="var(--sindoor)" />
    </svg>
  );
}
