import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const path = request.nextUrl.pathname;

  // ── Vérification setup_complete (avant tout pour /admin/*) ───────────────
  if (path.startsWith("/admin")) {
    // La table admin_settings est lisible publiquement (migration 004)
    const { data: settingsData } = await supabase
      .from("admin_settings")
      .select("setup_complete")
      .maybeSingle();

    const setupComplete = settingsData?.setup_complete ?? false;

    if (!setupComplete) {
      // Setup non effectué : seul /admin/setup est accessible
      if (!path.startsWith("/admin/setup")) {
        return NextResponse.redirect(new URL("/admin/setup", request.url));
      }
      // Laisser accéder à /admin/setup
      return response;
    }

    // Setup terminé : bloquer /admin/setup
    if (path.startsWith("/admin/setup")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // ── Rafraîchit la session (important pour les tokens expirés) ────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Protection /admin/* ───────────────────────────────────────────────────
  if (path.startsWith("/admin") && path !== "/admin/login") {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdminUser = adminEmail && user.email === adminEmail;

    if (!isAdminUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
  }

  // ── Protection /account (sauf login/register) ────────────────────────────
  const publicAccountPaths = ["/account/login", "/account/register"];
  if (
    path.startsWith("/account") &&
    !publicAccountPaths.some((p) => path.startsWith(p))
  ) {
    if (!user) {
      return NextResponse.redirect(new URL("/account/login", request.url));
    }
  }

  // ── Redirige un utilisateur déjà connecté loin des pages login ───────────
  if (user) {
    if (path === "/account/login" || path === "/account/register") {
      return NextResponse.redirect(new URL("/account", request.url));
    }
    if (path === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/account/:path*"],
};
