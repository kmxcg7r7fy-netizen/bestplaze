"use client";

import { useEffect, useState } from "react";
import { Loader, Key, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type PrivatisationRow = {
  id: string; prenom: string; nom: string; email: string; telephone?: string;
  date: string; nb_personnes?: number; type_evenement?: string;
  budget_range?: string; message?: string; statut: string;
  notes_admin?: string; created_at: string;
};

const STATUTS = ["Tous", "nouvelle", "en_discussion", "devis_envoyé", "confirmée", "annulée"] as const;
const STATUT_LABEL: Record<string, string> = {
  nouvelle: "Nouvelle", en_discussion: "En discussion",
  "devis_envoyé": "Devis envoyé", "confirmée": "Confirmée", "annulée": "Annulée",
};
const STATUT_VARIANT: Record<string, "gold" | "soft" | "outline"> = {
  "confirmée": "gold", nouvelle: "soft", en_discussion: "soft",
  "devis_envoyé": "soft", "annulée": "outline",
};
const STATUT_NEXT: Record<string, string[]> = {
  nouvelle:       ["en_discussion", "annulée"],
  en_discussion:  ["devis_envoyé", "annulée"],
  "devis_envoyé": ["confirmée", "annulée"],
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function formatDatetime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminPrivatisationsPage() {
  const [rows, setRows]         = useState<PrivatisationRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("Tous");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [notes, setNotes]       = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const { data } = await getBrowserSupabaseClient()
      .from("privatisation_requests")
      .select()
      .order("created_at", { ascending: false });
    const list = (data as PrivatisationRow[]) ?? [];
    setRows(list);
    const initial: Record<string, string> = {};
    list.forEach((r) => { initial[r.id] = r.notes_admin ?? ""; });
    setNotes(initial);
    setLoading(false);
  }

  useEffect(() => {
    async function init() { await load(); }
    init();
  }, []);

  const filtered = filter === "Tous" ? rows : rows.filter((r) => r.statut === filter);

  async function updateStatut(id: string, statut: string) {
    setUpdating(id);
    await getBrowserSupabaseClient()
      .from("privatisation_requests")
      .update({ statut })
      .eq("id", id);
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, statut } : r));
    setUpdating(null);
  }

  async function saveNotes(id: string) {
    setUpdating(id + "_notes");
    await getBrowserSupabaseClient()
      .from("privatisation_requests")
      .update({ notes_admin: notes[id] ?? null })
      .eq("id", id);
    setUpdating(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <SectionTitle eyebrow="Administration" title="Privatisations" />
        <span className="mt-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] text-bp-muted">
          {rows.filter((r) => r.statut === "nouvelle").length} nouvelle{rows.filter((r) => r.statut === "nouvelle").length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filtres statut */}
      <div className="flex flex-wrap gap-2">
        {STATUTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
              filter === s
                ? "border-bp-gold/30 bg-bp-gold/15 text-bp-gold"
                : "border-white/10 bg-white/4 text-bp-text-2 hover:bg-white/8"
            }`}
          >
            {s === "Tous" ? "Toutes" : STATUT_LABEL[s] ?? s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-6 w-6 animate-spin text-bp-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-bp-muted">
          <Key className="h-8 w-8 opacity-40" />
          <p className="text-[13px]">Aucune demande dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => {
            const isOpen = expanded === row.id;
            const nextStatuts = STATUT_NEXT[row.statut] ?? [];
            return (
              <div
                key={row.id}
                className="rounded-3xl border border-white/10 bg-black/20 overflow-hidden"
              >
                {/* En-tête ligne */}
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/3 transition"
                  onClick={() => setExpanded(isOpen ? null : row.id)}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-bp-gold/20 bg-bp-gold/8">
                    <Key className="h-4 w-4 text-bp-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14px] font-medium text-bp-text">
                        {row.prenom} {row.nom}
                      </p>
                      <Badge variant={STATUT_VARIANT[row.statut] ?? "outline"}>
                        {STATUT_LABEL[row.statut] ?? row.statut}
                      </Badge>
                    </div>
                    <p className="text-[12px] text-bp-muted mt-0.5">
                      {formatDate(row.date)}
                      {row.nb_personnes ? ` · ${row.nb_personnes} pers.` : ""}
                      {row.type_evenement ? ` · ${row.type_evenement}` : ""}
                      {row.budget_range ? ` · ${row.budget_range}` : ""}
                      {" · reçue le "}{formatDatetime(row.created_at)}
                    </p>
                  </div>
                  {isOpen
                    ? <ChevronUp className="h-4 w-4 text-bp-muted shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-bp-muted shrink-0" />}
                </button>

                {/* Détail dépliable */}
                {isOpen && (
                  <div className="border-t border-white/8 px-5 py-5 space-y-5">
                    {/* Contact */}
                    <div className="grid gap-3 sm:grid-cols-2 text-[13px]">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-bp-muted mb-1">Contact</p>
                        <p className="text-bp-text">{row.email}</p>
                        {row.telephone && <p className="text-bp-text-2">{row.telephone}</p>}
                      </div>
                      {row.message && (
                        <div className="sm:col-span-2">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-bp-muted mb-1">Message</p>
                          <p className="text-bp-text-2 leading-6 whitespace-pre-wrap">{row.message}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions statut */}
                    {nextStatuts.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-bp-muted">Changer le statut</p>
                        <div className="flex flex-wrap gap-2">
                          {nextStatuts.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatut(row.id, s)}
                              disabled={updating === row.id}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-bp-text-2 hover:bg-white/10 hover:text-bp-text transition disabled:opacity-50"
                            >
                              {updating === row.id
                                ? <Loader className="h-3 w-3 animate-spin" />
                                : `→ ${STATUT_LABEL[s] ?? s}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes internes */}
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-bp-muted">Notes internes</p>
                      <textarea
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-[13px] text-bp-text placeholder:text-white/30 outline-none focus:border-bp-gold/35 focus:ring-2 focus:ring-bp-gold/20 min-h-20 resize-none transition"
                        placeholder="Appel effectué, devis en cours…"
                        value={notes[row.id] ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [row.id]: e.target.value }))}
                      />
                      <button
                        onClick={() => saveNotes(row.id)}
                        disabled={updating === row.id + "_notes"}
                        className="text-[12px] text-bp-gold hover:text-bp-gold-2 transition disabled:opacity-50"
                      >
                        {updating === row.id + "_notes" ? "Sauvegarde…" : "Sauvegarder les notes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
