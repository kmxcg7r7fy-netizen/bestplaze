#!/usr/bin/env node
/**
 * Script de setup production — XI BestPlaze
 * ==========================================
 * Exécute dans l'ordre :
 *   1. Migration SQL Supabase (003_full_schema.sql)
 *   2. Enregistrement du webhook Stripe
 *   3. Promotion du compte admin dans Supabase
 *
 * Usage :
 *   node scripts/setup.mjs
 *
 * Prérequis : remplir .env.local avec les vraies clés avant de lancer.
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── 1. Charger .env.local ──────────────────────────────────────────────────
const envPath = resolve(ROOT, ".env.local");
if (!existsSync(envPath)) {
  console.error("❌  .env.local introuvable — crée-le d'abord.");
  process.exit(1);
}

const env = {};
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
}

const {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY,
  NEXT_PUBLIC_APP_URL: APP_URL,
  ADMIN_EMAIL,
} = env;

// ── Vérifications ──────────────────────────────────────────────────────────
const missing = [];
if (!SUPABASE_URL || SUPABASE_URL.includes("REMPLACE")) missing.push("NEXT_PUBLIC_SUPABASE_URL");
if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY.includes("REMPLACE")) missing.push("SUPABASE_SERVICE_ROLE_KEY");
if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes("REMPLACE")) missing.push("STRIPE_SECRET_KEY");
if (!APP_URL || APP_URL.includes("localhost")) {
  console.warn("⚠️   NEXT_PUBLIC_APP_URL est localhost — le webhook Stripe ne peut pas pointer vers localhost.");
  console.warn("    Pour le dev local, utilise Stripe CLI : stripe listen --forward-to localhost:3000/api/stripe/webhook");
}
if (!ADMIN_EMAIL || ADMIN_EMAIL.includes("ton@")) missing.push("ADMIN_EMAIL");

if (missing.length) {
  console.error("❌  Variables manquantes ou non renseignées dans .env.local :");
  missing.forEach((k) => console.error(`   • ${k}`));
  process.exit(1);
}

// ── 2. Migration SQL ───────────────────────────────────────────────────────
console.log("\n📦  Étape 1/3 — Exécution de 003_full_schema.sql...");

const sqlPath = resolve(ROOT, "supabase/migrations/003_full_schema.sql");
const sql = readFileSync(sqlPath, "utf-8");

const migRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  },
  body: JSON.stringify({ query: sql }),
}).catch(() => null);

if (!migRes || !migRes.ok) {
  // Fallback : essayer via l'API admin SQL de Supabase
  const mgmtRes = await fetch(
    `${SUPABASE_URL.replace(".supabase.co", "")}/pg/query`.replace(
      "https://",
      "https://api.supabase.com/v1/projects/",
    ),
    { method: "POST" },
  ).catch(() => null);

  console.warn("⚠️   L'API RPC exec_sql n'est pas disponible (c'est normal sur Supabase Cloud).");
  console.warn("    Exécute manuellement dans Supabase → SQL Editor :");
  console.warn(`    Fichier : supabase/migrations/003_full_schema.sql`);
  console.warn("    (copie le contenu du fichier et colle-le dans l'éditeur)\n");
} else {
  console.log("✅  Migration SQL exécutée.");
}

// ── 3. Webhook Stripe ──────────────────────────────────────────────────────
console.log("💳  Étape 2/3 — Enregistrement du webhook Stripe...");

const webhookUrl = `${APP_URL}/api/stripe/webhook`;
const isLocalhost = APP_URL.includes("localhost") || APP_URL.includes("127.0.0.1");

if (isLocalhost) {
  console.warn("⚠️   URL locale détectée — Stripe ne peut pas appeler localhost.");
  console.warn("    Pour tester en local, utilise Stripe CLI :");
  console.warn("      stripe listen --forward-to localhost:3000/api/stripe/webhook");
  console.warn("    Le secret affiché commence par whsec_ — copie-le dans STRIPE_WEBHOOK_SECRET.\n");
} else {
  // Chercher si un webhook existe déjà pour cette URL
  const listRes = await fetch("https://api.stripe.com/v1/webhook_endpoints?limit=100", {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  const listData = await listRes.json();

  const existing = listData.data?.find((wh) => wh.url === webhookUrl);

  if (existing) {
    console.log(`✅  Webhook déjà enregistré : ${webhookUrl}`);
    console.log(`   ID : ${existing.id}`);
    console.warn("   ⚠️  Le secret webhook ne peut pas être relu — s'il manque dans .env.local,");
    console.warn("      supprime ce webhook dans le dashboard Stripe et relance ce script.");
  } else {
    const createRes = await fetch("https://api.stripe.com/v1/webhook_endpoints", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        url: webhookUrl,
        "enabled_events[]": "checkout.session.completed",
        "enabled_events[]": "payment_intent.payment_failed",
        "enabled_events[]": "checkout.session.expired",
      }),
    });

    const wh = await createRes.json();

    if (wh.id) {
      console.log(`✅  Webhook créé : ${webhookUrl}`);
      console.log(`   ID     : ${wh.id}`);
      console.log(`   Secret : ${wh.secret}`);
      console.log("\n   ⚠️  IMPORTANT — Copie ce secret dans .env.local :");
      console.log(`   STRIPE_WEBHOOK_SECRET=${wh.secret}\n`);
    } else {
      console.error("❌  Erreur Stripe :", JSON.stringify(wh, null, 2));
    }
  }
}

// ── 4. Promotion admin ─────────────────────────────────────────────────────
console.log(`👤  Étape 3/3 — Promotion admin pour ${ADMIN_EMAIL}...`);

const adminRes = await fetch(
  `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(ADMIN_EMAIL)}`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({ is_admin: true }),
  },
);

const adminData = await adminRes.json();

if (!adminRes.ok) {
  console.error("❌  Erreur Supabase :", JSON.stringify(adminData, null, 2));
  console.warn("   Le compte n'existe peut-être pas encore — crée-le d'abord via /account/register");
  console.warn(`   puis relance ce script, ou exécute dans SQL Editor :`);
  console.warn(`   UPDATE profiles SET is_admin = TRUE WHERE email = '${ADMIN_EMAIL}';`);
} else if (Array.isArray(adminData) && adminData.length === 0) {
  console.warn(`⚠️   Aucun profil trouvé pour ${ADMIN_EMAIL}.`);
  console.warn("   Inscris-toi d'abord via /account/register puis relance ce script.");
  console.warn(`   Ou exécute dans SQL Editor :`);
  console.warn(`   UPDATE profiles SET is_admin = TRUE WHERE email = '${ADMIN_EMAIL}';`);
} else {
  console.log(`✅  Compte ${ADMIN_EMAIL} promu administrateur.`);
}

console.log("\n🎉  Setup terminé !");
console.log("   Lance le serveur : npm run dev");
console.log("   Accès admin     : http://localhost:3000/admin");
