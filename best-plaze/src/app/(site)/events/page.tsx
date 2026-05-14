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

export default function EventsPage() {
  const [dbEvents, setDbEvents] = useState<EventDisplay[] | null>(null);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState("Tous");
  const [mode, setMode]         = useState<EventCardMode>("grid");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    async function fetchEvents() {
      try {
        const { data } = await getBrowserSupabaseClient()
          .from("events")
          .select("id, titre, date, heure_debut, type, description, dress_code, a_la_une, image_url, prix_entree")
          .eq("statut", "published")
          .gte("date", today)
          .order("a_la_une", { ascending: false })
          .order("date",     { ascending: true });
        setDbEvents(data && data.length > 0 ? data.map(fromDb) : null);
      } catch {
        // fallback vers mock
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const allEvents: EventDisplay[] = dbEvents ?? mockEvents.map(fromMock);
  const featured  = allEvents.find((e) => e.highlight) ?? allEvents[0];
  const allTypes  = ["Tous", ...unique(allEvents.map((e) => e.type))];

  const filtered = useMemo(() => {
    const rest = allEvents.filter((e) => e.id !== featured?.id);
    return active === "Tous" ? rest : rest.filter((e) => e.type === active);
  }, [allEvents, active, featured?.id]);

  return (
    <div className="space-y-10 py-4">
      {/* ── En-tête section ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.22em] text-bp-gold font-semibold">
            Nuits &amp; rendez-vous
          </p>
          <h1 className="font-serif text-[32px] font-bold leading-tight tracking-[-0.02em] text-bp-text sm:text-[40px]">
            Événements à venir
          </h1>
          <p className="text-[15px] leading-relaxed text-bp-text-2">
            Une sélection premium, une esthétique noire &amp; dorée, et une réservation fluide pour chaque soirée.
          </p>
        </div>
        <EventFormatToggle value={mode} onChange={setMode} />
      </div>

      {/* ── Filtres type ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par type">
        {allTypes.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            aria-pressed={active === t}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
              active === t
                ? "border-bp-gold/30 bg-bp-gold/15 text-bp-gold"
                : "border-white/10 bg-transparent text-bp-text-2 hover:bg-white/6 hover:text-bp-text"
            }`}
          >
            {t}
          </button>
        ))}
        {!loading && (
          <span className="ml-auto text-[12px] text-bp-muted">
            {filtered.length + (featured ? 1 : 0)} soirée{filtered.length + (featured ? 1 : 0) !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Contenu ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Event vedette */}
          {featured && (
            <section>
              {mode === "hero" && (
                <p className="mb-3 text-[12px] uppercase tracking-[0.18em] text-bp-muted">
                  Événement du moment
                </p>
              )}
              <EventCard event={featured} mode={mode === "hero" ? "hero" : mode} priority />
            </section>
          )}

          {/* Grille / Liste / Secondaire vedette */}
          {filtered.length > 0 && (
            <section className="space-y-4">
              {mode === "hero" && (
                <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
                  À venir
                </p>
              )}
              {mode === "grid" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((e) => (
                    <EventCard key={e.id} event={e} mode="grid" />
                  ))}
                </div>
              )}
              {mode === "list" && (
                <div className="flex flex-col gap-4">
                  {filtered.map((e) => (
                    <EventCard key={e.id} event={e} mode="list" />
                  ))}
                </div>
              )}
              {mode === "hero" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((e) => (
                    <EventCard key={e.id} event={e} mode="grid" />
                  ))}
                </div>
              )}
            </section>
          )}

          {filtered.length === 0 && !featured && (
            <p className="py-12 text-center text-[14px] text-bp-text-2">
              Aucun événement de ce type en programmation.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
