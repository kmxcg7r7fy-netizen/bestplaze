-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 008 — Table des fermetures exceptionnelles
-- Coller dans Supabase → SQL Editor et exécuter
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS closures (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date       DATE NOT NULL UNIQUE,
  motif      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE closures ENABLE ROW LEVEL SECURITY;

-- Lecture publique (formulaire de réservation)
CREATE POLICY "closures_public_read"
  ON closures FOR SELECT USING (true);

-- CRUD réservé aux admins authentifiés
CREATE POLICY "closures_admin_all"
  ON closures FOR ALL USING (auth.role() = 'authenticated');
