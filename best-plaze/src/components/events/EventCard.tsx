import Image from "next/image";
import { Calendar, Clock, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

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

function formatDateFr(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day:     "2-digit",
    month:   "short",
  });
}

export function EventCard({
  event,
  featured = false,
}: {
  event: EventDisplay;
  featured?: boolean;
}) {
  return (
    <Card
      className={
        featured
          ? "border-bp-gold/20 bg-gradient-to-b from-bp-gold/10 to-white/[0.05]"
          : ""
      }
    >
      <CardHeader className="space-y-4">
        {/* Image ou placeholder gradient */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />

          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              width={1200}
              height={700}
              className="h-44 w-full object-cover sm:h-52"
              priority={featured}
            />
          ) : (
            <div
              className="h-44 w-full sm:h-52"
              style={{
                background:
                  "linear-gradient(135deg, #1a1208 0%, #2a1e0a 40%, #0e0e12 100%)",
              }}
            />
          )}

          <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
            {!!event.highlight && <Badge variant="gold">À la une</Badge>}
            <Badge variant="soft">{event.type}</Badge>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-20">
            <p className="font-serif text-[18px] leading-tight text-white sm:text-[20px]">
              {event.title}
            </p>
          </div>
        </div>

        {/* Date / heure / dress code */}
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-bp-text-2">
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 text-bp-gold/80" />
            {formatDateFr(event.dateISO)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-bp-gold/80" />
            {event.time}
          </span>
          {event.prix != null && event.prix > 0 && (
            <span className="inline-flex items-center gap-2">
              <Ticket className="h-4 w-4 text-bp-gold/80" />
              {event.prix}€
            </span>
          )}
          {event.dressCode && (
            <span className="ml-auto hidden text-bp-muted sm:inline">
              Dress code : {event.dressCode}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {event.description && (
          <p className="text-[15px] leading-7 text-bp-text-2">{event.description}</p>
        )}

        <div className="flex items-center justify-between gap-3">
          {event.dressCode ? (
            <span className="text-[13px] text-bp-muted sm:hidden">
              Dress code : {event.dressCode}
            </span>
          ) : <span />}
          <Button
            href={`/reservation?event=${event.id}&date=${event.dateISO}&time=${event.time}`}
            className="px-4 py-2.5 text-[14px]"
          >
            Réserver pour cet événement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
