import Image from "next/image";
import { ArrowRight, Calendar, Clock, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export type EventDisplay = {
  id: string;
  title: string;
  dateISO: string;
  time: string;
  type: string;
  description?: string | null;
  dressCode?: string | null;
  highlight?: boolean;
  imageUrl?: string | null;
  prix?: number | null;
};

export type EventCardMode = "grid" | "list" | "hero" | "poster";

function formatDateFr(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
}

function reserveHref(event: EventDisplay) {
  return `/reservation?event=${event.id}&date=${event.dateISO}&time=${encodeURIComponent(event.time)}&title=${encodeURIComponent(event.title)}`;
}

// ── Placeholder gradient ─────────────────────────────────────────────────────
function Placeholder({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{ background: "linear-gradient(135deg, #1a1208 0%, #2a1e0a 40%, #0e0e12 100%)" }}
    />
  );
}

// ── Image universelle : <img> pour SVG/local, <Image> pour Supabase ──────────
function EventImg({
  src, alt, priority, className, sizes,
}: {
  src: string; alt: string; priority?: boolean;
  className?: string; sizes?: string;
}) {
  // SVG ou chemin local → <img> standard (next/image ne peut pas les optimiser)
  if (src.startsWith("/") || src.endsWith(".svg")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }
  // Image distante (Supabase) → next/image avec optimisation
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      className={`object-cover ${className ?? ""}`}
      priority={priority}
    />
  );
}

// ── Grid mode — image dominante ratio 4/5 ────────────────────────────────────
function EventCardGrid({ event, priority }: { event: EventDisplay; priority?: boolean }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/30 transition hover:border-white/20 hover:shadow-[0_0_40px_rgba(216,176,90,0.06)]">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {event.imageUrl ? (
          <EventImg
            src={event.imageUrl}
            alt={event.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="transition duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <Placeholder className="absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
          {event.highlight && <Badge variant="gold">À la une</Badge>}
          <Badge variant="soft">{event.type}</Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <p className="font-serif text-[22px] leading-tight text-white">{event.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-white/70">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />{formatDateFr(event.dateISO)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />{event.time}
            </span>
            {event.prix != null && event.prix > 0 && (
              <span className="inline-flex items-center gap-1">
                <Ticket className="h-3 w-3" />{event.prix}€
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          {event.dressCode ? (
            <span className="text-[12px] text-bp-muted">Dress code : {event.dressCode}</span>
          ) : event.description ? (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-bp-text-2">{event.description}</p>
          ) : null}
        </div>
        <Button href={reserveHref(event)} className="shrink-0 px-4 py-2.5 text-[13px]">
          Réserver <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ── List mode — horizontal, image carrée 200px ────────────────────────────────
function EventCardList({ event, priority }: { event: EventDisplay; priority?: boolean }) {
  return (
    <div className="group flex overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-white/20 hover:bg-white/[0.06]">
      <div className="relative w-[140px] shrink-0 self-stretch overflow-hidden sm:w-[200px]">
        {event.imageUrl ? (
          <EventImg
            src={event.imageUrl}
            alt={event.title}
            sizes="200px"
            className="transition duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <Placeholder className="absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {event.highlight && <Badge variant="gold">À la une</Badge>}
            <Badge variant="soft">{event.type}</Badge>
          </div>
          <p className="font-serif text-[18px] leading-tight text-bp-text">{event.title}</p>
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-bp-text-2">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3 text-bp-gold/80" />{formatDateFr(event.dateISO)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-bp-gold/80" />{event.time}
            </span>
            {event.prix != null && event.prix > 0 && (
              <span className="inline-flex items-center gap-1">
                <Ticket className="h-3 w-3 text-bp-gold/80" />{event.prix}€
              </span>
            )}
          </div>
          {event.description && (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-bp-muted">{event.description}</p>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          {event.dressCode && (
            <span className="text-[12px] text-bp-muted">DC : {event.dressCode}</span>
          )}
          <Button href={reserveHref(event)} className="ml-auto px-3 py-2 text-[13px]">
            Réserver <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Hero mode — pleine largeur, min 420px desktop ────────────────────────────
function EventCardHero({ event, priority }: { event: EventDisplay; priority?: boolean }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 transition hover:border-bp-gold/20">
      <div className="relative min-h-[260px] w-full md:min-h-[420px]">
        {event.imageUrl ? (
          <EventImg
            src={event.imageUrl}
            alt={event.title}
            sizes="100vw"
            className="transition duration-700 group-hover:scale-[1.03]"
            priority={priority}
          />
        ) : (
          <Placeholder className="absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {event.highlight && <Badge variant="gold">À la une</Badge>}
                <Badge variant="soft">{event.type}</Badge>
              </div>
              <p className="font-serif text-[28px] leading-tight text-white sm:text-[36px] md:text-[42px]">
                {event.title}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[13px] text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />{formatDateFr(event.dateISO)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />{event.time}
                </span>
                {event.prix != null && event.prix > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Ticket className="h-4 w-4" />{event.prix}€
                  </span>
                )}
                {event.dressCode && (
                  <span>Dress code : {event.dressCode}</span>
                )}
              </div>
              {event.description && (
                <p className="max-w-xl line-clamp-2 text-[14px] leading-relaxed text-white/60">
                  {event.description}
                </p>
              )}
            </div>
            <Button href={reserveHref(event)} className="shrink-0 sm:self-end">
              Réserver <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Poster mode — image naturelle mobile, split 55/45 desktop ────────────────
function PosterInfo({ event }: { event: EventDisplay }) {
  return (
    <div className="space-y-6">
      <p className="text-[11px] uppercase tracking-[0.24em] text-bp-gold">À l&apos;affiche</p>
      <p className="font-serif text-[30px] leading-tight tracking-[-0.02em] text-bp-text lg:text-[42px]">
        {event.title}
      </p>
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-[14px] text-bp-text-2">
          <Calendar className="h-4 w-4 shrink-0 text-bp-gold/80" />
          <span className="capitalize">{formatDateFr(event.dateISO)}</span>
        </div>
        <div className="flex items-center gap-3 text-[14px] text-bp-text-2">
          <Clock className="h-4 w-4 shrink-0 text-bp-gold/80" />
          <span>{event.time}</span>
        </div>
        {event.prix != null && event.prix > 0 && (
          <div className="flex items-center gap-3 text-[14px] text-bp-text-2">
            <Ticket className="h-4 w-4 shrink-0 text-bp-gold/80" />
            <span>{event.prix}€ l&apos;entrée</span>
          </div>
        )}
        {event.dressCode && (
          <div className="flex items-center gap-3 text-[14px] text-bp-text-2">
            <span className="text-bp-gold/60">✦</span>
            <span>Dress code : {event.dressCode}</span>
          </div>
        )}
      </div>
      {event.description && (
        <p className="line-clamp-4 text-[14px] leading-relaxed text-bp-muted">{event.description}</p>
      )}
    </div>
  );
}

function EventCardPoster({ event, priority }: { event: EventDisplay; priority?: boolean }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-white/10 transition hover:border-bp-gold/20">
      <div className="flex flex-col md:flex-row">
        {/* Colonne image — aspect portrait mobile, hauteur fixe desktop */}
        <div
          className="relative shrink-0 overflow-hidden"
          style={{ flexBasis: "55%" }}
        >
          <div className="relative aspect-[3/4] min-h-[320px] md:aspect-auto md:h-[540px]">
            {event.imageUrl ? (
              <EventImg
                src={event.imageUrl}
                alt={event.title}
                sizes="(max-width: 768px) 100vw, 55vw"
                className="transition duration-700 group-hover:scale-[1.03]"
                priority={priority}
              />
            ) : (
              <Placeholder className="absolute inset-0" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
              {event.highlight && <Badge variant="gold">À la une</Badge>}
              <Badge variant="soft">{event.type}</Badge>
            </div>
          </div>
        </div>

        {/* Colonne infos */}
        <div
          className="flex flex-col justify-between bg-black/50 p-6 backdrop-blur-sm md:p-10"
          style={{ flexBasis: "45%" }}
        >
          <PosterInfo event={event} />
          <div className="mt-8">
            <Button href={reserveHref(event)} className="w-full justify-center">
              Réserver pour cette soirée <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Export principal ─────────────────────────────────────────────────────────
export function EventCard({
  event,
  mode,
  featured = false,
  priority = false,
}: {
  event: EventDisplay;
  mode?: EventCardMode;
  featured?: boolean;
  priority?: boolean;
}) {
  const effectiveMode: EventCardMode = mode ?? (featured ? "hero" : "grid");
  if (effectiveMode === "list")   return <EventCardList   event={event} priority={priority} />;
  if (effectiveMode === "hero")   return <EventCardHero   event={event} priority={priority} />;
  if (effectiveMode === "poster") return <EventCardPoster event={event} priority={priority} />;
  return <EventCardGrid event={event} priority={priority} />;
}
