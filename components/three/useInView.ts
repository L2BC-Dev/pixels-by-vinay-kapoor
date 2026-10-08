"use client";
import { useEffect, useState, type RefObject } from "react";

// True while the element is on screen; used to pause WebGL render loops when scrolled away.
export function useInView(ref: RefObject<Element | null>, margin = "100px") {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}
