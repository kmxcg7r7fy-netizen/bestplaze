"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Euro, Users, Clock, Loader } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { ReservationRow } from "@/types/reservation";


type Stats = {
  today_count: number;
  today_guests: number;
  week_count: number;
  total_revenue: number;
};

const STATUT_LABEL: Record<string, string> = {
  en_attente: "En attente", confirmee: "Confirmée",
  annulee: "Annulée", terminee: "Terminée", no_show: "No-show",
};

const STATUT_VARIANT: Record<string, "gold" | "soft" | "outline"> = {
  confirmee: "gold", en_attente: "soft", annulee: "outline",
  terminee: "outline", no_show: "outline",
};

function StatCard({
  icon: Icon, label, value, sub,
}: { icon: React.ElementType; label: string; value: string | number; sub?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.16em] text-bp-muted">{label}</p>
          <p className="mt-1 font-serif text-[32px] text-bp-text">{value}</p>
          {sub && <p className="text-[12px] text-bp-muted">{sub}</p>}
        </div>
        <div className="rounded-2xl border border-bp-gold/16 bg-bp-gold/8 p-2.5">
          <Icon className="h-5 w-5 text-bp-gold" />
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [today, setToday]     = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    const todayStr = new Date().toISOString().split("T")[0];
    const weekAgo  = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

    Promise.all([
      supabase.from("reservations").select().eq("date_reservation", todayStr).order("heure"),
      supabase.from("reservations").select("nb_personnes, total_estimatif, statut").gte("date_reservation", weekAgo),
    ]).then(([{ data: todayData }, { data: weekData }]) => {
      const todayRes = (todayData as ReservationRow[]) ?? [];
      const weekRes  = (weekData ?? []) as { nb_personnes: number; total_estimatif: number; statut: string }[];

      setToday(todayRes);
      setStats({
        today_count:   todayRes.length,
        today_guests:  todayRes.reduce((s, r) => s + r.nb_personnes, 0),
        week_count:    weekRes.length,
        total_revenue: weekRes
          .filter((r) => r.statut === "confirmee" || r.statut === "terminee")
          .reduce((s, r) => s + (r.total_estimatif ?? 0), 0),
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-bp-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Administration"
        title="Dashboard"
        description={`Aujourd'hui — ${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}`}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Réservations aujourd'hui" value={stats?.today_count ?? 0} />
        <StatCard icon={Users}        label="Personnes attendues"       value={stats?.today_guests ?? 0} sub="ce soir" />
        <StatCard icon={Clock}        label="Réservations cette semaine" value={stats?.week_count ?? 0} />
        <StatCard
          icon={Euro}
          label="CA estimé (7 jours)"
          value={(stats?.total_revenue ?? 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
        />
      </div>

      {/* Réservations du jour */}
      <section className="space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
          Réservations d&apos;aujourd&apos;hui{today.length > 0 && ` (${today.length})`}
        </p>

        {today.length === 0 ? (
          <Card className="p-6 text-center text-[14px] text-bp-text-2">
            Aucune réservation pour aujourd&apos;hui.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-white/10">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-white/8 bg-black/20">
                  {["Heure", "Client", "Espace", "Pers.", "Occasion", "Statut", "Total"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-bp-muted font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {today.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? "bg-black/10" : ""}>
                    <td className="px-4 py-3 font-serif text-bp-gold">{r.heure}</td>
                    <td className="px-4 py-3 text-bp-text">{r.prenom} {r.nom}</td>
                    <td className="px-4 py-3 text-bp-text-2">{r.espace}</td>
                    <td className="px-4 py-3 text-bp-text-2">{r.nb_personnes}</td>
                    <td className="px-4 py-3 text-bp-muted">{r.occasion || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUT_VARIANT[r.statut] ?? "soft"}>
                        {STATUT_LABEL[r.statut] ?? r.statut}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-bp-text-2">
                      {r.total_estimatif > 0
                        ? r.total_estimatif.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
