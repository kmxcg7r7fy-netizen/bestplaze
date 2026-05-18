import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { type EventDisplay } from "@/components/events/EventCard";
import { HomepageEvents } from "@/components/events/HomepageEvents";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MapEmbed } from "@/components/map/MapEmbed";
import { events as mockEvents, menuItems } from "@/data/mock";

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
      .order("date", { ascending: true })
      .limit(10);
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

const badgeVariant: Record<string, "gold" | "soft"> = {
  Signature: "gold", "Best-seller": "soft", Premium: "gold",
};

// ── Séparateur de section ─────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-4 px-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="h-1 w-1 rounded-full bg-white/20" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/12 to-transparent" />
    </div>
  );
}


export default async function Home() {
  const liveEvents = await getLiveEvents();

  const rawEvents: EventDisplay[] =
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

  // Trier par date croissante (le composant client fera aussi ce tri, mais on le passe déjà trié)
  const allEvents = [...rawEvents].sort((a, b) => (a.dateISO ?? "").localeCompare(b.dateISO ?? ""));

  const cocktails  = menuItems.filter((x) => x.category === "Cocktails").slice(0, 6);

  return (
    <div className="flex flex-col gap-20 py-6 md:gap-28 lg:gap-32">

      {/* ── 1. INTRO ──────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-6 text-center">
        {/* Ligne décorative desktop */}
        <div className="hidden lg:flex items-center gap-6 w-full max-w-2xl">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-bp-gold/30" />
          <p className="text-[10px] uppercase tracking-[0.32em] text-bp-gold/80">Bar Lounge · Tours</p>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-bp-gold/30" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-bp-gold lg:hidden">
          Bar Lounge · Tours
        </p>

        <h1 className="font-serif text-[54px] leading-[0.92] tracking-[-0.03em] text-bp-text sm:text-[76px] lg:text-[100px] xl:text-[116px]">
          XI BestPlaze
        </h1>

        <p className="max-w-xs text-[15px] leading-relaxed text-bp-text-2 sm:max-w-sm sm:text-[16px] lg:max-w-md lg:text-[17px]">
          Cocktails, concerts et dancefloor.<br />
          <span className="text-bp-muted">Mardi – Samedi · 18h – 2h.</span>
        </p>

        <div className="flex items-center gap-3 pt-1">
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

      {/* ── 2 & 3. ÉVÉNEMENTS (à la une + à venir + filtre catégorie) ──────── */}
      {allEvents.length > 0 && (
        <>
          <Divider />
          <section className="space-y-6">
            <HomepageEvents events={allEvents} />
          </section>
        </>
      )}

      {/* ── 4. CARTE DES BOISSONS ─────────────────────────────────────────── */}
      <>
        <Divider />
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.22em] text-bp-gold">La carte</p>
            <Link href="/menu" className="flex items-center gap-1 text-[13px] text-bp-muted transition hover:text-bp-text">
              Voir tout <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile : scroll horizontal */}
          <div className="flex gap-3 overflow-x-auto pb-1 sm:hidden" style={{ scrollbarWidth: "none" }}>
            {cocktails.map((item) => (
              <div
                key={item.id}
                className="flex w-[210px] shrink-0 items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-bp-text">{item.name}</p>
                  {item.badge && (
                    <Badge variant={badgeVariant[item.badge] ?? "soft"} className="mt-1">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <p className="shrink-0 font-serif text-[17px] text-bp-gold">{item.price}€</p>
              </div>
            ))}
          </div>

          {/* Desktop : grille */}
          <div className="hidden sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {cocktails.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 transition hover:border-white/14 hover:bg-white/[0.055]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium text-bp-text">{item.name}</p>
                    {item.badge && (
                      <Badge variant={badgeVariant[item.badge] ?? "soft"}>{item.badge}</Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-0.5 truncate text-[12px] text-bp-muted">{item.description}</p>
                  )}
                </div>
                <p className="shrink-0 font-serif text-[18px] text-bp-gold">{item.price}€</p>
              </div>
            ))}
          </div>

          <Button variant="secondary" href="/menu">
            Voir la carte complète <ArrowRight className="h-4 w-4" />
          </Button>
        </section>
      </>

      {/* ── 5. LOCALISATION ───────────────────────────────────────────────── */}
      <>
        <Divider />
        <section className="space-y-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-bp-gold">Nous trouver</p>

          {/* Carte Google Maps + infos */}
          <div className="overflow-hidden rounded-2xl border border-white/10 transition hover:border-white/16">
            <MapEmbed />

            {/* Infos dessous — fond transparent pour ne pas couper le gradient */}
            <div className="grid sm:grid-cols-3 divide-y divide-white/8 sm:divide-y-0 sm:divide-x sm:divide-white/8">
              <div className="flex items-center gap-3 px-5 py-4">
                <MapPin className="h-4 w-4 shrink-0 text-bp-gold" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-bp-muted">Adresse</p>
                  <p className="mt-0.5 text-[14px] text-bp-text">56 Rue de Suède, Tours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-4">
                <Clock className="h-4 w-4 shrink-0 text-bp-gold" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-bp-muted">Horaires</p>
                  <p className="mt-0.5 text-[14px] text-bp-text">Mar – Sam · 18h – 2h</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-4">
                <CalendarDays className="h-4 w-4 shrink-0 text-bp-gold" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-bp-muted">Réservation</p>
                  <Link href="/reservation" className="mt-0.5 block text-[14px] text-bp-gold transition hover:text-bp-gold-2">
                    Réserver une table →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>

    </div>
  );
}
