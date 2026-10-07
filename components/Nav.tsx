"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { nav } from "@/content/site";

function Timecode() {
  const [t, setT] = useState("00:00:00:00");
  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => {
      const ms = performance.now() - start;
      const f = Math.floor((ms / 1000) * 24) % 24;
      const s = Math.floor(ms / 1000);
      const p = (n: number) => String(n).padStart(2, "0");
      setT(`${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(f)}`);
    }, 1000 / 24);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{t}</span>;
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 40);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-ink/70 py-3 backdrop-blur-md" : "py-5"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-5 md:px-10">
          <Link href="/" aria-label="Pixels by Vinay Kapoor — home" className="relative h-9 w-[92px] shrink-0">
            <Image src="/brand/mark.png" alt="PBVK" fill sizes="92px" className="object-contain object-left" priority />
          </Link>

          <div className="hidden items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-cream-dim lg:flex">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-sindoor" />
            REC <Timecode />
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`group relative text-sm tracking-wide transition-colors ${
                  pathname.startsWith(n.href) ? "text-cream" : "text-cream-dim hover:text-cream"
                }`}
              >
                <span className="block transition-transform duration-300 group-hover:-translate-y-full group-hover:opacity-0">{n.label}</span>
                <span className="absolute inset-0 translate-y-full font-deva opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {n.hi}
                </span>
              </Link>
            ))}
            <Link
              href="/book"
              data-cursor="Book"
              className="rounded-full bg-rani px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream"
            >
              Check dates
            </Link>
          </nav>

          <button
            onClick={() => setOpen((o) => !o)}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className={`h-px w-6 bg-cream transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`h-px w-6 bg-cream transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-ink-2 px-6 pb-12 pt-28 md:hidden"
          >
            {[...nav, { href: "/book", label: "Check dates", hi: "तारीख़" }].map((n, i) => (
              <motion.div
                key={n.href}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="border-b border-line"
              >
                <Link href={n.href} className="flex items-baseline justify-between py-4">
                  <span className="display text-5xl">{n.label}</span>
                  <span className="font-deva text-lg text-rani">{n.hi}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
