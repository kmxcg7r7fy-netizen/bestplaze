-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 006 — Suppression des colonnes Stripe
-- Coller dans Supabase → SQL Editor et exécuter
-- ═══════════════════════════════════════════════════════════════

-- Colonnes Stripe dans reservations
ALTER TABLE reservations
  DROP COLUMN IF EXISTS stripe_session_id,
  DROP COLUMN IF EXISTS stripe_payment_intent_id,
  DROP COLUMN IF EXISTS stripe_payment_status,
  DROP COLUMN IF EXISTS montant_paye;

-- Colonnes Stripe + acompte dans admin_settings
ALTER TABLE admin_settings
  DROP COLUMN IF EXISTS stripe_account_id,
  DROP COLUMN IF EXISTS stripe_connected,
  DROP COLUMN IF EXISTS stripe_onboarding_complete,
  DROP COLUMN IF EXISTS stripe_account_email,
  DROP COLUMN IF EXISTS pourcentage_acompte,
  DROP COLUMN IF EXISTS montant_min_acompte;
