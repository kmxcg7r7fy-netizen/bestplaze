-- Migration : création de la table reservations
-- À exécuter dans Supabase → SQL Editor

create table if not exists public.reservations (
  id                uuid        primary key default gen_random_uuid(),
  nom               text        not null,
  prenom            text        not null,
  email             text        not null,
  telephone         text,
  date_reservation  date        not null,
  heure             text        not null,
  nb_personnes      integer     not null check (nb_personnes >= 1),
  espace            text        not null,
  occasion          text,
  notes             text,
  statut            text        not null default 'en_attente',
  total_estimatif   numeric     not null default 0,
  stripe_session_id text        unique,
  created_at        timestamptz not null default now()
);

-- Index utiles
create index if not exists reservations_email_idx on public.reservations (email);
create index if not exists reservations_date_idx  on public.reservations (date_reservation);

-- RLS : activer et autoriser uniquement le service_role (pas d'accès anon direct)
alter table public.reservations enable row level security;

-- Policy : le service_role bypasse le RLS (comportement par défaut Supabase)
-- Aucune policy anon nécessaire — toutes les écritures passent par l'API serveur.
