import { NextResponse } from "next/server";
import { adminPassword, db } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const fail = (error: { code?: string } | null) =>
  NextResponse.json({ error: error?.code === "28000" ? "Unauthorized" : "Server error" }, { status: error?.code === "28000" ? 401 : 500 });

export async function GET(req: Request) {
  const supa = db();
  if (!supa) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  const { data, error } = await supa.rpc("admin_data", { pw: adminPassword(req) });
  if (error) return fail(error);
  return NextResponse.json(data);
}

// { action: "block" | "unblock", date: "YYYY-MM-DD", note?: string }
export async function POST(req: Request) {
  const supa = db();
  if (!supa) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  const { action, date, note } = await req.json();
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Bad date" }, { status: 400 });
  const { error } = await supa.rpc("admin_set_date", {
    pw: adminPassword(req),
    d: date,
    block: action === "block",
    note: typeof note === "string" ? note.slice(0, 200) : null,
  });
  if (error) return fail(error);
  return NextResponse.json({ ok: true });
}
