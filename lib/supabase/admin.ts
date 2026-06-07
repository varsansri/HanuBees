import { createClient as createSbClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS. Server-only — NEVER import into client code.
// Used by founder-operated tools (e.g. call-onboarding) that create accounts on
// behalf of businesses, which RLS would otherwise block (accounts_write requires
// auth.uid() = user_id). Requires SUPABASE_SERVICE_ROLE_KEY in the environment.
export function adminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSbClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
