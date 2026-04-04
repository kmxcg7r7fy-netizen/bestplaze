import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * GET /api/stripe/connect/callback
 * Reçoit le retour OAuth Stripe, échange le code, sauvegarde le compte.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const setupUrl = `${appUrl}/admin/setup`;

  // Erreur retournée par Stripe
  if (error) {
    return NextResponse.redirect(`${setupUrl}?step=2&stripe_error=${encodeURIComponent(error)}`);
  }

  // Vérification CSRF state
  const savedState = request.cookies.get("stripe_oauth_state")?.value;
  if (!state || state !== savedState) {
    return NextResponse.redirect(`${setupUrl}?step=2&stripe_error=state_mismatch`);
  }

  if (!code) {
    return NextResponse.redirect(`${setupUrl}?step=2&stripe_error=no_code`);
  }

  // Échange du code contre un access_token
  const tokenRes = await fetch("https://connect.stripe.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type":  "application/x-www-form-urlencoded",
      "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
    }),
  });

  const tokenData = (await tokenRes.json()) as {
    stripe_user_id?: string;
    access_token?:   string;
    error?:          string;
    error_description?: string;
  };

  if (!tokenRes.ok || !tokenData.stripe_user_id) {
    const msg = tokenData.error_description ?? tokenData.error ?? "token_failed";
    return NextResponse.redirect(`${setupUrl}?step=2&stripe_error=${encodeURIComponent(msg)}`);
  }

  // Sauvegarde dans admin_settings
  const supabase = getSupabaseAdmin();
  await supabase
    .from("admin_settings")
    .update({
      stripe_account_id:          tokenData.stripe_user_id,
      stripe_connected:           true,
      stripe_onboarding_complete: true,
      setup_step:                 3,
    })
    .eq("setup_complete", false); // uniquement si setup pas encore terminé

  // Supprimer le cookie CSRF et rediriger vers étape 3
  const redirect = NextResponse.redirect(`${setupUrl}?step=3&stripe_ok=1`);
  redirect.cookies.delete("stripe_oauth_state");
  return redirect;
}
