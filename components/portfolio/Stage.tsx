"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/components/three/useInView";
import type { GalleryItem } from "@/components/three/CurvedGallery";

const CurvedGallery = dynamic(() => import("@/components/three/CurvedGallery"), { ssr: false });

export default function Stage({ items }: { items: GalleryItem[] }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const [focus, setFocus] = useState(0);
  const section = useRef<HTMLElement>(null);
  const inView = useInView(section);
  useEffect(() => {
    setOk(!matchMedia("(prefers-reduced-motion: reduce)").matches && !!document.createElement("canvas").getContext("webgl2"));
  }, []);
  if (ok === false) return null;
  const f = items[focus];
  return (
    <section ref={section} className="relative h-[85svh] w-full select-none" data-cursor="Drag">
      {ok && <CurvedGallery items={items} onFocus={setFocus} active={inView} />}
      <div className="pointer-events-none absolute inset-x-0 bottom-10 flex flex-col items-center text-center">
        <p className="eyebrow">Drag to explore · click to open</p>
        <p key={f?.title} className="display mt-3 animate-[fadeUp_.6s_ease] text-4xl md:text-6xl">
          {f?.title}
        </p>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}
