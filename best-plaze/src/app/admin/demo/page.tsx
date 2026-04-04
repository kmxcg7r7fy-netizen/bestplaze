"use client";

import { useEffect, useState } from "react";
import { Loader, Trash2, Plus, RefreshCw, CheckSquare, Square } from "lucide-react";
import { Button }       from "@/components/ui/Button";
import { Card }         from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

// ─── Blocage production ───────────────────────────────────────────────────────

const IS_PROD = process.env.NODE_ENV === "production";

// ─── Checklist ────────────────────────────────────────────────────────────────

const CHECKLIST: { id: string; category: string; label: string }[] = [
  // Parcours client
  { id: "c1",  category: "Parcours client",  label: "Création de compte fonctionne" },
  { id: "c2",  category: "Parcours client",  label: "Connexion fonctionne" },
  { id: "c3",  category: "Parcours client",  label: "Mot de passe oublié fonctionne" },
  { id: "c4",  category: "Parcours client",  label: "Formulaire réservation étape 1 fonctionne" },
  { id: "c5",  category: "Parcours client",  label: "Pré-sélection cocktails fonctionne" },
  { id: "c6",  category: "Parcours client",  label: "Total estimatif se calcule correctement" },
  { id: "c7",  category: "Parcours client",  label: "Session Stripe se crée" },
  { id: "c8",  category: "Parcours client",  label: "Paiement test réussi → statut confirmee" },
  { id: "c9",  category: "Parcours client",  label: "Page /account affiche la réservation" },
  { id: "c10", category: "Parcours client",  label: "Email de confirmation reçu" },
  // Parcours admin
  { id: "a1",  category: "Parcours admin",   label: "Login admin fonctionne" },
  { id: "a2",  category: "Parcours admin",   label: "Dashboard affiche les stats" },
  { id: "a3",  category: "Parcours admin",   label: "Réservation apparaît dans la liste" },
  { id: "a4",  category: "Parcours admin",   label: "Changement de statut fonctionne" },
  { id: "a5",  category: "Parcours admin",   label: "Création d'événement fonctionne" },
  { id: "a6",  category: "Parcours admin",   label: "Événement apparaît sur la page publique" },
  { id: "a7",  category: "Parcours admin",   label: "Paramètres Stripe accessibles" },
  // Mobile
  { id: "m1",  category: "Mobile",           label: "Navbar hamburger fonctionne" },
  { id: "m2",  category: "Mobile",           label: "Formulaire réservation utilisable" },
  { id: "m3",  category: "Mobile",           label: "Carte lisible" },
  { id: "m4",  category: "Mobile",           label: "Admin utilisable" },
];

// ─── Données test ─────────────────────────────────────────────────────────────

const ESPACES = ["Lounge", "Terrasse", "Salle"] as const;
const OCCASIONS = ["Anniversaire", "Dîner d'affaires", "Saint-Valentin", null, null] as const;
const STATUTS   = ["en_attente", "confirmee", "terminee"] as const;
const NOMS = ["Martin", "Dupont", "Bernard", "Moreau", "Petit", "Durand", "Leroy", "Simon"];
const PRENOMS = ["Sophie", "Lucas", "Emma", "Hugo", "Léa", "Gabriel", "Chloé", "Nathan"];

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function addDays(d: Date, n: number): string {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r.toISOString().split("T")[0];
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminDemoPage() {
  const [status, setStatus]   = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  // Charger l'état de la checklist depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bp_demo_checklist");
      if (saved) setChecked(new Set(JSON.parse(saved) as string[]));
    } catch { /* ignore */ }
  }, []);

  function toggleCheck(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("bp_demo_checklist", JSON.stringify([...next]));
      return next;
    });
  }

  function resetChecklist() {
    setChecked(new Set());
    localStorage.removeItem("bp_demo_checklist");
  }

  if (IS_PROD) {
    return (
      <div className="flex min-h-screen items-center justify-center text-center">
        <div className="space-y-4">
          <p className="font-serif text-[24px] text-bp-text">Page non disponible</p>
          <p className="text-bp-muted">La page de démonstration n&apos;est accessible qu&apos;en développement.</p>
          <Button href="/admin" variant="secondary">Retour au dashboard</Button>
        </div>
      </div>
    );
  }

  const supabase = getBrowserSupabaseClient();

  async function run(key: string, fn: () => Promise<string>) {
    setLoading(key);
    setStatus(null);
    try {
      const msg = await fn();
      setStatus(`✅ ${msg}`);
    } catch (e) {
      setStatus(`❌ ${e instanceof Error ? e.message : "Erreur inconnue"}`);
    } finally {
      setLoading(null);
    }
  }

  async function resetData() {
    return run("reset", async () => {
      const { error: rErr } = await supabase
        .from("reservations")
        .delete()
        .ilike("email", "%@test.com");
      if (rErr) throw new Error(rErr.message);

      const { error: eErr } = await supabase
        .from("events")
        .delete()
        .ilike("titre", "%(test)%");
      if (eErr) throw new Error(eErr.message);

      return "Données de test supprimées";
    });
  }

  async function generateReservations() {
    return run("reservations", async () => {
      const today = new Date();
      const rows = Array.from({ length: 10 }, (_, i) => {
        const prenom = randomItem(PRENOMS);
        const nom    = randomItem(NOMS);
        const daysOffset = i < 5 ? i + 1 : -(i - 4); // 5 futures, 5 passées
        return {
          prenom,
          nom,
          email:            `${prenom.toLowerCase()}.${nom.toLowerCase()}@test.com`,
          telephone:        `06 ${String(Math.floor(10000000 + Math.random() * 89999999)).replace(/(\d{2})(?=\d)/g, "$1 ")}`,
          date_reservation: addDays(today, daysOffset),
          heure:            randomItem(["19:00", "20:00", "21:00", "22:00"]),
          nb_personnes:     Math.floor(2 + Math.random() * 8),
          espace:           randomItem(ESPACES),
          occasion:         randomItem(OCCASIONS),
          statut:           daysOffset < 0 ? "terminee" : randomItem(STATUTS),
          stripe_payment_status: daysOffset < 0 ? "paid" : "unpaid",
          total_estimatif:  Math.floor(20 + Math.random() * 180),
        };
      });

      const { error } = await supabase.from("reservations").insert(rows);
      if (error) throw new Error(error.message);
      return "10 réservations de test créées";
    });
  }

  async function generateEvents() {
    return run("events", async () => {
      const today = new Date();
      const events = [
        {
          titre:       "DJ Set Afrobeats (test)",
          description: "Une soirée explosive avec les meilleurs sons afrobeats du moment.",
          date:        addDays(today, 3),
          heure_debut: "22:00",
          heure_fin:   "04:00",
          type:        "DJ Set",
          dress_code:  "Tenue élégante",
          prix_entree: 10,
          a_la_une:    true,
          statut:      "published",
        },
        {
          titre:       "Afterwork Jeudi (test)",
          description: "Décompressez en bonne compagnie après une semaine chargée.",
          date:        addDays(today, 7),
          heure_debut: "18:00",
          heure_fin:   "23:00",
          type:        "Afterwork",
          dress_code:  null,
          prix_entree: 0,
          a_la_une:    false,
          statut:      "published",
        },
        {
          titre:       "Soirée Années 90 (test)",
          description: "Retour en arrière avec les classiques des années 90.",
          date:        addDays(today, 14),
          heure_debut: "21:00",
          heure_fin:   "03:00",
          type:        "Soirée à thème",
          dress_code:  "Style années 90 bienvenu",
          prix_entree: 5,
          a_la_une:    true,
          statut:      "published",
        },
      ];

      const { error } = await supabase.from("events").insert(events);
      if (error) throw new Error(error.message);
      return "3 événements de test créés";
    });
  }

  // Regrouper la checklist par catégorie
  const categories = [...new Set(CHECKLIST.map((c) => c.category))];
  const totalDone  = checked.size;
  const total      = CHECKLIST.length;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start justify-between">
        <SectionTitle eyebrow="Développement" title="Mode Démo" />
        <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-[11px] uppercase tracking-widest text-yellow-400">
          Dev only
        </span>
      </div>

      {/* Status bar */}
      {status && (
        <div className={`rounded-2xl border p-3 text-[13px] ${status.startsWith("✅")
          ? "border-green-500/20 bg-green-500/10 text-green-400"
          : "border-red-500/20 bg-red-500/10 text-red-400"}`}>
          {status}
        </div>
      )}

      {/* ── Section 1 : Actions ────────────────────────────────────────── */}
      <Card className="p-6 space-y-5">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Données de test</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            onClick={resetData}
            disabled={!!loading}
            className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-[13px] text-red-400 hover:bg-red-500/15 transition disabled:opacity-50"
          >
            {loading === "reset"
              ? <Loader className="h-4 w-4 animate-spin" />
              : <Trash2 className="h-4 w-4" />
            }
            Reset données test
          </button>

          <button
            onClick={generateReservations}
            disabled={!!loading}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-bp-text hover:bg-white/8 transition disabled:opacity-50"
          >
            {loading === "reservations"
              ? <Loader className="h-4 w-4 animate-spin" />
              : <Plus className="h-4 w-4" />
            }
            10 réservations
          </button>

          <button
            onClick={generateEvents}
            disabled={!!loading}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-bp-text hover:bg-white/8 transition disabled:opacity-50"
          >
            {loading === "events"
              ? <Loader className="h-4 w-4 animate-spin" />
              : <RefreshCw className="h-4 w-4" />
            }
            3 événements
          </button>
        </div>

        <p className="text-[11px] text-bp-muted">
          Les réservations utilisent des emails <code>@test.com</code>. Les événements contiennent <code>(test)</code> dans le titre. Le bouton Reset supprime uniquement ces entrées.
        </p>
      </Card>

      {/* ── Section 2 : Compte client test ────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Compte client de test</p>
        <div className="grid gap-3 sm:grid-cols-2 text-[13px]">
          {[
            ["Email",          "demo@bestplaze-test.com"],
            ["Mot de passe",   "Demo2026!"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-bp-muted mb-1">{k}</p>
              <code className="text-bp-text font-mono">{v}</code>
            </div>
          ))}
        </div>
        <Button href="/account/login" variant="secondary" className="text-[13px]">
          Ouvrir la page de connexion →
        </Button>
      </Card>

      {/* ── Section 3 : Cartes Stripe test ────────────────────────────── */}
      <Card className="p-6 space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Cartes de test Stripe</p>
        <div className="space-y-2 text-[13px]">
          {[
            { label: "✅ Paiement réussi",     num: "4242 4242 4242 4242", color: "text-green-400" },
            { label: "❌ Carte refusée",        num: "4000 0000 0000 0002", color: "text-red-400" },
            { label: "🔐 3D Secure requis",    num: "4000 0025 0000 3155", color: "text-yellow-400" },
          ].map(({ label, num, color }) => (
            <div key={num} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-3">
              <span className={color}>{label}</span>
              <code className="font-mono text-bp-text">{num}</code>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-bp-muted">
          Date d&apos;expiration : n&apos;importe quelle date future (ex : 12/28) — CVC : n&apos;importe quels 3 chiffres
        </p>
      </Card>

      {/* ── Section 4 : Checklist de validation ───────────────────────── */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Checklist de validation</p>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-bp-text">
              <span className="text-bp-gold font-medium">{totalDone}</span>/{total}
            </span>
            <button
              onClick={resetChecklist}
              className="text-[11px] text-bp-muted hover:text-bp-text-2 underline-offset-2 hover:underline"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full bg-bp-gold transition-all"
            style={{ width: `${(totalDone / total) * 100}%` }}
          />
        </div>

        {categories.map((cat) => (
          <div key={cat} className="space-y-2">
            <p className="text-[11px] uppercase tracking-widest text-bp-muted pt-2">{cat}</p>
            {CHECKLIST.filter((c) => c.category === cat).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => toggleCheck(id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition hover:bg-white/5"
              >
                {checked.has(id)
                  ? <CheckSquare className="h-4 w-4 shrink-0 text-bp-gold" />
                  : <Square      className="h-4 w-4 shrink-0 text-bp-muted" />
                }
                <span className={checked.has(id) ? "text-bp-muted line-through" : "text-bp-text"}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        ))}
      </Card>
    </div>
  );
}
