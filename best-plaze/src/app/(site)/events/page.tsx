"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { EventCard, type EventDisplay, type EventCardMode } from "@/components/events/EventCard";
import { EventFormatToggle } from "@/components/events/EventFormatToggle";
import { Button } from "@/components/ui/Button";
import { events as mockEvents } from "@/data/mock";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

function fromMock(e: typeof mockEvents[number]): EventDisplay {
  return {
    id:          e.id,
    title:       e.title,
    dateISO:     e.dateISO,
    time:        e.time,
    type:        e.type,
    description: e.description,
    dressCode:   e.dressCode,
    highlight:   e.highlight ?? false,
    imageUrl:    e.image?.src ?? null,
    prix:        null,
  };
}

function fromDb(e: {
  id: string; titre: string; date: string; heure_debut: string; type: string;
  description?: string | null; dress_code?: string | null; a_la_une: boolean;
  image_url?: string | null; prix_entree?: number | null;
}): EventDisplay {
  return {
    id:          e.id,
    title:       e.titre,
    dateISO:     e.date,
    time:        e.heure_debut,
    type:        e.type,
    description: e.description ?? null,
    dressCode:   e.dress_code ?? null,
    highlight:   e.a_la_une,
    imageUrl:    e.image_url ?? null,
    prix:        e.prix_entree ?? null,
  };
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function Skeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="aspect-[4/5] animate-pulse rounded-3xl"
          style={{ background: "rgba(255,255,255,0.05)", animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

export default function EventsPage() {
  const [dbEvents, setDbEvents] = useState<EventDisplay[] | null>(null);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState("Tous");
  const [mode, setMode]         = useState<EventCardMode>("grid");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const { data } = await getBrowserSupabaseClient()
          .from("events")
          .select("id, titre, date, heure_debut, type, description, dress_code, a_la_une, image_url, prix_entree")
          .eq("statut", "published")
          .gte("date", today)
          .order("a_la_une", { ascending: false })
          .order("date",     { ascending: true });
        setDbEvents(data && data.length > 0 ? data.map(fromDb) : null);
      } catch {
        // fallback mock
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // ── Source de données (Supabase ou mock) ──────────────────────────────────
  const allEvents: EventDisplay[] = useMemo(
    () => dbEvents ?? mockEvents.map(fromMock),
    [dbEvents],
  );

  // ── Catégories disponibles ────────────────────────────────────────────────
  const allTypes = useMemo(
    () => ["Tous", ...unique(allEvents.map((e) => e.type))],
    [allEvents],
  );

  // ── Filtrage : d'abord par catégorie, PUIS séparer vedette / reste ────────
  const filteredByType = useMemo(
    () => (active === "Tous" ? allEvents : allEvents.filter((e) => e.type === active)),
    [allEvents, active],
  );

  const featured = useMemo(
    () => filteredByType.find((e) => e.highlight) ?? filteredByType[0] ?? null,
    [filteredByType],
  );

  const rest = useMemo(
    () => filteredByType.filter((e) => e.id !== featured?.id),
    [filteredByType, featured],
  );

  const total = filteredByType.length;

  return (
    <div className="flex flex-col gap-10 py-4">

      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-bp-gold">
              Nuits &amp; rendez-vous
            </p>
            <h1 className="font-serif text-[34px] leading-tight tracking-[-0.02em] text-bp-text sm:text-[44px] lg:text-[52px]">
              Événements
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!loading && total > 0 && (
              <p className="text-[13px] text-bp-muted">
                {total} soirée{total !== 1 ? "s" : ""}
              </p>
            )}
            <EventFormatToggle value={mode} onChange={setMode} />
          </div>
        </div>

        {/* Filtres catégorie */}
        {!loading && allTypes.length > 1 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par type">
            {allTypes.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                aria-pressed={active === t}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] transition ${
                  active === t
                    ? "border-bp-gold/30 bg-bp-gold/12 text-bp-gold"
                    : "border-white/10 bg-transparent text-bp-text-2 hover:border-white/18 hover:bg-white/5 hover:text-bp-text"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ── Contenu ──────────────────────────────────────────────────────── */}
      {loading ? (
        <Skeleton />
      ) : filteredByType.length === 0 ? (
        /* État vide */
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-[32px]">🎭</p>
          <p className="text-[16px] text-bp-text-2">
            Aucune soirée de ce type en programmation.
          </p>
          <Button variant="secondary" onClick={() => setActive("Tous")}>
            Voir tous les événements <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {/* Événement vedette */}
          {featured && (
            <section>
              {mode === "hero" && (
                <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-bp-muted">
                  Événement du moment
                </p>
              )}
              <EventCard
                event={featured}
                mode={mode === "hero" ? "hero" : mode}
                priority
              />
            </section>
          )}

          {/* Reste des événements */}
          {rest.length > 0 && (
            <section className="space-y-4">
              {mode === "hero" && (
                <p className="text-[11px] uppercase tracking-[0.2em] text-bp-muted">
                  Prochainement
                </p>
              )}

              {(mode === "grid" || mode === "hero") && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((e) => (
                    <EventCard key={e.id} event={e} mode="grid" />
                  ))}
                </div>
              )}

              {mode === "list" && (
                <div className="flex flex-col gap-4">
                  {rest.map((e) => (
                    <EventCard key={e.id} event={e} mode="list" />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
