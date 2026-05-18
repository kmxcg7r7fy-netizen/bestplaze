import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildConfirmationEmail } from "@/lib/email/confirmationTemplate";
import type { ReservationRow } from "@/types/reservation";

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id || !uuidRe.test(id)) {
    return NextResponse.json({ error: "Identifiant UUID invalide" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Configuration Supabase";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  }

  return NextResponse.json({ reservation: data as ReservationRow });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id || !uuidRe.test(id)) {
    return NextResponse.json({ error: "Identifiant UUID invalide" }, { status: 400 });
  }

  let body: { statut: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { statut } = body;
  if (!statut) {
    return NextResponse.json({ error: "statut manquant" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("reservations")
    .update({ statut })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reservation = data as ReservationRow;

  // ── Envoi email de confirmation ──────────────────────────────────────────
  if (statut === "confirmee") {
    const isRealEmail =
      reservation.email &&
      !reservation.email.endsWith("@noemail.bestplaze");

    if (isRealEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { subject, html } = buildConfirmationEmail(reservation);
        // En mode test Resend (onboarding@resend.dev), les emails
        // ne peuvent être envoyés qu'à l'adresse du compte Resend.
        const isDev = process.env.NODE_ENV !== "production";
        const recipient = isDev
          ? (process.env.ADMIN_EMAIL ?? reservation.email)
          : reservation.email;

        await resend.emails.send({
          from:    "XI BestPlaze <onboarding@resend.dev>",
          to:      recipient,
          replyTo: reservation.email,
          subject,
          html,
        });
      } catch (emailErr) {
        // L'email a échoué mais la mise à jour DB a réussi — on log sans bloquer
        console.error("[Resend] Échec envoi email:", emailErr);
      }
    }
  }

  return NextResponse.json({ reservation });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id || !uuidRe.test(id)) {
    return NextResponse.json({ error: "Identifiant UUID invalide" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
