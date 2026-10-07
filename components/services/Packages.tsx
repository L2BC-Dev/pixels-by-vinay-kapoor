"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Package } from "@/content/packages";

export default function Packages({ packages }: { packages: Package[] }) {
  const [scale, setScale] = useState<Package["scale"]>("intimate");
  const shown = packages.filter((p) => p.scale === scale);

  return (
    <div>
      <div className="mx-auto flex w-fit rounded-full border border-line p-1.5" role="tablist" aria-label="Wedding scale">
        {(["intimate", "luxury"] as const).map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={scale === s}
            onClick={() => setScale(s)}
            className={`relative rounded-full px-6 py-3 text-sm capitalize transition-colors md:px-10 ${scale === s ? "text-ink" : "text-cream-dim hover:text-cream"}`}
          >
            {scale === s && <motion.span layoutId="pill" className="absolute inset-0 rounded-full bg-rani" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
            <span className="relative whitespace-nowrap">
              {s === "intimate" ? "Intimate" : "Luxury"}
              <span className="hidden sm:inline">{s === "intimate" ? " & mid-size" : " & destination"}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <motion.article
              key={p.id}
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}
              className={`group relative flex flex-col overflow-hidden border p-8 md:p-12 ${p.featured ? "border-rani/60 bg-gradient-to-br from-sindoor/25 via-ink-2 to-ink-2" : "border-line bg-ink-2"}`}
            >
              <span className="deva-outline pointer-events-none absolute -right-4 -top-6 text-[9rem] md:text-[12rem]" aria-hidden>
                {p.hi}
              </span>
              {p.featured && <span className="eyebrow absolute right-6 top-6 !text-rani">Most loved</span>}
              <span className="font-deva text-2xl text-rani">{p.hi}</span>
              <h3 className="display mt-2 text-6xl">{p.name}</h3>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-cream-dim">{p.days}</p>
              <p className="mt-6 max-w-md text-cream-dim">{p.blurb}</p>
              <ul className="mt-8 space-y-3">
                {p.includes.map((x) => (
                  <li key={x} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rotate-45 bg-saffron" />
                    {x}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex items-end justify-between gap-4 pt-12">
                <div>
                  <p className="eyebrow">Investment</p>
                  <p className="display mt-1 text-4xl">{p.price}</p>
                </div>
                <Link href={`/book?package=${p.id}`} data-cursor="Book" className="rounded-full border border-cream/30 px-6 py-3 text-sm transition-colors hover:border-rani hover:bg-rani hover:text-ink">
                  Check dates →
                </Link>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
