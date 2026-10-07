"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { nav, site } from "@/content/site";
import Mandala from "./Mandala";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink-2 pt-24">
      <Mandala className="pointer-events-none absolute -right-40 -top-40 h-[640px] w-[640px] text-rani/10" />
      <div className="relative mx-auto max-w-[1600px] px-5 md:px-10">
        <p className="eyebrow">चलो, शुरू करते हैं — let&apos;s begin</p>
        <Link href="/book" data-cursor="Book" className="group mt-6 block">
          <h2 className="display text-[15vw] md:text-[11vw]">
            Your story, <em className="text-gradient">our frame.</em>
          </h2>
          <span className="mt-6 inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-cream-dim transition-colors group-hover:text-rani">
            Check available dates <span className="transition-transform group-hover:translate-x-2">→</span>
          </span>
        </Link>

        <div className="mt-24 grid gap-12 border-t border-line py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="relative h-24 w-64">
              <Image src="/brand/logo.png" alt={site.name} fill sizes="256px" className="object-contain object-left" />
            </div>
            <p className="mt-4 max-w-sm text-sm text-cream-dim">{site.tagline}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-dim">{site.serving}</p>
          </div>
          <div>
            <p className="eyebrow mb-4">Explore</p>
            <ul className="space-y-2">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-cream-dim hover:text-cream">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">Say namaste</p>
            <ul className="space-y-2 text-cream-dim">
              <li><a href={`https://wa.me/${site.whatsapp}`} className="hover:text-cream">WhatsApp</a></li>
              <li><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-cream">{site.phone}</a></li>
              <li><a href={`mailto:${site.email}`} className="hover:text-cream">{site.email}</a></li>
              <li><a href={site.instagram} target="_blank" rel="noreferrer" className="hover:text-cream">Instagram {site.instagramHandle}</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-2 border-t border-line py-6 font-mono text-[11px] uppercase tracking-[0.2em] text-cream-dim md:flex-row">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>Made in Faridabad with ♥ & chai</span>
        </div>
      </div>
    </footer>
  );
}
