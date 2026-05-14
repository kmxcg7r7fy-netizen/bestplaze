import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Client Supabase côté navigateur (clé anon).
 * Utilise createBrowserClient de @supabase/ssr pour synchroniser
 * la session via cookies (nécessaire pour le middleware).
 */
export function getBrowserSupabaseClient(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
    if (!url || !key) {
      throw new Error(
        "Supabase non configuré : ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local"
      );
    }
    client = createBrowserClient(url, key);
  }
  return client;
}
