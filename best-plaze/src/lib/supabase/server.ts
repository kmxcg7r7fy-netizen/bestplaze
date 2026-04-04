import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase côté serveur (clé anon + cookies).
 * À utiliser dans les Server Components, Route Handlers et middleware.
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component → impossible de modifier les cookies
          }
        },
      },
    },
  );
}

/**
 * Retourne l'utilisateur connecté depuis la session cookie.
 * Retourne null si non connecté.
 */
export async function getServerUser() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Vérifie si l'utilisateur connecté est admin.
 * Compare l'email avec ADMIN_EMAIL ou vérifie is_admin dans profiles.
 */
export async function isAdmin(userEmail?: string | null): Promise<boolean> {
  if (!userEmail) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && userEmail === adminEmail) return true;

  // Fallback : vérifier is_admin dans profiles
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("email", userEmail)
    .single();

  return data?.is_admin === true;
}
