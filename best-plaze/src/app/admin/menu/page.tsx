"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader, ToggleLeft, ToggleRight, Pencil, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";


type MenuItemRow = {
  id: string; nom: string; description?: string; categorie: string;
  prix?: number; prix_bouteille?: number; badge?: string;
  disponible: boolean; ordre: number;
};

const BADGE_VARIANT: Record<string, "gold" | "soft"> = {
  Signature: "gold", "Best-seller": "gold", Premium: "gold", Nouveau: "soft",
};

export default function AdminMenuPage() {
  const [items, setItems]     = useState<MenuItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId]   = useState<string | null>(null);
  const [editPrix, setEditPrix] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getBrowserSupabaseClient()
      .from("menu_items")
      .select()
      .order("categorie")
      .order("ordre");
    const rows = (data as MenuItemRow[]) ?? [];
    setItems(rows);
    const cats = ["Tous", ...Array.from(new Set(rows.map((r) => r.categorie)))];
    setCategories(cats);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = activeCategory === "Tous"
    ? items
    : items.filter((i) => i.categorie === activeCategory);

  async function toggleDisponible(id: string, current: boolean) {
    setSaving(id);
    await getBrowserSupabaseClient().from("menu_items").update({ disponible: !current }).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, disponible: !current } : i));
    setSaving(null);
  }

  async function savePrix(id: string) {
    const val = parseFloat(editPrix);
    if (isNaN(val) || val < 0) { setEditId(null); return; }
    setSaving(id);
    await getBrowserSupabaseClient().from("menu_items").update({ prix: val }).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, prix: val } : i));
    setSaving(null);
    setEditId(null);
  }

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Administration" title="Carte & Menu" />

      {/* Filtre catégories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] transition border ${
              activeCategory === c
                ? "border-bp-gold/30 bg-bp-gold/15 text-bp-gold"
                : "border-white/10 bg-white/4 text-bp-text-2 hover:bg-white/8"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="h-7 w-7 animate-spin text-bp-gold" /></div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-white/8 bg-black/20">
                {["Nom", "Catégorie", "Prix verre", "Prix bouteille", "Badge", "Dispo", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-bp-muted font-normal whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b border-white/5 ${!item.disponible ? "opacity-50" : ""} ${i % 2 === 0 ? "" : "bg-black/10"}`}
                >
                  <td className="px-4 py-3">
                    <p className="text-bp-text">{item.nom}</p>
                    {item.description && <p className="text-[11px] text-bp-muted">{item.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-bp-text-2">{item.categorie}</td>
                  <td className="px-4 py-3">
                    {editId === item.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={editPrix}
                          onChange={(e) => setEditPrix(e.target.value)}
                          className="h-8 w-20 text-[13px] px-2 py-1"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === "Enter") savePrix(item.id); if (e.key === "Escape") setEditId(null); }}
                        />
                        <button onClick={() => savePrix(item.id)} className="text-bp-gold hover:text-bp-gold-2">
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditId(item.id); setEditPrix(String(item.prix ?? "")); }}
                        className="flex items-center gap-1 text-bp-text hover:text-bp-gold transition"
                      >
                        {item.prix ? `${item.prix}€` : "—"}
                        <Pencil className="h-3 w-3 text-bp-muted" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-bp-text-2">
                    {item.prix_bouteille ? `${item.prix_bouteille}€` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {item.badge ? (
                      <Badge variant={BADGE_VARIANT[item.badge] ?? "soft"}>{item.badge}</Badge>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleDisponible(item.id, item.disponible)}
                      disabled={saving === item.id}
                      className="text-bp-muted hover:text-bp-text transition disabled:opacity-50"
                      aria-label={item.disponible ? "Désactiver" : "Activer"}
                    >
                      {item.disponible
                        ? <ToggleRight className="h-5 w-5 text-bp-gold" />
                        : <ToggleLeft className="h-5 w-5" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-bp-text-2">
                    {item.disponible ? "Actif" : "Masqué"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
