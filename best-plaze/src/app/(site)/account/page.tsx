"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { ReservationRow } from "@/types/reservation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(prenom?: string, nom?: string, email?: string) {
  if (prenom || nom) return ((prenom?.[0] ?? "") + (nom?.[0] ?? "")).toUpperCase();
  return (email?.slice(0, 2) ?? "??").toUpperCase();
}

function priceEUR(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const STATUT_MAP: Record<string, { label: string; variant: "gold" | "soft" | "outline" }> = {
  confirmee:  { label: "Confirmée",  variant: "gold"    },
  en_attente: { label: "En attente", variant: "soft"    },
  terminee:   { label: "Terminée",   variant: "outline" },
  annulee:    { label: "Annulée",    variant: "outline" },
  no_show:    { label: "No-show",    variant: "outline" },
};

type Profile = {
  id: string; email: string;
  prenom?: string; nom?: string; telephone?: string; is_vip?: boolean;
};

// ─── ReservationCard ──────────────────────────────────────────────────────────

function ReservationCard({ r, faded }: { r: ReservationRow; faded?: boolean }) {
  const s = STATUT_MAP[r.statut] ?? { label: r.statut, variant: "soft" as const };
  return (
    <Card className={faded ? "p-5 opacity-75" : "p-5"}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-serif text-[17px] text-bp-text">
            {formatDate(r.date_reservation)} · {r.heure}
          </p>
          <p className="mt-1 text-[13px] text-bp-text-2">{r.nb_personnes} pers. · {r.espace}</p>
          {r.occasion && <p className="mt-1 text-[12px] text-bp-muted">{r.occasion}</p>}
          {r.notes && (
            <p className="mt-2 text-[12px] leading-5 text-bp-muted italic">
              &ldquo;{r.notes}&rdquo;
            </p>
          )}
        </div>
        <Badge variant={s.variant}>{s.label}</Badge>
      </div>
      {r.total_estimatif > 0 && (
        <p className="mt-3 text-[13px] text-bp-muted">
          Total : <span className="text-bp-gold">{priceEUR(r.total_estimatif)}</span>
        </p>
      )}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [upcoming, setUpcoming] = useState<ReservationRow[]>([]);
  const [past, setPast]         = useState<ReservationRow[]>([]);
  const [loading, setLoading]   = useState(true);

  const loadData = useCallback(async () => {
    try {
      const supabase = getBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/account/login");
        return; // setLoading reste true → le spinner couvre la transition de page
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, email, prenom, nom, telephone, is_vip")
        .eq("id", user.id)
        .single();

      setProfile(profileData ?? { id: user.id, email: user.email ?? "" });

      const today = new Date().toISOString().split("T")[0];
      const [{ data: up }, { data: pa }] = await Promise.all([
        supabase.from("reservations").select().eq("email", user.email ?? "")
          .gte("date_reservation", today).order("date_reservation", { ascending: true }),
        supabase.from("reservations").select().eq("email", user.email ?? "")
          .lt("date_reservation", today).order("date_reservation", { ascending: false }).limit(10),
      ]);

      setUpcoming((up as ReservationRow[]) ?? []);
      setPast((pa as ReservationRow[]) ?? []);
    } catch {
      // Erreur réseau ou Supabase → on redirige vers login
      router.replace("/account/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
    // Timeout de sécurité : si ça tourne encore après 8s, on redirige vers login
    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) router.replace("/account/login");
        return false;
      });
    }, 8000);
    return () => clearTimeout(timeout);
  }, [loadData, router]);

  async function handleSignOut() {
    await getBrowserSupabaseClient().auth.signOut();
    router.push("/account/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-bp-gold" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Espace membre"
        title="Mon compte"
        description="Retrouvez vos réservations à venir et passées."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-bp-gold/18 bg-bp-gold/10 font-serif text-[18px] text-bp-gold shadow-[var(--bp-shadow-gold)]">
              {initials(profile.prenom, profile.nom, profile.email)}
            </div>
            <div className="min-w-0">
              {(profile.prenom || profile.nom) && (
                <p className="truncate font-serif text-[20px] text-bp-text">
                  {[profile.prenom, profile.nom].filter(Boolean).join(" ")}
                </p>
              )}
              <p className="truncate text-[13px] text-bp-text-2">{profile.email}</p>
              {profile.telephone && <p className="text-[13px] text-bp-muted">{profile.telephone}</p>}
            </div>
          </div>
          {profile.is_vip && <div className="mt-3"><Badge variant="gold">Client VIP</Badge></div>}
          <div className="mt-5 flex flex-col gap-2">
            <Button href="/reservation" className="w-full">
              <CalendarDays className="h-4 w-4" /> Nouvelle réservation
            </Button>
            <Button variant="ghost" className="w-full justify-center text-[13px] text-bp-muted" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Déconnexion
            </Button>
          </div>
        </Card>

        <div className="space-y-8">
          <section className="space-y-4">
            <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
              Réservations à venir{upcoming.length > 0 && ` (${upcoming.length})`}
            </p>
            {upcoming.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {upcoming.map((r) => <ReservationCard key={r.id} r={r} />)}
              </div>
            ) : (
              <Card className="p-5">
                <p className="text-[14px] text-bp-text-2">
                  Aucune réservation à venir.{" "}
                  <a href="/reservation" className="text-bp-gold underline-offset-2 hover:underline">
                    Réserver une table →
                  </a>
                </p>
              </Card>
            )}
          </section>

          {past.length > 0 && (
            <section className="space-y-4">
              <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
                Historique ({past.length})
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {past.map((r) => <ReservationCard key={r.id} r={r} faded />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
