import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * GET /api/stripe/connect/authorize
 * Génère l'URL d'autorisation Stripe Connect OAuth et retourne la redirection.
 */
export async function GET(request: Request) {
  const clientId = process.env.STRIPE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "STRIPE_CLIENT_ID non configuré." },
      { status: 500 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const state  = randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    response_type: "code",
    client_id:     clientId,
    scope:         "read_write",
    redirect_uri:  `${appUrl}/api/stripe/connect/callback`,
    state,
  });

  const stripeOAuthUrl = `https://connect.stripe.com/oauth/authorize?${params}`;

  // Stocker le state dans un cookie httpOnly pour vérification CSRF au retour
  const res = NextResponse.json({ url: stripeOAuthUrl });
  res.cookies.set("stripe_oauth_state", state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   600, // 10 minutes
    path:     "/",
  });

  return res;
}
