import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  // honeypot
  if (str(body.website)) return NextResponse.json({ ok: true });

  const dates = Array.isArray(body.dates) ? body.dates.filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(0, 7) : [];
  const enquiry = {
    names: str(body.names, 120),
    phone: str(body.phone, 30),
    email: str(body.email, 160),
    dates,
    city: str(body.city, 120),
    package: str(body.package, 60),
    guests: str(body.guests, 30),
    message: str(body.message, 2000),
  };
  if (!enquiry.names || !enquiry.phone || dates.length === 0) {
    return NextResponse.json({ error: "Please add your names, phone number and at least one date." }, { status: 400 });
  }

  const supa = db();
  if (!supa) return NextResponse.json({ ok: true, stored: false });

  const { data, error } = await supa.rpc("submit_enquiry", { p: enquiry });
  if (error) return NextResponse.json({ error: "Could not save your enquiry. Please WhatsApp us instead." }, { status: 500 });
  if (typeof data === "string" && data.startsWith("clash:")) {
    return NextResponse.json({ error: `Sorry — ${data.slice(6)} is already booked. Pick another date or message us.` }, { status: 409 });
  }
  if (data !== "ok") return NextResponse.json({ error: "Please check your details." }, { status: 400 });
  return NextResponse.json({ ok: true, stored: true });
}
