import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildReceiptEmail } from "@/lib/email/receiptTemplate";
import type { CreateReservationBody, ReservationRow } from "@/types/reservation";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** Email réel ou valeur technique si réservation « téléphone seul » (colonne email NOT NULL). */
function emailForDatabase(email: unknown, phone: unknown): string | null {
  if (isNonEmptyString(email)) return email.trim().toLowerCase();
  if (isNonEmptyString(phone)) {
    const slug = phone.trim().replace(/[^\d+]/g, "") || "tel";
    return `reserve+${slug}@noemail.bestplaze`;
  }
  return null;
}

export async function POST(request: Request) {
  let body: Partial<CreateReservationBody>;
  try {
    body = (await request.json()) as Partial<CreateReservationBody>;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    dateISO,
    time,
    guests,
    area,
    occasion,
    note,
    statut,
    totalEstimatif,
  } = body;

  const resolvedEmail = emailForDatabase(email, phone);

  if (
    !isNonEmptyString(firstName) ||
    !isNonEmptyString(lastName) ||
    !resolvedEmail ||
    !isNonEmptyString(dateISO) ||
    !isNonEmptyString(time) ||
    !isNonEmptyString(area)
  ) {
    return NextResponse.json(
      {
        error:
          "Champs requis manquants : firstName, lastName, email ou téléphone, dateISO, time, area",
      },
      { status: 400 }
    );
  }

  const nb =
    typeof guests === "number" && Number.isFinite(guests)
      ? Math.trunc(guests)
      : NaN;
  if (!Number.isFinite(nb) || nb < 1) {
    return NextResponse.json(
      { error: "guests doit être un entier ≥ 1" },
      { status: 400 }
    );
  }

  const total =
    typeof totalEstimatif === "number" && Number.isFinite(totalEstimatif)
      ? totalEstimatif
      : 0;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Configuration Supabase";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // ── Vérification fermeture ──────────────────────────────────────────────
  const { data: closure } = await supabase
    .from("closures")
    .select("id")
    .eq("date", dateISO)
    .maybeSingle();
  if (closure) {
    return NextResponse.json(
      { error: "L'établissement est fermé à cette date. Veuillez choisir une autre date." },
      { status: 409 }
    );
  }

  // ── Vérification capacité ────────────────────────────────────────────────
  const areaKey = `capacite_max_${area.trim().toLowerCase()}` as
    | "capacite_max_lounge"
    | "capacite_max_terrasse"
    | "capacite_max_salle";

  const { data: settings } = await supabase
    .from("admin_settings")
    .select("capacite_max_lounge, capacite_max_terrasse, capacite_max_salle")
    .single();

  const capaciteMax: number | null | undefined = settings?.[areaKey];

  if (typeof capaciteMax === "number" && capaciteMax > 0) {
    const { data: existing } = await supabase
      .from("reservations")
      .select("nb_personnes")
      .eq("date_reservation", dateISO)
      .eq("heure", time.trim())
      .eq("espace", area.trim())
      .neq("statut", "annulee");

    const occupancy = (existing ?? []).reduce(
      (sum: number, r: { nb_personnes: number }) => sum + (r.nb_personnes ?? 0),
      0
    );
    if (occupancy + nb > capaciteMax) {
      return NextResponse.json(
        {
          error: `Capacité insuffisante pour ce créneau (${occupancy}/${capaciteMax} places déjà réservées). Veuillez choisir un autre horaire ou espace.`,
        },
        { status: 409 }
      );
    }
  }

  const insert = {
    nom: lastName.trim(),
    prenom: firstName.trim(),
    email: resolvedEmail,
    telephone: phone?.trim() || null,
    date_reservation: dateISO,
    heure: time.trim(),
    nb_personnes: nb,
    espace: area.trim(),
    occasion: occasion?.trim() || null,
    notes: note?.trim() || null,
    statut: statut?.trim() || "en_attente",
    total_estimatif: total,
  };

  const { data, error } = await supabase
    .from("reservations")
    .insert(insert)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: 500 }
    );
  }

  const reservation = data as ReservationRow;

  // ── Envoi email de réception ─────────────────────────────────────────────
  const isRealEmail =
    reservation.email && !reservation.email.endsWith("@noemail.bestplaze");

  if (isRealEmail && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { subject, html } = buildReceiptEmail(reservation);
      const isDev = process.env.NODE_ENV !== "production";
      const recipient = isDev
        ? (process.env.ADMIN_EMAIL ?? reservation.email)
        : reservation.email;

      await resend.emails.send({
        from:    "XI BestPlaze <noreply@bestplaze.fr>",
        to:      recipient,
        replyTo: reservation.email,
        subject,
        html,
      });
    } catch (emailErr) {
      // L'email a échoué mais l'insertion DB a réussi — on log sans bloquer
      console.error("[Resend] Échec envoi email de réception:", emailErr);
    }
  }

  return NextResponse.json({ reservation }, { status: 201 });
}
