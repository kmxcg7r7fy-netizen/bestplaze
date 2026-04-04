-- Migration : politiques RLS pour la table reservations
-- À exécuter dans Supabase → SQL Editor (après la migration 001)

-- Les utilisateurs authentifiés peuvent lire uniquement leurs propres réservations
create policy "Users can view own reservations"
  on public.reservations
  for select
  to authenticated
  using (email = auth.email());

-- Seul le service_role (API serveur) peut insérer / mettre à jour
-- Aucune policy insert/update côté client : tout passe par les Route Handlers.
