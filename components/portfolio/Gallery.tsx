"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Photo } from "@/content/shoots";
import { getLenis } from "@/components/SmoothScroll";

// Masonry gallery with a cinematic full-screen lightbox (arrows, swipe, Esc).
export default function Gallery({ photos, title }: { photos: Photo[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const go = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    getLenis()?.stop();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", key);
    return () => {
      removeEventListener("keydown", key);
      getLenis()?.start();
    };
  }, [open, go]);

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {photos.map((p, i) => (
          <button key={p.src} onClick={() => setOpen(i)} data-cursor="View" className="group relative block w-full overflow-hidden" aria-label={`Open photo ${i + 1}`}>
            <Image
              src={p.sm}
              alt={`${title} — frame ${i + 1}`}
              width={p.w}
              height={p.h}
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={p.blur}
              className="h-auto w-full transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
            />
            <span className="absolute left-3 top-3 font-mono text-[10px] tracking-[0.2em] text-cream/0 transition-colors group-hover:text-cream/80">
              {String(i + 1).padStart(3, "0")}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal
          >
            <motion.div
              key={open}
              className="relative h-[86vh] w-[92vw]"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, i) => (i.offset.x < -80 ? go(1) : i.offset.x > 80 ? go(-1) : null)}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={photos[open].src} alt={`${title} — frame ${open + 1}`} fill sizes="92vw" className="object-contain" placeholder="blur" blurDataURL={photos[open].blur} />
            </motion.div>
            <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-8 font-mono text-xs tracking-[0.2em] text-cream-dim">
              <button onClick={(e) => (e.stopPropagation(), go(-1))} className="px-3 py-2 hover:text-rani" aria-label="Previous">← PREV</button>
              <span className="tabular-nums">{String(open + 1).padStart(3, "0")} / {String(photos.length).padStart(3, "0")}</span>
              <button onClick={(e) => (e.stopPropagation(), go(1))} className="px-3 py-2 hover:text-rani" aria-label="Next">NEXT →</button>
            </div>
            <button onClick={() => setOpen(null)} className="absolute right-5 top-5 font-mono text-xs tracking-[0.2em] text-cream-dim hover:text-rani" aria-label="Close">
              CLOSE ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
