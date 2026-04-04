-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 004 — Onboarding admin & Stripe Connect
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────
-- Champs supplémentaires dans admin_settings
-- ─────────────────────────────────────────────────────
ALTER TABLE admin_settings
  ADD COLUMN IF NOT EXISTS setup_complete              BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS setup_step                  INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stripe_account_email        TEXT;

-- ─────────────────────────────────────────────────────
-- Politique de lecture publique pour le middleware
-- (setup_complete doit être lisible sans authentification)
-- ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Lecture publique admin_settings" ON admin_settings;
CREATE POLICY "Lecture publique admin_settings" ON admin_settings
  FOR SELECT USING (TRUE);

-- ─────────────────────────────────────────────────────
-- NOTE : Les données sensibles (clés Stripe) restent
-- dans les variables d'environnement, pas dans cette table.
-- ─────────────────────────────────────────────────────
