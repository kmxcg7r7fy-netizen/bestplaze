-- Supprime la colonne telephone de la table profiles
-- Le champ téléphone a été retiré du flux d'inscription et du profil utilisateur.
ALTER TABLE profiles DROP COLUMN IF EXISTS telephone;
