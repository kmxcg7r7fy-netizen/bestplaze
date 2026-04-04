"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader, Search, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { ReservationRow } from "@/types/reservation";


const STATUTS = ["Tous", "en_attente", "confirmee", "annulee", "terminee", "no_show"] as const;
const STATUT_LABEL: Record<string, string> = {
  en_attente: "En attente", confirmee: "Confirmée",
  annulee: "Annulée", terminee: "Terminée", no_show: "No-show",
};
const STATUT_VARIANT: Record<string, "gold" | "soft" | "outline"> = {
  confirmee: "gold", en_attente: "soft",
  annulee: "outline", terminee: "outline", no_show: "outline",
};
const STATUT_NEXT: Record<string, { label: string; value: string }[]> = {
  en_attente: [{ label: "Confirmer", value: "confirmee" }, { label: "Annuler", value: "annulee" }],
  confirmee:  [{ label: "Terminée", value: "terminee" }, { label: "No-show", value: "no_show" }, { label: "Annuler", value: "annulee" }],
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [filtered, setFiltered]         = useState<ReservationRow[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [statut, setStatut]             = useState<string>("Tous");
  const [updating, setUpdating]         = useState<string | null>(null);
  const [selected, setSelected]         = useState<ReservationRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = getBrowserSupabaseClient();
    const { data } = await supabase
      .from("reservations")
      .select()
      .order("date_reservation", { ascending: false })
      .order("heure", { ascending: true });
    setReservations((data as ReservationRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filtrage côté client
  useEffect(() => {
    let list = reservations;
    if (statut !== "Tous") list = list.filter((r) => r.statut === statut);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        `${r.prenom} ${r.nom} ${r.email}`.toLowerCase().includes(q),
      );
    }
    setFiltered(list);
  }, [reservations, statut, search]);

  async function changeStatut(id: string, newStatut: string) {
    setUpdating(id);
    const supabase = getBrowserSupabaseClient();
    await supabase.from("reservations").update({ statut: newStatut }).eq("id", id);
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, statut: newStatut } : r)),
    );
    if (selected?.id === id) setSelected((s) => s ? { ...s, statut: newStatut } : s);
    setUpdating(null);
  }

  function formatDate(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Administration" title="Réservations" />

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bp-muted" />
          <Input
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-[14px]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUTS.map((s) => (
            <button
              key={s}
              onClick={() => setStatut(s)}
              className={`rounded-full px-3 py-1.5 text-[12px] transition border ${
                statut === s
                  ? "border-bp-gold/30 bg-bp-gold/15 text-bp-gold"
                  : "border-white/10 bg-white/4 text-bp-text-2 hover:bg-white/8"
              }`}
            >
              {s === "Tous" ? "Tous" : (STATUT_LABEL[s] ?? s)}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={load} className="px-3 py-2 text-[13px]">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-7 w-7 animate-spin text-bp-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-[14px] text-bp-text-2">Aucune réservation trouvée.</Card>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-white/8 bg-black/20">
                {["Date", "Heure", "Client", "Pers.", "Espace", "Statut", "Paiement", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-bp-muted font-normal whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={r.id}
                  className={`cursor-pointer border-b border-white/5 transition hover:bg-white/4 ${i % 2 === 0 ? "" : "bg-black/10"}`}
                  onClick={() => setSelected(r)}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-bp-text">{formatDate(r.date_reservation)}</td>
                  <td className="px-4 py-3 font-serif text-bp-gold">{r.heure}</td>
                  <td className="px-4 py-3">
                    <p className="text-bp-text">{r.prenom} {r.nom}</p>
                    <p className="text-[11px] text-bp-muted">{r.email}</p>
                  </td>
                  <td className="px-4 py-3 text-bp-text-2">{r.nb_personnes}</td>
                  <td className="px-4 py-3 text-bp-text-2">{r.espace}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUT_VARIANT[r.statut] ?? "soft"}>
                      {STATUT_LABEL[r.statut] ?? r.statut}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.stripe_payment_status === "paid" ? "gold" : "outline"}>
                      {r.stripe_payment_status === "paid" ? "Payé" : "Non payé"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {(STATUT_NEXT[r.statut] ?? []).map((action) => (
                        <button
                          key={action.value}
                          disabled={updating === r.id}
                          onClick={() => changeStatut(r.id, action.value)}
                          className="rounded-xl border border-white/10 bg-white/6 px-3 py-1.5 text-[12px] text-bp-text-2 transition hover:bg-white/12 disabled:opacity-50"
                        >
                          {updating === r.id ? "…" : action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Panneau détail */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <Card
            className="w-full max-w-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-serif text-[20px] text-bp-text">{selected.prenom} {selected.nom}</p>
              <Badge variant={STATUT_VARIANT[selected.statut] ?? "soft"}>
                {STATUT_LABEL[selected.statut] ?? selected.statut}
              </Badge>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-[13px]">
              {[
                ["Date",       formatDate(selected.date_reservation)],
                ["Heure",      selected.heure],
                ["Personnes",  String(selected.nb_personnes)],
                ["Espace",     selected.espace],
                ["Email",      selected.email],
                ["Téléphone",  selected.telephone || "—"],
                ["Occasion",   selected.occasion || "—"],
                ["Paiement",   selected.stripe_payment_status === "paid" ? `Payé — ${selected.montant_paye}€` : "Non payé"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <dt className="text-bp-muted">{k}</dt>
                  <dd className="mt-1 text-bp-text">{v}</dd>
                </div>
              ))}
              {selected.notes && (
                <div className="col-span-2 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <dt className="text-bp-muted">Notes</dt>
                  <dd className="mt-1 text-bp-text">{selected.notes}</dd>
                </div>
              )}
            </dl>

            <div className="flex gap-2 flex-wrap">
              {(STATUT_NEXT[selected.statut] ?? []).map((action) => (
                <Button
                  key={action.value}
                  variant={action.value === "confirmee" ? "primary" : "ghost"}
                  className="text-[13px] px-4 py-2"
                  disabled={updating === selected.id}
                  onClick={() => changeStatut(selected.id, action.value)}
                >
                  {action.label}
                </Button>
              ))}
              <Button variant="secondary" className="text-[13px] px-4 py-2" onClick={() => setSelected(null)}>
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
