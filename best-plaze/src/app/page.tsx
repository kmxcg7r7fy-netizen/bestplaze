import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { EventCard } from "@/components/events/EventCard";
import { BrandMark } from "@/components/branding/BrandMark";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { brand, events, menuItems } from "@/data/mock";

export default function Home() {
  const featured = events.find((e) => e.highlight) ?? events[0];
  const nextEvents = events.filter((e) => e.id !== featured?.id).slice(0, 2);
  const signatures = menuItems
    .filter((x) => x.category === "Cocktails" && x.id !== "ct-punch")
    .slice(0, 3);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/30 p-6 sm:p-10">
        <div className="absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-bp-gold/15 blur-3xl" />
          <div className="absolute -right-28 top-12 h-72 w-72 rounded-full bg-bp-gold-2/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/55 to-transparent" />
        </div>

        <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-5">
            <BrandMark className="md:hidden" />
            <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
              {brand.baseline}
            </p>
            <h1 className="font-serif text-[36px] leading-[1.02] tracking-[-0.03em] text-bp-text sm:text-[44px]">
              XI BestPlaze
              <span className="block text-bp-gold/95">
                Réservez votre expérience
              </span>
            </h1>
            <p className="max-w-xl text-[15px] leading-7 text-bp-text-2">
              Resto-Lounge à Tours. Cocktails, terrasse, concerts et dancefloor.
              56 Rue de Suède · Mar–Jeu 12h–02h · Ven–Sam 12h–04h.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/reservation" className="justify-between sm:w-auto">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Réserver
                </span>
                <ArrowRight className="h-5 w-5 opacity-90" />
              </Button>
              <Button variant="secondary" href="/events">
                <Sparkles className="h-5 w-5" />
                Voir les événements
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { k: "Note Google", v: "5,0 / 5 ★" },
                { k: "Prix moyen", v: "30 – 40€ / pers." },
                { k: "Services", v: "Terrasse · Concerts" },
              ].map((x) => (
                <Card key={x.k} className="p-4">
                  <p className="text-[12px] uppercase tracking-[0.16em] text-bp-muted">
                    {x.k}
                  </p>
                  <p className="mt-1 text-[14px] text-bp-text">{x.v}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-bp-gold/12 bg-gradient-to-b from-bp-gold/12 to-white/[0.04] p-5">
            <div className="absolute inset-0 bg-[radial-gradient(900px_400px_at_70%_0%,rgba(216,176,90,0.20),transparent_55%)]" />
            <div className="relative space-y-4">
              <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
                À la une
              </p>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-serif text-[18px] text-bp-text">
                      {featured.title}
                    </p>
                    <p className="text-[13px] text-bp-text-2">
                      {featured.dateISO} · {featured.time} · {featured.type}
                    </p>
                  </div>
                  <Image
                    src={featured.image.src}
                    alt={featured.image.alt}
                    width={120}
                    height={90}
                    className="h-20 w-28 rounded-2xl border border-white/10 object-cover"
                  />
                </div>
              </div>
              <Button href="/reservation" className="w-full">
                Finaliser ma réservation
              </Button>
              <Link
                href="/events"
                className="block text-center text-[13px] text-bp-muted underline decoration-white/20 underline-offset-4 hover:text-bp-text"
              >
                Explorer toutes les soirées
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle
          eyebrow="La carte"
          title="Nos cocktails — 15 créations à découvrir"
          description="Mojito, Spritz, Blue Perfect, Pina Colada… tous à 12€. Sans alcool disponibles à 9€."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {signatures.map((it) => (
            <MenuItemCard key={it.id} item={it} />
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" href="/menu">
            Voir la carte complète <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle
          eyebrow="Événements"
          title="Soirées à venir"
          description="Des rendez-vous séduisants, une ambiance lounge chic, et une réservation au centre."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {nextEvents.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" href="/events">
            Page événements <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      <section className="rounded-[28px] border border-bp-gold/16 bg-gradient-to-b from-bp-gold/10 to-white/[0.04] p-6 sm:p-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-3">
            <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
              Réservation
            </p>
            <p className="font-serif text-[28px] leading-tight text-bp-text sm:text-[32px]">
              Réservez et anticipez votre expérience
            </p>
            <p className="text-[15px] leading-7 text-bp-text-2">
              Choisissez la date, le créneau, l’espace (lounge / terrasse / VIP)
              et pré-sélectionnez boissons et tapas.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Button href="/reservation" className="sm:w-auto">
              Réserver maintenant <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="ghost" href="/account" className="sm:w-auto">
              Accéder à mon compte
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
