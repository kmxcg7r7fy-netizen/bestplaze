-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 005 — Supabase Storage : bucket images événements
-- ═══════════════════════════════════════════════════════════════

-- Bucket public pour les photos d'événements
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'events',
  'events',
  true,
  5242880,   -- 5 Mo max par image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique (tout le monde peut voir les images)
CREATE POLICY "Public read events images" ON storage.objects
  FOR SELECT USING (bucket_id = 'events');

-- Upload réservé aux admins connectés
CREATE POLICY "Admin upload events images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'events'
    AND (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );

-- Mise à jour réservée aux admins
CREATE POLICY "Admin update events images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'events'
    AND (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );

-- Suppression réservée aux admins
CREATE POLICY "Admin delete events images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'events'
    AND (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );
