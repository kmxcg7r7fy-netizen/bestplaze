-- ═══════════════════════════════════════════════════════════════
-- MIGRATION 003 — Schéma complet XI BestPlaze
-- Coller dans Supabase → SQL Editor et exécuter
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────
-- TABLE PROFILES (clients + admins)
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                   UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email                TEXT NOT NULL,
  prenom               TEXT,
  nom                  TEXT,
  telephone            TEXT,
  is_admin             BOOLEAN DEFAULT FALSE,
  is_vip               BOOLEAN DEFAULT FALSE,
  newsletter           BOOLEAN DEFAULT TRUE,
  sms_notifications    BOOLEAN DEFAULT FALSE,
  espace_favori        TEXT DEFAULT 'Lounge',
  total_reservations   INTEGER DEFAULT 0,
  total_depense        DECIMAL(10,2) DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- TABLE RESERVATIONS
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  prenom                    TEXT NOT NULL,
  nom                       TEXT NOT NULL,
  email                     TEXT NOT NULL,
  telephone                 TEXT,
  date_reservation          DATE NOT NULL,
  heure                     TEXT NOT NULL,
  nb_personnes              INTEGER NOT NULL CHECK (nb_personnes >= 1 AND nb_personnes <= 12),
  espace                    TEXT NOT NULL DEFAULT 'Lounge'
                              CHECK (espace IN ('Lounge', 'Terrasse', 'Salle')),
  occasion                  TEXT,
  notes                     TEXT,
  pre_selection             JSONB DEFAULT '[]',
  total_estimatif           DECIMAL(10,2) DEFAULT 0,
  statut                    TEXT DEFAULT 'en_attente'
                              CHECK (statut IN ('en_attente','confirmee','annulee','terminee','no_show')),
  stripe_session_id         TEXT UNIQUE,
  stripe_payment_intent_id  TEXT,
  stripe_payment_status     TEXT DEFAULT 'unpaid'
                              CHECK (stripe_payment_status IN ('unpaid','paid','refunded','failed')),
  montant_paye              DECIMAL(10,2) DEFAULT 0,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- TABLE EVENTS
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titre         TEXT NOT NULL,
  description   TEXT,
  date          DATE NOT NULL,
  heure_debut   TEXT NOT NULL,
  heure_fin     TEXT,
  type          TEXT NOT NULL
                  CHECK (type IN ('DJ Set','Live Music','Afterwork','Soirée à thème','Dinner & Lounge','Autre')),
  dress_code    TEXT,
  image_url     TEXT,
  prix_entree   DECIMAL(10,2) DEFAULT 0,
  capacite_max  INTEGER,
  a_la_une      BOOLEAN DEFAULT FALSE,
  statut        TEXT DEFAULT 'published'
                  CHECK (statut IN ('draft','published','cancelled','past')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- TABLE MENU_ITEMS
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom           TEXT NOT NULL,
  description   TEXT,
  categorie     TEXT NOT NULL,
  prix          DECIMAL(10,2),
  prix_bouteille DECIMAL(10,2),
  badge         TEXT CHECK (badge IN ('Signature','Premium','Best-seller','Nouveau') OR badge IS NULL),
  disponible    BOOLEAN DEFAULT TRUE,
  ordre         INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────
-- TABLE ADMIN_SETTINGS
-- ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_settings (
  id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_etablissement           TEXT DEFAULT 'XI BestPlaze',
  adresse                     TEXT DEFAULT '56 Rue de Suède, 37100 Tours',
  telephone                   TEXT DEFAULT '07 68 62 73 19',
  email_contact               TEXT DEFAULT 'reservation@bestplaze.com',
  horaires                    JSONB DEFAULT '[
    {"label":"Lundi","value":"Fermé"},
    {"label":"Mar — Jeu","value":"12:00 — 02:00"},
    {"label":"Ven — Sam","value":"12:00 — 04:00"},
    {"label":"Dim","value":"12:00 — 01:00"}
  ]',
  stripe_account_id           TEXT,
  stripe_connected            BOOLEAN DEFAULT FALSE,
  pourcentage_acompte         INTEGER DEFAULT 30,
  montant_min_acompte         DECIMAL(10,2) DEFAULT 20,
  delai_annulation_heures     INTEGER DEFAULT 24,
  capacite_max_lounge         INTEGER DEFAULT 40,
  capacite_max_terrasse       INTEGER DEFAULT 30,
  capacite_max_salle          INTEGER DEFAULT 60,
  message_confirmation        TEXT DEFAULT 'Merci pour votre réservation chez XI BestPlaze. Nous avons hâte de vous accueillir !',
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les paramètres par défaut
INSERT INTO admin_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────
-- RLS — ACTIVATION
-- ─────────────────────────────────────────────────────
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE events          ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings  ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────
-- POLICIES — PROFILES
-- ─────────────────────────────────────────────────────
CREATE POLICY "Lecture profil personnel" ON profiles
  FOR SELECT USING (auth.uid() = id OR (
    SELECT is_admin FROM profiles WHERE id = auth.uid()
  ) = TRUE);

CREATE POLICY "Mise à jour profil personnel" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin lecture tous les profils" ON profiles
  FOR ALL USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
  );

-- ─────────────────────────────────────────────────────
-- POLICIES — RESERVATIONS
-- ─────────────────────────────────────────────────────
CREATE POLICY "Lecture réservations personnelles" ON reservations
  FOR SELECT USING (
    auth.uid() = user_id
    OR user_id IS NULL
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
  );

CREATE POLICY "Création réservation publique" ON reservations
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admin modification réservations" ON reservations
  FOR UPDATE USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
  );

-- ─────────────────────────────────────────────────────
-- POLICIES — EVENTS (lecture publique, écriture admin)
-- ─────────────────────────────────────────────────────
CREATE POLICY "Lecture événements publiés" ON events
  FOR SELECT USING (statut = 'published' OR (
    SELECT is_admin FROM profiles WHERE id = auth.uid()
  ) = TRUE);

CREATE POLICY "Admin gestion événements" ON events
  FOR ALL USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
  );

-- ─────────────────────────────────────────────────────
-- POLICIES — MENU (lecture publique)
-- ─────────────────────────────────────────────────────
CREATE POLICY "Lecture carte publique" ON menu_items
  FOR SELECT USING (disponible = TRUE OR (
    SELECT is_admin FROM profiles WHERE id = auth.uid()
  ) = TRUE);

CREATE POLICY "Admin gestion carte" ON menu_items
  FOR ALL USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
  );

-- ─────────────────────────────────────────────────────
-- POLICIES — ADMIN_SETTINGS
-- ─────────────────────────────────────────────────────
CREATE POLICY "Admin lecture paramètres" ON admin_settings
  FOR SELECT USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
  );

CREATE POLICY "Admin modification paramètres" ON admin_settings
  FOR UPDATE USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
  );

-- ─────────────────────────────────────────────────────
-- TRIGGER — Créer profil à l'inscription
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────
-- TRIGGER — updated_at automatique
-- ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────
-- INDEX — Performance
-- ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reservations_email         ON reservations(email);
CREATE INDEX IF NOT EXISTS idx_reservations_date          ON reservations(date_reservation);
CREATE INDEX IF NOT EXISTS idx_reservations_statut        ON reservations(statut);
CREATE INDEX IF NOT EXISTS idx_reservations_stripe_session ON reservations(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_events_date                ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_statut              ON events(statut);
CREATE INDEX IF NOT EXISTS idx_menu_categorie             ON menu_items(categorie);

-- ─────────────────────────────────────────────────────
-- DONNÉES — Menu complet XI BestPlaze
-- ─────────────────────────────────────────────────────
INSERT INTO menu_items (nom, description, categorie, prix, prix_bouteille, badge, ordre) VALUES
  -- SOFTS
  ('Coca Cola', NULL, 'Softs', 6, NULL, NULL, 1),
  ('Ice Tea', NULL, 'Softs', 6, NULL, NULL, 2),
  ('Limonade', NULL, 'Softs', 6, NULL, NULL, 3),
  ('Schweppes', NULL, 'Softs', 6, NULL, NULL, 4),
  ('Oasis', NULL, 'Softs', 6, NULL, NULL, 5),
  ('Jus d''ananas', NULL, 'Softs', 6, NULL, NULL, 6),
  ('Jus de fraise', NULL, 'Softs', 6, NULL, NULL, 7),
  ('Jus d''orange', NULL, 'Softs', 6, NULL, NULL, 8),
  ('Jus de pomme', NULL, 'Softs', 6, NULL, NULL, 9),
  ('Sirop à l''eau', 'Supplément sirop +0,50€', 'Softs', 3.50, NULL, NULL, 10),

  -- COCKTAILS SANS ALCOOL
  ('Virgin Mojito', 'Citron vert, menthe fraîche, limonade', 'Cocktails sans alcool', 9, NULL, NULL, 1),
  ('Colada', 'Jus d''ananas, sirop de coco, crème liquide', 'Cocktails sans alcool', 9, NULL, NULL, 2),
  ('Strawberry Colada', 'Fraise, jus d''ananas, sirop de coco', 'Cocktails sans alcool', 9, NULL, NULL, 3),

  -- COCKTAILS
  ('Blue Perfect', 'Champagne, Crème de pêche, Curaçao bleu, Malibu', 'Cocktails', 12, NULL, 'Signature', 1),
  ('Caïpirinha', 'Cachaça, Citron vert, Sucre de canne', 'Cocktails', 12, NULL, NULL, 2),
  ('Cuba Libre', 'Citron vert, Coca Cola, Havana Club', 'Cocktails', 12, NULL, NULL, 3),
  ('French', 'Bombay Gin, Citron vert, Sucre de canne, Champagne', 'Cocktails', 12, NULL, 'Signature', 4),
  ('Gin Tonic', 'Gordons, Tonic, Rondelle d''orange, Rondelle concombre', 'Cocktails', 12, NULL, NULL, 5),
  ('London Mule', 'Bombay Gin, Citron vert, Ginger beer', 'Cocktails', 12, NULL, NULL, 6),
  ('Long Island', 'Vodka Smirnoff, Tequila Blanco', 'Cocktails', 12, NULL, NULL, 7),
  ('Margarita', 'Tequila Blanco, Cointreau, Jus de citron', 'Cocktails', 12, NULL, NULL, 8),
  ('Mojito', 'Havana Club, Citron vert, Sucre de canne, Menthe fraîche, Limonade', 'Cocktails', 12, NULL, 'Best-seller', 9),
  ('Moscow Mule', 'Vodka Absolut, Citron vert, Ginger beer', 'Cocktails', 12, NULL, NULL, 10),
  ('Pina Colada', 'Havana Club, Jus d''ananas, Sirop de coco, Crème liquide', 'Cocktails', 12, NULL, NULL, 11),
  ('Pink Paradise', 'Vodka Smirnoff, Limonade, Fraise/Grenadine', 'Cocktails', 12, NULL, NULL, 12),
  ('Sex On The Beach', 'Vodka Smirnoff, Jus d''ananas, Jus de cranberry, Crème de pêche', 'Cocktails', 12, NULL, NULL, 13),
  ('Spritz', 'Aperol, Prosecco, Soda, Rondelle d''orange', 'Cocktails', 12, NULL, 'Best-seller', 14),
  ('Tequila Sunrise', 'Tequila Blanco, Jus d''orange, Sirop de grenadine', 'Cocktails', 12, NULL, NULL, 15),
  ('Punch', 'Préparation maison à partager', 'Cocktails', 25, NULL, 'Signature', 16),

  -- DIGESTIF
  ('Cognac', NULL, 'Digestif', 10, NULL, NULL, 1),
  ('Cognac XO', NULL, 'Digestif', 20, NULL, 'Premium', 2),
  ('Get 27 / Get 31', NULL, 'Digestif', 6, NULL, NULL, 3),
  ('Porto blanc', NULL, 'Digestif', 6, NULL, NULL, 4),

  -- APÉRITIF
  ('Martini', 'Blanc ou rouge', 'Apéritif', 6.50, NULL, NULL, 1),
  ('Ricard', NULL, 'Apéritif', 6.50, NULL, NULL, 2),

  -- ALCOOL
  ('Smirnoff', 'Verre / Bouteille', 'Alcool', 10, 80, NULL, 1),
  ('Havana Club', 'Verre / Bouteille', 'Alcool', 10, 80, NULL, 2),
  ('Old Nick', 'Verre / Bouteille', 'Alcool', 10, 80, NULL, 3),
  ('Clan Campbell', 'Verre / Bouteille', 'Alcool', 10, 80, NULL, 4),
  ('Gibson', 'Verre / Bouteille', 'Alcool', 10, 80, NULL, 5),
  ('Vodka Absolut', 'Verre / Bouteille (+1€ accompagnement)', 'Alcool', 10, 80, NULL, 6),

  -- ALCOOL SUPÉRIEUR
  ('Jack Daniel''s', 'Verre / Bouteille', 'Alcool supérieur', 10, 100, NULL, 1),
  ('Jack Honey', 'Verre / Bouteille', 'Alcool supérieur', 10, 100, NULL, 2),
  ('Bombay', 'Verre / Bouteille', 'Alcool supérieur', 10, 100, NULL, 3),
  ('Chivas', 'Verre / Bouteille', 'Alcool supérieur', 10, 100, NULL, 4),
  ('Saint James', 'Verre / Bouteille', 'Alcool supérieur', 10, 100, NULL, 5),
  ('Yu Gin', 'Verre / Bouteille', 'Alcool supérieur', 10, 100, NULL, 6),
  ('Belvédère', 'Verre / Bouteille', 'Alcool supérieur', 10, 100, NULL, 7),
  ('Haig Club', 'Verre / Bouteille', 'Alcool supérieur', 10, 100, NULL, 8),
  ('San José', 'Verre / Bouteille', 'Alcool supérieur', 10, 100, NULL, 9),
  ('Cîroc', 'Bouteille 70cl', 'Alcool supérieur', NULL, 110, 'Premium', 10),

  -- CHAMPAGNE
  ('Coupe de Champagne', 'Sélection maison', 'Champagne', 12, NULL, 'Best-seller', 1),
  ('Moët et Chandon', 'Bouteille 75cl', 'Champagne', NULL, 100, 'Premium', 2),
  ('Veuve Cliquot', 'Bouteille 75cl', 'Champagne', NULL, 130, 'Premium', 3),
  ('Ruinart', 'Bouteille 75cl', 'Champagne', NULL, 150, 'Premium', 4),
  ('Dom Pérignon', 'Bouteille 75cl', 'Champagne', NULL, 300, 'Premium', 5),

  -- VINS
  ('AOC Brouilly', '7 / 13,50 / 20 / 31€ — 14cl·28cl·50cl·75cl', 'Vins', 7, NULL, NULL, 1),
  ('Bordeaux', '5 / 9,50 / 15 / 25€', 'Vins', 5, NULL, NULL, 2),
  ('Chablis', '8 / 15,50 / 25 / 38€', 'Vins', 8, NULL, NULL, 3),
  ('Chardonnay / Vouvray', '5,50 / 10 / 17,50 / 28€', 'Vins', 5.50, NULL, NULL, 4),
  ('Chinon Bourgueil', 'Bouteille 75cl', 'Vins', NULL, 28, NULL, 5),
  ('Côte du Rhône', 'Bouteille 75cl', 'Vins', NULL, 28, NULL, 6),
  ('Monbazillac / Coteaux du Layon', '7 / 13,50 / 20 / 31€', 'Vins', 7, NULL, NULL, 7),

  -- SHOOTERS
  ('Shooter', 'Les 10 verres : 40€', 'Shooters', 5, NULL, NULL, 1),
  ('Jäger Shooter', 'Les 10 verres : 50€', 'Shooters', 6, NULL, NULL, 2),

  -- BIÈRES
  ('Heineken', 'Bouteille', 'Bières', 6, NULL, NULL, 1),
  ('Desperados', 'Bouteille aromatisée tequila', 'Bières', 6, NULL, NULL, 2),
  ('Leffe', 'Bouteille d''abbaye', 'Bières', 6, NULL, NULL, 3);

-- ─────────────────────────────────────────────────────
-- NOTE : Pour définir un administrateur
-- Après création du compte dans Supabase Auth, exécutez :
-- UPDATE profiles SET is_admin = TRUE WHERE email = 'votre@email.com';
-- ─────────────────────────────────────────────────────
