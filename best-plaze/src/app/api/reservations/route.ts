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
