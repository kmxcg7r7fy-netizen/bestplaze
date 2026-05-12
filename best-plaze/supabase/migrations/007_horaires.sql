-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 007 — Mise à jour des horaires par défaut
-- Coller dans Supabase → SQL Editor et exécuter
-- ═══════════════════════════════════════════════════════════════

UPDATE admin_settings
SET horaires = '[
  {"label":"Lundi",     "value":"Fermé"},
  {"label":"Mar — Sam", "value":"18h — 2h"},
  {"label":"Dimanche",  "value":"Fermé"}
]'::jsonb;
