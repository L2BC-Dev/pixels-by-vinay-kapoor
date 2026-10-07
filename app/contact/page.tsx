import type { Metadata } from "next";
import Link from "next/link";
import Mandala from "@/components/Mandala";
import { PageHeader } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to Pixels by Vinay Kapoor — wedding photographers & filmmakers in Faridabad, Delhi NCR.",
};

export default function Contact() {
  const channels = [
    { k: "WhatsApp", v: "Fastest reply", href: `https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Namaste Pixels! 🙏 We'd love to know more.")}`, hi: "संदेश" },
    { k: "Call", v: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}`, hi: "फ़ोन" },
    { k: "Email", v: site.email, href: `mailto:${site.email}`, hi: "ईमेल" },
    { k: "Instagram", v: site.instagramHandle, href: site.instagram, hi: "इंस्टा" },
  ];
  return (
    <>
      <PageHeader eyebrow="Contact · संपर्क" title={<>Say <em className="text-gradient">namaste.</em></>} hi="नमस्ते">
        Planning a wedding is a lot. Talking to us shouldn&apos;t be. Pick whichever way feels easiest — we reply fast.
      </PageHeader>

      <section className="px-5 pb-24 md:px-10">
        <div className="mx-auto max-w-[1600px] border-t border-line">
          {channels.map((c, i) => (
            <a
              key={c.k}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              data-cursor={c.k}
              className="group flex flex-col gap-2 border-b border-line py-8 transition-colors hover:bg-ink-2 md:flex-row md:items-baseline md:gap-10 md:px-6"
              data-reveal
              data-delay={String(i * 0.06)}
            >
              <span className="font-mono text-xs text-rani">0{i + 1}</span>
              <span className="display text-6xl transition-transform duration-500 group-hover:translate-x-4 md:text-8xl">{c.k}</span>
              <span className="font-deva text-2xl text-cream/25 transition-colors group-hover:text-rani">{c.hi}</span>
              <span className="text-cream-dim md:ml-auto">{c.v} ↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden px-5 pb-32 md:px-10">
        <Mandala className="pointer-events-none absolute -right-40 -top-20 h-[600px] w-[600px] text-rani/[0.06]" />
        <div className="relative mx-auto grid max-w-[1600px] gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div data-reveal>
            <p className="eyebrow">The studio</p>
            <p className="display mt-4 text-4xl">{site.address}</p>
            <p className="mt-4 text-cream-dim">{site.serving}</p>
            <p className="mt-2 text-cream-dim">Studio visits by appointment · Mon–Sat, 11am–8pm</p>
            <Link href="/book" className="mt-10 inline-block rounded-full bg-rani px-8 py-4 text-ink hover:bg-cream">
              Check available dates →
            </Link>
          </div>
          <div className="aspect-[16/10] overflow-hidden border border-line" data-reveal>
            <iframe
              title="Pixels studio location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(site.mapsQuery)}&output=embed`}
              className="h-full w-full grayscale invert-[0.92] hue-rotate-180"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
