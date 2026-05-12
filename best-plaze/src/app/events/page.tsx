"use client";

import { useState, useMemo, useEffect } from "react";
import { EventCard, type EventDisplay } from "@/components/events/EventCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { events as mockEvents } from "@/data/mock";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

// Convertit un EventItem mock → EventDisplay
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

// Convertit une ligne Supabase → EventDisplay
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
  const [dbEvents, setDbEvents]   = useState<EventDisplay[] | null>(null);
  const [loading, setLoading]     = useState(true);
  const [active, setActive]       = useState("Tous");

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

  // Source de données : Supabase si disponible, mock sinon
  const allEvents: EventDisplay[] = dbEvents ?? mockEvents.map(fromMock);

  const featured  = allEvents.find((e) => e.highlight) ?? allEvents[0];
  const allTypes  = ["Tous", ...unique(allEvents.map((e) => e.type))];

  const filtered = useMemo(() => {
    const rest = allEvents.filter((e) => e.id !== featured?.id);
    return active === "Tous" ? rest : rest.filter((e) => e.type === active);
  }, [allEvents, active, featured?.id]);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Nuits & rendez-vous"
        title="Événements"
        description="Une sélection premium, une esthétique noire & dorée, et une réservation fluide pour chaque soirée."
      />

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par type">
        {allTypes.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            aria-pressed={active === t}
            className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
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
            {filtered.length} soirée{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          {featured && (
            <section className="space-y-4">
              <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Événement du moment</p>
              <EventCard event={featured} featured />
            </section>
          )}

          <section className="space-y-4">
            <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">À venir</p>
            {filtered.length === 0 ? (
              <p className="text-[14px] text-bp-text-2">Aucun événement de ce type en programmation.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
