"use client";
import { useMemo, useState } from "react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
// Peak Indian wedding season (Oct–Feb), highlighted as high-demand.
const PEAK = new Set([0, 1, 9, 10, 11]);

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function Calendar({
  booked,
  selected,
  onToggle,
  allowPast = false,
  bookedSelectable = false,
}: {
  booked: Set<string>;
  selected: Set<string>;
  onToggle: (date: string) => void;
  allowPast?: boolean;
  bookedSelectable?: boolean;
}) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const cells = useMemo(() => {
    const first = new Date(cursor);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))];
  }, [cursor]);

  const canPrev = allowPast || cursor > new Date(today.getFullYear(), today.getMonth(), 1);
  const shift = (n: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + n, 1));
  const peak = PEAK.has(cursor.getMonth());

  return (
    <div className="border border-line bg-ink-2 p-5 md:p-8">
      <div className="flex items-center justify-between">
        <button onClick={() => shift(-1)} disabled={!canPrev} className="h-10 w-10 rounded-full border border-line text-cream-dim transition-colors hover:border-rani hover:text-rani disabled:opacity-20" aria-label="Previous month">
          ←
        </button>
        <div className="text-center">
          <p className="display text-4xl" aria-live="polite">
            {MONTHS[cursor.getMonth()]} <span className="text-cream-dim">{cursor.getFullYear()}</span>
          </p>
          {peak && <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-saffron">शुभ मुहूर्त · peak season — book early</p>}
        </div>
        <button onClick={() => shift(1)} className="h-10 w-10 rounded-full border border-line text-cream-dim transition-colors hover:border-rani hover:text-rani" aria-label="Next month">
          →
        </button>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1.5 text-center">
        {DAYS.map((d) => (
          <div key={d} className="pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cream-dim">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const key = iso(d);
          const past = d < today;
          const isBooked = booked.has(key);
          const isSel = selected.has(key);
          const disabled = (!allowPast && past) || (isBooked && !bookedSelectable);
          return (
            <button
              key={key}
              type="button"
              onClick={() => !disabled && onToggle(key)}
              aria-disabled={disabled}
              aria-pressed={isSel}
              aria-label={`${d.getDate()} ${MONTHS[d.getMonth()]}${isBooked ? ", booked" : ""}`}
              className={`day-btn relative aspect-square rounded-md text-sm transition-all md:text-base ${
                isSel
                  ? "scale-105 bg-rani font-medium text-ink"
                  : isBooked
                    ? "bg-sindoor/15 text-cream/30"
                    : past
                      ? "text-cream/15"
                      : "text-cream hover:bg-ink-3 hover:ring-1 hover:ring-rani/60"
              } ${disabled ? "cursor-not-allowed" : ""}`}
            >
              {d.getDate()}
              {isBooked && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-sindoor" />}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-5 font-mono text-[10px] uppercase tracking-[0.18em] text-cream-dim">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-rani" /> Your dates</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-sindoor/40" /> Booked</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm ring-1 ring-line" /> Available</span>
      </div>
    </div>
  );
}
