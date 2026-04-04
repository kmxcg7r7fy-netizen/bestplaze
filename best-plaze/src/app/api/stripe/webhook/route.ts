import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Stripe envoie le corps brut — désactiver le body parsing de Next.js
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET non configuré");
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature invalide";
    console.error("Webhook verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // ── checkout.session.completed ──────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reservationId = session.metadata?.reservation_id;

    if (!reservationId) {
      console.error("reservation_id manquant dans les metadata Stripe");
      return NextResponse.json({ received: true });
    }

    const montantPaye = session.amount_total ? session.amount_total / 100 : 0;

    const { error } = await supabase
      .from("reservations")
      .update({
        statut:                    "confirmee",
        stripe_payment_status:     "paid",
        stripe_session_id:         session.id,
        stripe_payment_intent_id:  session.payment_intent as string ?? null,
        montant_paye:              montantPaye,
      })
      .eq("id", reservationId);

    if (error) {
      console.error("Erreur mise à jour réservation après paiement:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Réservation ${reservationId} confirmée — ${montantPaye}€`);
  }

  // ── payment_intent.payment_failed ────────────────────────────────────────
  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    // Chercher la réservation par payment_intent_id
    const { error } = await supabase
      .from("reservations")
      .update({
        statut:                "annulee",
        stripe_payment_status: "failed",
      })
      .eq("stripe_payment_intent_id", intent.id);

    if (error) {
      console.error("Erreur mise à jour réservation après échec:", error);
    }
  }

  // ── checkout.session.expired ─────────────────────────────────────────────
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const reservationId = session.metadata?.reservation_id;

    if (reservationId) {
      await supabase
        .from("reservations")
        .update({ statut: "annulee", stripe_payment_status: "failed" })
        .eq("id", reservationId);
    }
  }

  return NextResponse.json({ received: true });
}
