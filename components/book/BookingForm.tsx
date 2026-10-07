"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Calendar from "./Calendar";
import { packages } from "@/content/packages";
import { site } from "@/content/site";

const pretty = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function BookingForm() {
  const params = useSearchParams();
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pkg, setPkg] = useState(params.get("package") ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ names: "", phone: "", email: "", city: "", guests: "", message: "", website: "" });

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((d) => setBooked(new Set(d.dates ?? [])))
      .catch(() => {});
  }, []);

  const dates = useMemo(() => [...selected].sort(), [selected]);
  const toggle = (d: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(d)) n.delete(d);
      else if (n.size < 7) n.add(d);
      return n;
    });

  const pkgName = packages.find((p) => p.id === pkg)?.name ?? "Not sure yet";
  const waText = encodeURIComponent(
    `Namaste Pixels! 🙏\nWe're ${form.names || "—"} and would love to book you.\nDates: ${dates.map(pretty).join(", ") || "—"}\nCity/venue: ${form.city || "—"}\nPackage: ${pkgName}\nGuests: ${form.guests || "—"}\n${form.message}`,
  );
  const waLink = `https://wa.me/${site.whatsapp}?text=${waText}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!dates.length) {
      setError("Pick at least one date on the calendar.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dates, package: pkgName }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res || !res.ok) {
      setError(data.error ?? "Something went wrong — please WhatsApp us.");
      setStatus("error");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl border border-rani/50 bg-ink-2 p-10 text-center md:p-16">
        <p className="font-deva text-4xl text-rani">धन्यवाद</p>
        <h2 className="display mt-4 text-6xl">Your dates are pencilled in.</h2>
        <p className="mt-6 text-cream-dim">
          We&apos;ve received your enquiry for {dates.map(pretty).join(", ")}. Our team will call you within 24 hours. Dates are confirmed once the token advance is received.
        </p>
        <a href={waLink} target="_blank" rel="noreferrer" className="mt-10 inline-block rounded-full bg-rani px-8 py-4 text-ink hover:bg-cream">
          Continue on WhatsApp →
        </a>
      </motion.div>
    );
  }

  const field = "w-full border-b border-line bg-transparent py-3 text-lg outline-none transition-colors placeholder:text-cream/25 focus:border-rani";

  return (
    <form onSubmit={submit} className="grid gap-12 lg:grid-cols-[1.05fr_1fr]">
      <div>
        <p className="eyebrow mb-4">01 · Pick your dates (multi-day welcome)</p>
        <Calendar booked={booked} selected={selected} onToggle={toggle} />
        {dates.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {dates.map((d) => (
              <button key={d} type="button" onClick={() => toggle(d)} className="rounded-full border border-rani/50 px-3 py-1 text-sm text-rani hover:bg-rani hover:text-ink">
                {pretty(d)} ✕
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-8">
        <p className="eyebrow">02 · Tell us about you</p>
        <input className={field} required placeholder="Your names (e.g. Riya & Arjun)" value={form.names} onChange={(e) => setForm({ ...form, names: e.target.value })} />
        <div className="grid gap-8 sm:grid-cols-2">
          <input className={field} required type="tel" inputMode="tel" placeholder="Phone / WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className={field} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <input className={field} placeholder="City / venue" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className={field} placeholder="Approx. guests" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} />
        </div>
        <div>
          <p className="eyebrow mb-3">Package</p>
          <div className="flex flex-wrap gap-2">
            {[...packages.map((p) => ({ id: p.id, name: p.name })), { id: "", name: "Not sure yet" }].map((p) => (
              <button
                key={p.id || "none"}
                type="button"
                onClick={() => setPkg(p.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${pkg === p.id ? "border-rani bg-rani text-ink" : "border-line text-cream-dim hover:text-cream"}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <textarea className={`${field} min-h-28 resize-none`} placeholder="Anything we should know? Vibe, venue, crazy ideas…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        <input tabIndex={-1} autoComplete="off" className="hidden" aria-hidden value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />

        {status === "error" && <p className="text-sm text-rani" role="alert">{error}</p>}

        <div className="flex flex-wrap items-center gap-6">
          <button type="submit" disabled={status === "sending"} data-cursor="Send" className="rounded-full bg-rani px-8 py-4 font-medium text-ink transition-colors hover:bg-cream disabled:opacity-60">
            {status === "sending" ? "Sending…" : "Request these dates →"}
          </button>
          <a href={waLink} target="_blank" rel="noreferrer" className="text-sm text-cream-dim underline-offset-4 hover:text-cream hover:underline">
            or WhatsApp us directly
          </a>
        </div>
      </div>
    </form>
  );
}
