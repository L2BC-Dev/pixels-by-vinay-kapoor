"use client";
import { motion } from "framer-motion";

// Shutter-wipe page transition: two ink blades open on every route change.
export default function Template({ children }: { children: React.ReactNode }) {
  const ease = [0.76, 0, 0.24, 1] as const;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[65] h-1/2 origin-top bg-ink-2"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.1 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[65] h-1/2 origin-bottom bg-ink-2"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.1 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-1/2 z-[66] h-px bg-rani"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
        transition={{ duration: 0.8, times: [0, 0.4, 1] }}
      />
      {children}
    </>
  );
}
