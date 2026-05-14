import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { EventCard, type EventDisplay } from "@/components/events/EventCard";
import { Button } from "@/components/ui/Button";
import { events as mockEvents } from "@/data/mock";

async function getLiveEvents(): Promise<EventDisplay[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("events")
      .select("id, titre, description, date, heure_debut, type, dress_code, a_la_une, prix_entree, image_url")
      .eq("statut", "published")
      .gte("date", today)
      .order("a_la_une", { ascending: false })
      .order("date",     { ascending: true })
      .limit(3);

    if (data && data.length > 0) {
      return data.map((e) => ({
        id:          e.id,
        title:       e.titre,
        dateISO:     e.date,
        time:        e.heure_debut,
        type:        e.type,
        description: e.description ?? null,
        dressCode:   e.dress_code ?? null,
        highlight:   e.a_la_une ?? false,
        imageUrl:    e.image_url ?? null,
        prix:        e.prix_entree ?? null,
      }));
    }
  } catch { /* mock fallback */ }
  return [];
}

export default async function Home() {
  const liveEvents = await getLiveEvents();

  const allEvents: EventDisplay[] =
    liveEvents.length > 0
      ? liveEvents
      : mockEvents.map((e) => ({
          id:          e.id,
          title:       e.title,
          dateISO:     e.dateISO,
          time:        e.time,
          type:        e.type,
          description: e.description ?? null,
          dressCode:   e.dressCode ?? null,
          highlight:   e.highlight ?? false,
          imageUrl:    e.image?.src ?? null,
          prix:        null,
        }));

  const featured   = allEvents.find((e) => e.highlight) ?? allEvents[0];
  const nextEvents = allEvents.filter((e) => e.id !== featured?.id).slice(0, 2);

  return (
    <div className="flex flex-col gap-24 py-8">

      {/* ── Intro ────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-bp-gold">
            Bar Lounge · Tours
          </p>
          <h1 className="font-serif text-[48px] leading-[1] tracking-[-0.03em] text-bp-text sm:text-[64px] md:text-[80px]">
            XI BestPlaze
          </h1>
          <p className="mx-auto max-w-sm text-[16px] leading-relaxed text-bp-text-2">
            Cocktails, concerts et dancefloor.<br />Mardi – Samedi, 18h – 2h.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button href="/reservation">
            <CalendarDays className="h-4 w-4" />
            Réserver
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" href="/events">
            Événements
          </Button>
        </div>
      </section>

      {/* ── Événement à la une ───────────────────────────────────────────── */}
      {featured && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.22em] text-bp-gold">
              À l&apos;affiche
            </p>
            <Link
              href="/events"
              className="text-[13px] text-bp-muted transition hover:text-bp-text"
            >
              Toutes les soirées →
            </Link>
          </div>

          <EventCard event={featured} mode="hero" priority />
        </section>
      )}

      {/* ── Prochaines soirées ───────────────────────────────────────────── */}
      {nextEvents.length > 0 && (
        <section className="space-y-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-bp-gold">
            À venir
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {nextEvents.map((e) => (
              <EventCard key={e.id} event={e} mode="grid" />
            ))}
          </div>
        </section>
      )}

      {/* ── Localisation ─────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-bp-gold">
          Nous trouver
        </p>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          {/* Carte */}
          <div className="relative h-[320px] w-full sm:h-[400px]">
            <iframe
              src="https://maps.google.com/maps?q=56+Rue+de+Su%C3%A8de+37000+Tours+France&output=embed&z=16&hl=fr"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.85) contrast(0.9)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="XI BestPlaze — 56 Rue de Suède, Tours"
            />
          </div>

          {/* Infos */}
          <div className="grid gap-px bg-white/8 sm:grid-cols-3">
            <div className="flex items-center gap-3 bg-bp-bg px-5 py-4">
              <MapPin className="h-4 w-4 shrink-0 text-bp-gold" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-bp-muted">Adresse</p>
                <p className="mt-0.5 text-[14px] text-bp-text">56 Rue de Suède, Tours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-bp-bg px-5 py-4">
              <Clock className="h-4 w-4 shrink-0 text-bp-gold" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-bp-muted">Horaires</p>
                <p className="mt-0.5 text-[14px] text-bp-text">Mar – Sam · 18h – 2h</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-bp-bg px-5 py-4">
              <CalendarDays className="h-4 w-4 shrink-0 text-bp-gold" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-bp-muted">Réservation</p>
                <Link
                  href="/reservation"
                  className="mt-0.5 block text-[14px] text-bp-gold underline-offset-2 hover:underline"
                >
                  Réserver une table →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
