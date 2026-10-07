import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-side client with the publishable key. Tables have RLS with no public policies;
// all reads/writes go through SECURITY DEFINER RPCs defined in supabase/schema.sql
// (admin RPCs verify the password against a bcrypt hash stored in the database).
let client: SupabaseClient | null = null;

export function db(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const adminPassword = (req: Request) => req.headers.get("x-admin-password") ?? "";
