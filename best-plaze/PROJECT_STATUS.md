# Best Plaze — État du projet

> Fichier de continuité entre sessions Claude. Mis à jour le **2026-05-12**.
> Lis ce fichier en premier à chaque nouvelle session pour reprendre le fil.

---

## 1. Vue d'ensemble

- **Client :** XI BestPlaze (Resto-Lounge à Tours, 56 Rue de Suède)
- **Agence :** Treeflow Agency (contact@treeflow.fr)
- **Stack :** Next.js 16.2.1 · React 19 · Supabase (Auth + Postgres + Storage) · Stripe (Checkout + Connect) · Tailwind 4 · Zod
- **Hébergement :** Vercel (déploiement auto depuis `main` sur GitHub)
- **Branche actuelle :** `main` (à jour avec `origin/main`)
- **Dernier commit :** `eb0d4be Initial commit - BestPlaze production ready`

## 2. Architecture en place

### Côté public
- `/` — Home avec hero, cocktails signatures, événements à venir
- `/events` — Liste filtrée des événements (lit Supabase, fallback mock)
- `/menu` — Carte complète
- `/reservation` — Formulaire 4 étapes + checkout Stripe
- `/reservation/success` · `/reservation/cancel` — pages retour Stripe
- `/account` · `/account/login` · `/account/register` — auth client

### Côté admin (`/admin/*`)
- `/admin` — Dashboard (résa du jour, semaine, revenus)
- `/admin/reservations` — Liste + filtres + actions (confirmer / annuler / no-show / terminée)
- `/admin/events` — CRUD complet + upload photo Supabase Storage ⚠️ non commité
- `/admin/menu` — **Lecture + toggle dispo + édition prix** uniquement (pas de création / suppression)
- `/admin/settings` — Paramètres (acompte, capacités, message confirmation)
- `/admin/setup` — Setup initial (compte admin + Stripe Connect + acompte)
- `/admin/demo` — Page démo (visible en dev ou via `NEXT_PUBLIC_ADMIN_DEMO=true`)
- `/admin/login` — Login admin

### API routes
- `POST /api/reservations` — crée une réservation
- `GET/PATCH/DELETE /api/reservations/[id]` — détail / mise à jour
- `POST /api/checkout` — crée la session Stripe Checkout (avec `transfer_data` vers Stripe Connect du bar)
- `POST /api/checkout/confirm` — confirmation
- `POST /api/stripe/webhook` — handle `checkout.session.completed`, `payment_failed`, `session.expired`
- `GET /api/stripe/connect/authorize` — démarre OAuth Stripe Connect (génère state CSRF)
- `GET /api/stripe/connect/callback` — retour OAuth
- `POST /api/admin/setup` — crée le compte admin initial

### Base de données (Supabase)
Migrations dans `supabase/migrations/` :
- `001_create_reservations.sql` + `002_reservations_rls_policies.sql` — initiales (probablement obsolètes)
- `003_full_schema.sql` — **schéma complet** : `profiles`, `reservations`, `events`, `menu_items`, `admin_settings` + RLS + triggers + seed menu (60+ items)
- `004_onboarding.sql` — colonnes setup/Stripe Connect dans `admin_settings`
- `005_storage.sql` — bucket `events` pour images (5 Mo max, jpeg/png/webp/gif) ⚠️ non commité

## 3. État du Git

**Branche propre.** Dernier commit : `9d47584 chore(deps): npm uninstall stripe` — pushé le 2026-05-12.

Migrations à appliquer dans Supabase Studio :
- `005_storage.sql` — bucket images événements (si pas encore fait)
- `006_remove_stripe.sql` — drop colonnes Stripe ⚠️ **à appliquer avant de créer de nouvelles réservations**

## 4. Variables d'environnement

`.env.example` documenté. `.env.local` contient des **placeholders** `REMPLACE_PAR_…` — il faudra confirmer que les vraies clés sont bien configurées dans Vercel.

Liste :
- `NEXT_PUBLIC_SUPABASE_URL` ✅ rempli (bsmivfberoyziqvzuaeu.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ⚠️ placeholder
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ placeholder
- `STRIPE_SECRET_KEY` ⚠️ placeholder
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ⚠️ placeholder
- `STRIPE_WEBHOOK_SECRET` ⚠️ placeholder
- `STRIPE_CLIENT_ID` ⚠️ placeholder (Stripe Connect)
- `NEXT_PUBLIC_APP_URL` ✅ `http://localhost:3000` (à passer en URL prod sur Vercel)
- `ADMIN_EMAIL` ⚠️ placeholder

## 5. Demandes client (note du 4 mai 2026)

Statut : ✅ fait · 🚧 en cours · ❌ à faire · 🔄 à modifier

| # | Demande | Statut | Action concrète |
|---|---|---|---|
| 1 | **Supprimer totalement le paiement Stripe** | ✅ | Fait le 2026-05-12 — routes supprimées, lib supprimée, wizard 2 étapes, résa directe via /api/reservations, migration 006 (à appliquer en prod), npm uninstall stripe |
| 2 | **Calendrier privatisation de salle + formulaire public de demande** | ✅ | Page `/privatisation` + API + admin `/admin/privatisations` — commité 2026-05-12 |
| 3 | Modifier les événements depuis le compte pro | ✅ | CRUD + upload photos Supabase Storage — commité 2026-05-12 |
| 4 | Localisation apparente | ✅ | Badge adresse + lien Google Maps dans le hero — commité 2026-05-12 |
| 5 | **Griser dates fermées (admin) + créneaux pleins (capacité) + interface admin pour gérer les fermetures** | ✅ | Table `closures` + UI admin + logique capacité côté API et formulaire — commité 2026-05-12 |
| 6 | Email ou téléphone facultatif (l'un des deux) | ✅ | `reservationSchema` + API `/api/reservations` corrigée — 2026-05-12 |
| 7 | Enlever le footer noir et or | ✅ | Footer simplifié en barre légère 1 ligne — 2026-05-12 |
| 8 | "Pour réservations spéciales, contacter l'équipe" | ✅ | Encart contact ajouté dans la page `/reservation` |
| 9 | Horaires 18h–2h mardi-samedi, modifiables en admin | ✅ | Valeurs correctes dans `brand.openingHours` + l'admin_settings est modifiable via `/admin/settings` |
| 10 | Création de l'espace admin | ✅ | Existant et complet |
| 11 | Sur la home, juste "Lounge" en haut (pas "Resto-Lounge") | ✅ | `brand.baseline` → "Lounge · Cocktails & Saveurs" — 2026-05-12 |
| 12 | Pré-remplissage du formulaire résa après clic sur un événement | ✅ | Query params `?date=…&time=…&title=…` consommés par `/reservation` — commité 2026-05-12 |
| 13 | Cocktails populaires : gérer l'entièreté du menu en admin | ✅ | CRUD complet `/admin/menu` — commité 2026-05-12 |

## 6. Risques / points à vérifier

- **Clés sensibles** : `.env.local` est en placeholders. Vérifier que Vercel a bien toutes les vraies clés en variables d'environnement, sinon le site ne fonctionne pas en prod.
- **Stripe Connect** : si on supprime le paiement (demande #1), tout le flux Connect devient obsolète et peut être retiré (`/admin/setup` étape 3, table `admin_settings.stripe_*`, routes `/api/stripe/connect/*`).
- **Migrations** : 001 et 002 sont vraisemblablement remplacées par 003. Confirmer qu'elles ne sont pas appliquées sur Supabase prod (sinon possibles conflits).
- **Mocks vs Supabase** : la home (`/`) utilise toujours les mocks (`@/data/mock`) pour les événements, contrairement à `/events` qui lit Supabase. Cohérence à arbitrer.
- **Build prod** : ✅ vérifié — `npm run lint` (0 erreurs) + `npm run build` passent au 2026-05-12.

## 7. Prochaines étapes recommandées (priorisé)

1. ✅ Stripe supprimé (2026-05-12)
2. **Quick wins UI** (#11, #7, #9, #6, #8, #4) — modifications ciblées, peu risquées.
3. **CRUD complet /admin/menu** (#13).
4. **Closures + capacités** (#5 — calendrier admin + créneaux grisés).
5. **Pré-remplissage résa depuis événement** (#12).
6. **Privatisation** (#2 — la plus grosse, phase 6).

## 8. Comment relancer le projet

```bash
cd best-plaze
npm install
npm run dev    # http://localhost:3000
```

Pour déployer une modif :
```bash
git add .
git commit -m "feat: …"
git push      # Vercel redéploie automatiquement
```

---

*Maintenu par les sessions Claude pour assurer la continuité du travail sur Best Plaze.*
