"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const LensScene = dynamic(() => import("@/components/three/LensScene"), { ssr: false });

export default function LensHero({ portrait, name, role }: { portrait: string; name: string; role: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    setOk(!matchMedia("(prefers-reduced-motion: reduce)").matches && !!document.createElement("canvas").getContext("webgl2"));
    let raf = 0;
    const loop = () => {
      const r = wrap.current?.getBoundingClientRect();
      if (r) progress.current = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={wrap} className="relative h-[200vh]">
      <div className="sticky top-0 grid h-[100svh] overflow-hidden md:grid-cols-2">
        <div className="deva-outline pointer-events-none absolute bottom-0 left-0 text-[30vw] md:text-[20vw]" aria-hidden>
          दृष्टि
        </div>
        <div className="relative z-10 flex flex-col justify-end px-5 pb-16 pt-32 md:justify-center md:px-10 md:pb-0">
          <p className="eyebrow" data-reveal>Founder · संस्थापक</p>
          <h1 className="display mt-6 text-[19vw] md:text-[9vw]" data-reveal data-delay="0.1">
            {name.split(" ")[0]}
            <br />
            <em className="text-gradient">{name.split(" ").slice(1).join(" ")}</em>
          </h1>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-cream-dim" data-reveal data-delay="0.2">
            {role}
          </p>
        </div>
        <div className="absolute inset-0 md:relative">
          {ok ? (
            <LensScene portrait={portrait} progress={progress} />
          ) : ok === false ? (
            <div className="jharokha relative mx-auto mt-32 aspect-[3/4] w-[70%] overflow-hidden opacity-60 md:opacity-100">
              <Image src={portrait} alt={name} fill sizes="50vw" className="object-cover" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
