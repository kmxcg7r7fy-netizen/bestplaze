"use client";

import { useState, useMemo } from "react";
import { EventCard } from "@/components/events/EventCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { events } from "@/data/mock";

function unique<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export default function EventsPage() {
  const featured  = events.find((e) => e.highlight) ?? events[0];
  const allTypes  = ["Tous", ...unique(events.map((e) => e.type))];
  const [active, setActive] = useState("Tous");

  const filtered = useMemo(() => {
    const rest = events.filter((e) => e.id !== featured.id);
    return active === "Tous" ? rest : rest.filter((e) => e.type === active);
  }, [active, featured.id]);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Nuits & rendez-vous"
        title="Événements"
        description="Une sélection premium, une esthétique noire & dorée, et une réservation fluide pour chaque soirée."
      />

      {/* Filtres fonctionnels */}
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filtrer par type"
      >
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
        <span className="ml-auto text-[12px] text-bp-muted">
          {filtered.length} soirée{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <section className="space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
          Événement du moment
        </p>
        <EventCard event={featured} featured />
      </section>

      <section className="space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
          À venir
        </p>
        {filtered.length === 0 ? (
          <p className="text-[14px] text-bp-text-2">
            Aucun événement de ce type en programmation.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
