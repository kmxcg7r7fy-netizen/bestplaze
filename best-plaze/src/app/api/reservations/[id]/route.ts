import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
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
