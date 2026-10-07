"use client";
import { useCallback, useEffect, useState } from "react";
import Calendar from "@/components/book/Calendar";

type Enquiry = { id: number; created_at: string; names: string; phone: string; email: string; event_dates: string[]; city: string; package: string; guests: string; message: string };

export default function Admin() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [booked, setBooked] = useState<{ date: string; note: string | null }[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [msg, setMsg] = useState("");

  const load = useCallback(async (password: string) => {
    const r = await fetch("/api/admin", { headers: { "x-admin-password": password } });
    if (!r.ok) {
      setMsg(r.status === 401 ? "Wrong password" : "Could not load data");
      return false;
    }
    const d = await r.json();
    setBooked(d.booked);
    setEnquiries(d.enquiries);
    setAuthed(true);
    setMsg("");
    try {
      sessionStorage.setItem("pbvk-admin", password);
    } catch {}
    return true;
  }, []);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("pbvk-admin");
      if (saved) {
        setPw(saved);
        load(saved);
      }
    } catch {}
  }, [load]);

  async function toggle(date: string) {
    const isBooked = booked.some((b) => b.date === date);
    const note = isBooked ? undefined : (prompt(`Block ${date}? Optional note (couple / event):`) ?? undefined);
    if (!isBooked && note === undefined) return;
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pw },
      body: JSON.stringify({ action: isBooked ? "unblock" : "block", date, note }),
    });
    setMsg(r.ok ? `${isBooked ? "Unblocked" : "Blocked"} ${date}` : "Failed");
    load(pw);
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(pw);
          }}
          className="w-full max-w-sm space-y-6"
        >
          <h1 className="display text-5xl">Studio admin</h1>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" className="w-full border-b border-line bg-transparent py-3 outline-none focus:border-rani" />
          <button className="rounded-full bg-rani px-6 py-3 text-ink">Enter</button>
          {msg && <p className="text-rani">{msg}</p>}
        </form>
      </div>
    );
  }

  const bookedSet = new Set(booked.map((b) => b.date));
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-16">
      <div className="flex items-baseline justify-between">
        <h1 className="display text-6xl">Studio admin</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem("pbvk-admin");
            setAuthed(false);
            setPw("");
          }}
          className="text-sm text-cream-dim hover:text-rani"
        >
          Log out
        </button>
      </div>
      {msg && <p className="mt-4 text-rani">{msg}</p>}
      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4">Click a date to block / unblock it</p>
          <Calendar booked={bookedSet} selected={new Set()} onToggle={toggle} bookedSelectable allowPast />
          <ul className="mt-6 space-y-1 text-sm text-cream-dim">
            {booked.map((b) => (
              <li key={b.date}>
                <span className="font-mono text-cream">{b.date}</span> {b.note && `— ${b.note}`}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Enquiries ({enquiries.length})</p>
          <div className="space-y-4">
            {enquiries.map((e) => (
              <div key={e.id} className="border border-line bg-ink-2 p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="display text-2xl">{e.names}</p>
                  <p className="font-mono text-[10px] text-cream-dim">{new Date(e.created_at).toLocaleString("en-IN")}</p>
                </div>
                <p className="mt-1 text-sm">
                  <a className="text-rani" href={`tel:${e.phone}`}>{e.phone}</a> {e.email && <>· {e.email}</>}
                </p>
                <p className="mt-2 text-sm text-cream-dim">
                  {e.event_dates.join(", ")} · {e.city || "—"} · {e.package || "—"} · {e.guests || "—"} guests
                </p>
                {e.message && <p className="mt-2 text-sm">{e.message}</p>}
                <button onClick={() => e.event_dates.forEach((d) => !bookedSet.has(d) && toggle(d))} className="mt-3 text-xs text-saffron hover:underline">
                  Block these dates
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
