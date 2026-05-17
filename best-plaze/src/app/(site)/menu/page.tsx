import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { menuCategories, menuItems } from "@/data/mock";
import { MenuTabs } from "@/components/menu/MenuTabs";

export const metadata = {
  title: "Carte",
};

export default function MenuPage() {
  const popularCocktails = menuItems
    .filter((x) => x.category === "Cocktails" && x.id !== "ct-punch")
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <SectionTitle
        as="h1"
        eyebrow="Carte"
        title="La carte — XI BestPlaze"
        description="Cocktails 12€ · Sans alcool 9€ · Softs 6€ · Champagnes · Vins · Spiritueux"
      />

      <section className="space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
          Cocktails populaires
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {popularCocktails.map((it) => (
            <MenuItemCard key={it.id} item={it} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
          Catégories
        </p>
        <MenuTabs categories={menuCategories} items={menuItems} />
      </section>
    </div>
  );
}

