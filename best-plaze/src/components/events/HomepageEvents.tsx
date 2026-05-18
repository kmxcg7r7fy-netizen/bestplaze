"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EventCard, type EventDisplay } from "@/components/events/EventCard";

interface Props {
  events: EventDisplay[];
}

export function HomepageEvents({ events }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("Tous");

  // Extraire les catégories uniques depuis les données
  const categories = useMemo(() => {
    const cats = Array.from(new Set(events.map((e) => e.type).filter(Boolean)));
    return ["Tous", ...cats];
  }, [events]);

  // Trier par date croissante
  const sorted = useMemo(
    () => [...events].sort((a, b) => (a.dateISO ?? "").localeCompare(b.dateISO ?? "")),
    [events],
  );

  // Appliquer le filtre catégorie
  const filtered = useMemo(
    () =>
      activeCategory === "Tous"
        ? sorted
        : sorted.filter((e) => e.type === activeCategory),
    [sorted, activeCategory],
  );

  // Événement à la une = le premier (le plus proche) dans la sélection filtrée
  const featured = filtered[0] ?? null;
  // Max 3 autres événements après le featured
  const nextEvents = filtered.slice(1, 4);

  if (events.length === 0) return null;

  return (
    <>
      {/* ── Filtre catégories ── */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full border px-3.5 py-1.5 text-[12px] transition ${
              activeCategory === cat
                ? "border-bp-gold/50 bg-bp-gold/12 text-bp-gold"
                : "border-bp-gold/20 bg-transparent text-bp-text-2 hover:border-bp-gold/35 hover:text-bp-text"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Événement à la une ── */}
      {featured && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.22em] text-bp-gold">
              À l&apos;affiche
            </p>
            <Link href="/events" className="flex items-center gap-1 text-[13px] text-bp-muted transition hover:text-bp-text">
              Toutes les soirées <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <EventCard event={featured} mode="poster" priority />
        </section>
      )}

      {/* ── Prochaines soirées ── */}
      {nextEvents.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.22em] text-bp-gold">
              À venir
            </p>
            <Link href="/events" className="flex items-center gap-1 text-[13px] text-bp-muted transition hover:text-bp-text">
              Voir tout <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className={`grid gap-5 ${nextEvents.length >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"}`}>
            {nextEvents.map((e) => (
              <EventCard key={e.id} event={e} mode="grid" />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
