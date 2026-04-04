-- Table des réservations (exécuter dans l’éditeur SQL Supabase ou via CLI)
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prenom text not null,
  email text not null,
  telephone text,
  date_reservation date not null,
  heure text not null,
  nb_personnes integer not null check (nb_personnes > 0 and nb_personnes <= 100),
  espace text not null,
  occasion text,
  notes text,
  statut text not null default 'en_attente',
  total_estimatif numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists reservations_email_idx on public.reservations (email);
create index if not exists reservations_date_idx on public.reservations (date_reservation);

alter table public.reservations enable row level security;

-- Accès réservé au service role (routes API Next.js). Pas de policy publique.
comment on table public.reservations is 'Réservations clients ; écriture/lecture via API serveur (clé service_role).';
