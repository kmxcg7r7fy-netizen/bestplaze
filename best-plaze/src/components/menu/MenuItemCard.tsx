import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { MenuItem } from "@/data/mock";

function priceEUR(amount: number) {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

const badgeVariantByName: Record<string, "gold" | "soft"> = {
  Signature: "gold",
  "Best-seller": "soft",
  Premium: "gold",
};

export function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-[16px] font-medium tracking-[0.01em] text-bp-text">
              {item.name}
            </p>
            {item.badge ? (
              <Badge variant={badgeVariantByName[item.badge] ?? "soft"}>
                {item.badge}
              </Badge>
            ) : null}
          </div>
          <p className="text-[14px] leading-6 text-bp-text-2">
            {item.description}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-serif text-[18px] tracking-[-0.01em] text-bp-gold">
            {priceEUR(item.price)}
          </p>
          <p className="text-[12px] text-bp-muted">TTC</p>
        </div>
      </div>
    </Card>
  );
}

