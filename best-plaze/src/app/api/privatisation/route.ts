import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const prenom = str(body.prenom);
  const nom    = str(body.nom);
  const email  = str(body.email);
  const date   = str(body.date);

  if (!prenom || !nom || !email || !date) {
    return NextResponse.json(
      { error: "Champs requis manquants : prenom, nom, email, date" },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Format de date invalide" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Configuration Supabase";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("privatisation_requests")
    .insert({
      prenom,
      nom,
      email:          email.toLowerCase(),
      telephone:      str(body.telephone),
      date,
      nb_personnes:   typeof body.nb_personnes === "number" ? body.nb_personnes : null,
      type_evenement: str(body.type_evenement),
      budget_range:   str(body.budget_range),
      message:        str(body.message),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ request: data }, { status: 201 });
}
