"use client";
import { useState } from "react";
import { promoFilm } from "@/content/shoots";

// Muted teaser loop; clicking swaps in the full film player.
export default function PromoFilm() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden border border-line bg-ink-3" data-reveal>
      {playing ? (
        <iframe src={promoFilm.embed} title={promoFilm.title} allow="autoplay; fullscreen" allowFullScreen className="absolute inset-0 h-full w-full" />
      ) : (
        <button onClick={() => setPlaying(true)} data-cursor="Play" className="group absolute inset-0 block h-full w-full" aria-label={`Play ${promoFilm.title}`}>
          <video src={promoFilm.teaser} poster={promoFilm.poster} autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/20" />
          <span className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cream/40 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-rani group-hover:bg-rani/20 md:h-32 md:w-32">
            <span className="ml-1.5 h-0 w-0 border-y-[12px] border-l-[20px] border-y-transparent border-l-cream" />
          </span>
          <span className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.25em] text-cream/80">● Watch the full film</span>
        </button>
      )}
    </div>
  );
}
