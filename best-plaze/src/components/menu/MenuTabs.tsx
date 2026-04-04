"use client";

import { useMemo, useState } from "react";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { Tabs } from "@/components/ui/Tabs";
import type { MenuCategory, MenuItem } from "@/data/mock";

export function MenuTabs({
  categories,
  items,
}: {
  categories: { id: MenuCategory; label: string }[];
  items: MenuItem[];
}) {
  const [active, setActive] = useState<MenuCategory>(categories[0]?.id);

  const filtered = useMemo(
    () => items.filter((x) => x.category === active),
    [items, active],
  );

  return (
    <div className="space-y-4">
      <Tabs
        items={categories.map((c) => ({ id: c.id, label: c.label }))}
        value={active}
        onChange={(id) => setActive(id as MenuCategory)}
      />

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-[14px] text-bp-text-2">
          Aucun article dans cette catégorie.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((it) => (
            <MenuItemCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}

