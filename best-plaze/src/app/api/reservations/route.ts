import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CreateReservationBody, ReservationRow } from "@/types/reservation";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
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

  if (
    !isNonEmptyString(firstName) ||
    !isNonEmptyString(lastName) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(dateISO) ||
    !isNonEmptyString(time) ||
    !isNonEmptyString(area)
  ) {
    return NextResponse.json(
      {
        error:
          "Champs requis manquants : firstName, lastName, email, dateISO, time, area",
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
    email: email.trim().toLowerCase(),
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

  return NextResponse.json({ reservation: data as ReservationRow }, { status: 201 });
}
