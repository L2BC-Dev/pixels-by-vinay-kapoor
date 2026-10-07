import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Public: only the list of upcoming booked dates (no notes, no client data).
export async function GET() {
  const supa = db();
  if (!supa) return NextResponse.json({ dates: [], configured: false });
  const { data, error } = await supa.rpc("booked_dates_public");
  if (error) return NextResponse.json({ dates: [], error: "unavailable" }, { status: 500 });
  return NextResponse.json({ dates: data as string[], configured: true }, { headers: { "Cache-Control": "no-store" } });
}
