import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { reservationSchema } from "@/lib/validations";

export async function POST(request: Request) {
  // 1. Parse le body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  // 2. Validation Zod
  const parsed = reservationSchema.safeParse((body as { draft?: unknown })?.draft ?? body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Données invalides" },
      { status: 400 },
    );
  }

  const draft = parsed.data;

  // 3. Vérifier que la date n'est pas dans le passé
  const reservationDate = new Date(draft.dateISO);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (reservationDate < today) {
    return NextResponse.json({ error: "La date choisie est passée." }, { status: 400 });
  }

  // 4. Vérifier que ce n'est pas un lundi
  if (reservationDate.getDay() === 1) {
    return NextResponse.json(
      { error: "XI BestPlaze est fermé le lundi." },
      { status: 400 },
    );
  }

  const selectedItems = draft.preselected?.filter((x) => x.qty > 0) ?? [];
  const totalEstimatif = selectedItems.reduce(
    (sum, x) => sum + (x.unitPrice ?? 0) * x.qty,
    0,
  );

  // 5. Sauvegarder la réservation en BDD AVANT Stripe (statut: en_attente)
  let reservationId: string;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        prenom:           draft.firstName.trim(),
        nom:              draft.lastName.trim(),
        email:            draft.email.trim().toLowerCase(),
        telephone:        draft.phone?.trim() || null,
        date_reservation: draft.dateISO,
        heure:            draft.time,
        nb_personnes:     draft.guests,
        espace:           draft.area,
        occasion:         draft.occasion || null,
        notes:            draft.note || null,
        pre_selection:    selectedItems,
        total_estimatif:  totalEstimatif,
        statut:           "en_attente",
        stripe_payment_status: "unpaid",
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Erreur Supabase insert:", error);
      return NextResponse.json(
        { error: "Impossible de créer la réservation." },
        { status: 500 },
      );
    }
    reservationId = data.id;
  } catch (e) {
    console.error("Erreur Supabase:", e);
    return NextResponse.json(
      { error: "Erreur base de données." },
      { status: 500 },
    );
  }

  // 6. Récupérer le stripe_account_id du bar pour Stripe Connect
  let stripeAccountId: string | null = null;
  try {
    const supabaseForSettings = getSupabaseAdmin();
    const { data: settingsData } = await supabaseForSettings
      .from("admin_settings")
      .select("stripe_account_id, stripe_connected")
      .single();
    if (settingsData?.stripe_connected && settingsData?.stripe_account_id) {
      stripeAccountId = settingsData.stripe_account_id;
    }
  } catch { /* non-bloquant */ }

  // 7. Créer la session Stripe Checkout
  const origin = new URL(request.url).origin;

  const lineItems =
    selectedItems.length > 0
      ? selectedItems.map((item) => ({
          price_data: {
            currency: "eur",
            product_data: { name: item.label },
            unit_amount: Math.round((item.unitPrice ?? 0) * 100),
          },
          quantity: item.qty,
        }))
      : [
          {
            price_data: {
              currency: "eur",
              product_data: { name: "Acompte réservation — XI BestPlaze" },
              unit_amount: 2000, // 20 €
            },
            quantity: 1,
          },
        ];

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: draft.email,
      success_url: `${origin}/reservation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/reservation/cancel`,
      ...(stripeAccountId ? { transfer_data: { destination: stripeAccountId } } : {}),
      metadata: {
        reservation_id:  reservationId,
        firstName:       draft.firstName,
        lastName:        draft.lastName,
        email:           draft.email,
        phone:           draft.phone ?? "",
        dateISO:         draft.dateISO,
        time:            draft.time,
        guests:          String(draft.guests),
        area:            draft.area,
        occasion:        draft.occasion ?? "",
        note:            draft.note ?? "",
        totalEstimatif:  String(totalEstimatif),
      },
    });

    // Mettre à jour la réservation avec l'ID de session Stripe
    const supabase = getSupabaseAdmin();
    await supabase
      .from("reservations")
      .update({ stripe_session_id: session.id })
      .eq("id", reservationId);

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Erreur Stripe:", e);
    // Supprimer la réservation si Stripe échoue
    const supabase = getSupabaseAdmin();
    await supabase.from("reservations").delete().eq("id", reservationId);
    return NextResponse.json(
      { error: "Impossible d'initialiser le paiement. Réessayez." },
      { status: 500 },
    );
  }
}
