import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id manquant" }, { status: 400 });
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "Session Stripe introuvable" }, { status: 404 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Paiement non complété" }, { status: 402 });
  }

  const supabase = getSupabaseAdmin();

  // Idempotence : si la réservation existe déjà pour cette session, on la retourne
  const { data: existing } = await supabase
    .from("reservations")
    .select()
    .eq("stripe_session_id", sessionId)
    .single();

  if (existing) {
    return NextResponse.json({ reservation: existing });
  }

  const m = session.metadata!;

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      nom: m.lastName,
      prenom: m.firstName,
      email: m.email,
      telephone: m.phone || null,
      date_reservation: m.dateISO,
      heure: m.time,
      nb_personnes: parseInt(m.guests, 10),
      espace: m.area,
      occasion: m.occasion || null,
      notes: m.note || null,
      statut: "confirmee",
      total_estimatif: parseFloat(m.totalEstimatif),
      stripe_session_id: sessionId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reservation: data });
}
