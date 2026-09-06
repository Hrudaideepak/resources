import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;
let adminClient: SupabaseClient | null | undefined;

/** Returns a Supabase client, or null when env vars are absent (local mode). */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

/**
 * Server-only client with the service role key — bypasses RLS. Used for the
 * `users` table (password hashes must never be exposed to the anon key) and for
 * moderation writes. Set SUPABASE_SERVICE_ROLE_KEY in production; locally this
 * falls back to the anon client (fine against a throwaway dev database).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  if (adminClient !== undefined) return adminClient;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  adminClient = service ? createClient(url, service, { auth: { persistSession: false } }) : getSupabase();
  return adminClient;
}

export const isSupabaseConfigured = () => getSupabase() !== null;
