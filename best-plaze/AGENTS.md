# Agents — Conventions pour Claude Code, Cursor et autres IA

> **Lis d'abord `PROJECT_STATUS.md`** à la racine pour connaître l'état actuel du projet,
> les modifs en cours et les demandes client.

## 0. Stack

- **Next.js 16.2.1** (App Router) — ⚠️ version récente avec breaking changes ;
  avant d'écrire du code qui touche au routing, aux Server Actions ou au cache,
  vérifier `node_modules/next/dist/docs/` plutôt que se fier à la mémoire.
- **React 19.2.4** (hooks et Server Components)
- **Supabase** : `@supabase/ssr` pour les helpers cookies, `@supabase/supabase-js` pour le client.
- **Stripe 22** (Checkout + Connect) — peut être supprimé selon demande client #1.
- **Tailwind 4** (PostCSS) — pas de `tailwind.config.js` traditionnel, c'est `@tailwindcss/postcss`.
- **Zod 4** pour la validation côté API.
- **TypeScript 5**, strict.

## 1. Structure du projet

```
src/
├── app/                  # App Router (pages + API routes)
│   ├── admin/            # Espace admin (auth requise via proxy.ts)
│   ├── api/              # Routes API (Stripe, reservations, setup)
│   ├── account/          # Auth client (login/register)
│   ├── events/, menu/, reservation/   # Pages publiques
│   ├── layout.tsx        # Layout racine + nav publique
│   └── page.tsx          # Home
├── components/
│   ├── admin/, branding/, events/, menu/, nav/, reservation/, shell/
│   └── ui/               # Primitives (Button, Card, Input, Badge, Tabs, etc.)
├── data/mock.ts          # Données de démo (encore utilisées sur la home)
├── lib/
│   ├── supabase/
│   │   ├── browser.ts    # client public (anon key)
│   │   ├── server.ts     # client côté serveur avec cookies (RLS)
│   │   └── admin.ts      # service_role (bypass RLS — usage strict API only)
│   ├── stripe.ts         # singleton Stripe
│   ├── validations.ts    # schémas Zod
│   └── cn.ts             # helper clsx + tailwind-merge
├── proxy.ts              # middleware d'auth (gating /admin sur setup_complete)
└── types/                # types partagés
supabase/migrations/      # SQL versionné — à appliquer manuellement dans Supabase Studio
scripts/                  # scripts ponctuels (setup, image transparente)
```

## 2. Conventions de code

### TypeScript
- Tous les fichiers en `.ts` / `.tsx`, jamais `.js`.
- Types explicites sur les exports publics ; inférence OK en local.
- Préférer `type` à `interface` pour la cohérence (existant).
- Pas de `any` ; utiliser `unknown` + narrowing.

### Style
- Imports alphabétiques par groupe : externe → `@/...` → relatifs.
- Composants : `function ComponentName()` (déclaration), pas d'arrow component exporté par défaut sauf pour les pages.
- Pages App Router : `export default function PageName()`.
- Routes API : `export async function GET|POST|...`.

### Tailwind
- Classes triées par ordre logique : layout → spacing → typo → couleurs → états.
- Palette projet : `bp-gold`, `bp-gold-2`, `bp-text`, `bp-text-2`, `bp-muted` (définies dans `globals.css` via `@theme`).
- Utiliser `cn()` (de `@/lib/cn`) pour la composition conditionnelle de classes.

### Supabase
- **Côté client (browser) :** `getBrowserSupabaseClient()` depuis `@/lib/supabase/browser`.
- **Côté serveur authentifié (RLS appliquée) :** `getServerSupabaseClient()` depuis `@/lib/supabase/server`.
- **Côté serveur admin (bypass RLS) :** `getSupabaseAdmin()` depuis `@/lib/supabase/admin` — **uniquement dans les routes API**, jamais dans un Server Component qui pourrait fuiter.
- Toujours typer le retour des `select()` avec un type local — Supabase ne génère pas de types pour l'instant.

### Validation
- Toute entrée utilisateur (formulaire, API body) **doit** passer par Zod.
- Schémas centralisés dans `src/lib/validations.ts`.

### API routes
- Toujours retourner `NextResponse.json({...}, { status: NNN })`.
- Erreurs côté serveur : `console.error` + réponse JSON générique (ne pas leak de détails internes).
- Pour Stripe webhook : runtime `nodejs`, lire `request.text()` brut pour la signature.

### RLS
- Toutes les tables ont RLS activée (voir `003_full_schema.sql`).
- Les routes API qui doivent bypass RLS utilisent `getSupabaseAdmin` ; tout le reste passe par les helpers `browser` ou `server` qui respectent les policies.

## 3. Git / déploiement

- **Branche principale :** `main`. Vercel auto-déploie sur push.
- **Commits :** style Conventional Commits français (`feat:`, `fix:`, `chore:`, `refactor:`, etc.).
- **Avant de push :** `npm run lint` et idéalement `npm run build` localement.
- **Migrations Supabase :** numérotées `00X_description.sql`, appliquées manuellement dans Supabase Studio → SQL Editor. Documenter dans PROJECT_STATUS.md quand une nouvelle migration doit être passée.

## 4. Variables d'environnement

Voir `.env.example`. Les valeurs réelles sont dans **Vercel** (Settings → Environment Variables) pour la prod. En local, `.env.local` (gitignoré). Ne jamais commiter de vraies clés.

## 5. Choses à ne PAS faire

- Ne pas inventer d'APIs Next.js : la 16 a des breaking changes. En cas de doute, lire `node_modules/next/dist/docs/`.
- Ne pas exposer `SUPABASE_SERVICE_ROLE_KEY` ni `STRIPE_SECRET_KEY` dans un composant client.
- Ne pas créer de fichier `.md` de doc à la racine sans le mentionner — préférer mettre à jour `PROJECT_STATUS.md`.
- Ne pas committer `.next/`, `node_modules/`, `.env*` (déjà dans `.gitignore`).
- Ne pas régresser sur les RLS policies sans raison documentée.
- Ne pas remplacer le pattern existant de gestion d'erreur côté API sans concertation.

## 6. Workflow recommandé pour une nouvelle tâche

1. Lire `PROJECT_STATUS.md` (section 5 = demandes client priorisées).
2. Identifier la demande à traiter, vérifier qu'elle n'est pas déjà partiellement faite (regarder les diffs non commités).
3. Faire la modif en suivant les conventions ci-dessus.
4. Tester localement : `npm run dev`, parcourir le flux affecté.
5. Lancer `npm run lint`.
6. Commit conventionnel + push.
7. Mettre à jour `PROJECT_STATUS.md` (passer la ligne du tableau en ✅ ou 🚧).

## 7. Contacts

- Agence : Treeflow Agency — contact@treeflow.fr
- Client final : XI BestPlaze (resto-lounge à Tours)
