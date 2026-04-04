import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/admin/setup
 * Étape 1 de l'onboarding : crée le compte admin et initialise admin_settings.
 * N'accepte les requêtes que si setup_complete = false.
 */
export async function POST(request: Request) {
  let body: {
    email: string;
    password: string;
    prenom: string;
    nom: string;
    nom_etablissement: string;
    telephone: string;
    adresse: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { email, password, prenom, nom, nom_etablissement, telephone, adresse } = body;

  if (!email || !password || !prenom || !nom) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // 1. Vérifier que le setup n'a pas déjà été effectué
  const { data: settings } = await supabase
    .from("admin_settings")
    .select("id, setup_complete")
    .single();

  if (settings?.setup_complete) {
    return NextResponse.json(
      { error: "La configuration a déjà été effectuée." },
      { status: 403 },
    );
  }

  // 2. Créer l'utilisateur admin (email confirmé d'office)
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { prenom: prenom.trim(), nom: nom.trim() },
  });

  if (createError) {
    const msg = createError.message.includes("already registered")
      ? "Cet email est déjà utilisé."
      : createError.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const userId = userData.user.id;

  // 3. Mettre à jour le profil avec les infos + is_admin
  await supabase
    .from("profiles")
    .upsert({
      id:        userId,
      email:     email.trim().toLowerCase(),
      prenom:    prenom.trim(),
      nom:       nom.trim(),
      telephone: telephone?.trim() || null,
      is_admin:  true,
    });

  // 4. Mettre à jour admin_settings avec les infos de l'établissement
  if (settings?.id) {
    await supabase
      .from("admin_settings")
      .update({
        nom_etablissement: nom_etablissement?.trim() || "XI BestPlaze",
        telephone:         telephone?.trim() || null,
        adresse:           adresse?.trim() || null,
        setup_step:        2,
      })
      .eq("id", settings.id);
  }

  return NextResponse.json({ success: true });
}

/**
 * PATCH /api/admin/setup
 * Étape 3 : sauvegarde la configuration et termine le setup.
 */
export async function PATCH(request: Request) {
  let body: {
    pourcentage_acompte: number;
    montant_min_acompte: number;
    message_confirmation: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: settings } = await supabase
    .from("admin_settings")
    .select("id, setup_complete")
    .single();

  if (settings?.setup_complete) {
    return NextResponse.json({ error: "Setup déjà terminé." }, { status: 403 });
  }

  if (!settings?.id) {
    return NextResponse.json(
      { error: "Configuration admin introuvable." },
      { status: 500 },
    );
  }

  await supabase
    .from("admin_settings")
    .update({
      pourcentage_acompte:  Math.min(100, Math.max(10, body.pourcentage_acompte ?? 30)),
      montant_min_acompte:  Math.max(0, body.montant_min_acompte ?? 20),
      message_confirmation: body.message_confirmation || "Merci pour votre réservation chez XI BestPlaze !",
      setup_complete:       true,
      setup_step:           4,
    })
    .eq("id", settings.id);

  return NextResponse.json({ success: true });
}
