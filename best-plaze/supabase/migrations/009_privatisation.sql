-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 009 — Demandes de privatisation
-- Coller dans Supabase → SQL Editor et exécuter
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS privatisation_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom          TEXT NOT NULL,
  nom             TEXT NOT NULL,
  email           TEXT NOT NULL,
  telephone       TEXT,
  date            DATE NOT NULL,
  nb_personnes    INT,
  type_evenement  TEXT,
  budget_range    TEXT,
  message         TEXT,
  statut          TEXT NOT NULL DEFAULT 'nouvelle',
  notes_admin     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE privatisation_requests ENABLE ROW LEVEL SECURITY;

-- INSERT public (formulaire client)
CREATE POLICY "privatisation_public_insert"
  ON privatisation_requests FOR INSERT WITH CHECK (true);

-- Lecture + gestion réservée aux admins
CREATE POLICY "privatisation_admin_all"
  ON privatisation_requests FOR ALL USING (auth.role() = 'authenticated');
