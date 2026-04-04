import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

function priceEUR(amount: number) {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export type ReservationDraft = {
  dateISO?: string;
  time?: string;
  guests: number;
  area?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  occasion?: string;
  note?: string;
  preselected: { label: string; qty: number; unitPrice?: number }[];
};

export function ReservationSummary({
  draft,
  className,
  onConfirm,
  isLoading,
}: {
  draft: ReservationDraft;
  className?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
}) {
  const estimated =
    draft.preselected?.reduce((sum, x) => sum + (x.unitPrice ?? 0) * x.qty, 0) ??
    0;

  return (
    <Card className={cn("border-bp-gold/18", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="font-serif text-[18px] text-bp-text">Récapitulatif</p>
          <Badge variant="gold">Expérience premium</Badge>
        </div>
        <p className="text-[13px] leading-6 text-bp-text-2">
          Vos informations sont enregistrées localement (V1 mock).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          {(draft.firstName || draft.lastName) ? (
            <div className="col-span-2 rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-bp-muted">Nom</p>
              <p className="mt-1 text-bp-text">
                {[draft.firstName, draft.lastName].filter(Boolean).join(" ") || "—"}
              </p>
            </div>
          ) : null}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-bp-muted">Date</p>
            <p className="mt-1 text-bp-text">{draft.dateISO ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-bp-muted">Heure</p>
            <p className="mt-1 text-bp-text">{draft.time ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-bp-muted">Personnes</p>
            <p className="mt-1 text-bp-text">{draft.guests}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-bp-muted">Espace</p>
            <p className="mt-1 text-bp-text">{draft.area ?? "—"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[12px] uppercase tracking-[0.16em] text-bp-muted">
            Pré-sélection
          </p>
          {draft.preselected.length ? (
            <div className="space-y-2">
              {draft.preselected
                .filter((x) => x.qty > 0)
                .map((x) => (
                  <div
                    key={x.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-3 text-[13px]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-bp-text">{x.label}</p>
                      {x.unitPrice ? (
                        <p className="text-bp-muted">
                          {priceEUR(x.unitPrice)} / unité
                        </p>
                      ) : null}
                    </div>
                    <p className="text-bp-text-2">×{x.qty}</p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-[13px] text-bp-text-2">
              Aucun produit sélectionné pour le moment.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4">
          <div>
            <p className="text-[12px] uppercase tracking-[0.16em] text-bp-muted">
              Total estimatif
            </p>
            <p className="mt-1 font-serif text-[20px] text-bp-gold">
              {estimated ? priceEUR(estimated) : "—"}
            </p>
          </div>
          <Button className="px-5" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Redirection…" : "Confirmer ma réservation"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

