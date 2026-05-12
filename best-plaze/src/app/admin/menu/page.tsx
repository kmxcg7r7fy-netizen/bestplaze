"use client";

import { useEffect, useState } from "react";
import { Loader, ToggleLeft, ToggleRight, Pencil, Trash2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { menuItemSchema, type MenuItemInput } from "@/lib/validations";

type MenuItemRow = {
  id: string; nom: string; description?: string; categorie: string;
  prix?: number; prix_bouteille?: number; badge?: string;
  disponible: boolean; ordre: number;
};

const BADGE_VARIANT: Record<string, "gold" | "soft"> = {
  Signature: "gold", "Best-seller": "gold", Premium: "gold", Nouveau: "soft",
};

const BADGE_OPTIONS = ["", "Signature", "Best-seller", "Premium", "Nouveau"] as const;

const DEFAULT_CATEGORIES = [
  "Cocktails", "Sans alcool", "Champagnes", "Tapas", "Softs", "Vins", "Bières",
];

type ModalState = {
  open: boolean;
  mode: "create" | "edit";
  item: Partial<MenuItemRow>;
  errors: Partial<Record<string, string>>;
};

const EMPTY: Partial<MenuItemRow> = {
  nom: "", description: "", categorie: "", prix: undefined,
  prix_bouteille: undefined, badge: "", ordre: 0, disponible: true,
};

export default function AdminMenuPage() {
  const [items, setItems]         = useState<MenuItemRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [modal, setModal]         = useState<ModalState>({
    open: false, mode: "create", item: EMPTY, errors: {},
  });
  async function load() {
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
  }

  useEffect(() => {
    async function init() {
      await load();
    }
    init();
  }, []);

  const filtered = activeCategory === "Tous"
    ? items
    : items.filter((i) => i.categorie === activeCategory);

  // ── Catégories disponibles pour le select du modal ──────────────────────
  const allCats = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...items.map((r) => r.categorie)])
  ).sort();

  // ── Toggle disponible ────────────────────────────────────────────────────
  async function toggleDisponible(id: string, current: boolean) {
    setSaving(id);
    await getBrowserSupabaseClient()
      .from("menu_items")
      .update({ disponible: !current })
      .eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, disponible: !current } : i));
    setSaving(null);
  }

  // ── Supprimer ────────────────────────────────────────────────────────────
  async function handleDelete(id: string, nom: string) {
    if (!window.confirm(`Supprimer « ${nom} » de la carte ?`)) return;
    setSaving(id);
    await getBrowserSupabaseClient().from("menu_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSaving(null);
  }

  // ── Ouvrir modal ─────────────────────────────────────────────────────────
  function openCreate() {
    setModal({ open: true, mode: "create", item: { ...EMPTY }, errors: {} });
  }

  function openEdit(item: MenuItemRow) {
    setModal({ open: true, mode: "edit", item: { ...item }, errors: {} });
  }

  function closeModal() {
    setModal((m) => ({ ...m, open: false }));
  }

  function setField<K extends keyof MenuItemRow>(key: K, value: MenuItemRow[K]) {
    setModal((m) => ({ ...m, item: { ...m.item, [key]: value }, errors: { ...m.errors, [key]: undefined } }));
  }

  // ── Sauvegarder (create ou edit) ─────────────────────────────────────────
  async function handleSave() {
    const raw: MenuItemInput = {
      nom:            modal.item.nom ?? "",
      description:    modal.item.description ?? "",
      categorie:      modal.item.categorie ?? "",
      prix:           modal.item.prix,
      prix_bouteille: modal.item.prix_bouteille,
      badge:          (modal.item.badge ?? "") as MenuItemInput["badge"],
      ordre:          modal.item.ordre ?? 0,
      disponible:     modal.item.disponible ?? true,
    };

    const result = menuItemSchema.safeParse(raw);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((e) => {
        if (e.path[0]) errors[String(e.path[0])] = e.message;
      });
      setModal((m) => ({ ...m, errors }));
      return;
    }

    const payload = {
      nom:            result.data.nom,
      description:    result.data.description || null,
      categorie:      result.data.categorie,
      prix:           result.data.prix ?? null,
      prix_bouteille: result.data.prix_bouteille ?? null,
      badge:          result.data.badge || null,
      ordre:          result.data.ordre,
      disponible:     result.data.disponible,
    };

    setSaving("modal");
    if (modal.mode === "create") {
      const { data } = await getBrowserSupabaseClient()
        .from("menu_items")
        .insert(payload)
        .select()
        .single();
      if (data) setItems((prev) => [...prev, data as MenuItemRow]);
    } else {
      await getBrowserSupabaseClient()
        .from("menu_items")
        .update(payload)
        .eq("id", modal.item.id!);
      setItems((prev) =>
        prev.map((i) => i.id === modal.item.id ? { ...i, ...payload } as MenuItemRow : i)
      );
    }
    setSaving(null);
    closeModal();
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <SectionTitle eyebrow="Administration" title="Carte & Menu" />
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="h-4 w-4" /> Ajouter un article
        </Button>
      </div>

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
        <div className="flex justify-center py-12">
          <Loader className="h-7 w-7 animate-spin text-bp-gold" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-white/8 bg-black/20">
                {["Nom", "Catégorie", "Prix verre", "Prix bouteille", "Badge", "Dispo", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-bp-muted font-normal whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-bp-muted text-[13px]">
                    Aucun article dans cette catégorie.
                  </td>
                </tr>
              )}
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b border-white/5 ${!item.disponible ? "opacity-50" : ""} ${i % 2 === 0 ? "" : "bg-black/10"}`}
                >
                  <td className="px-4 py-3">
                    <p className="text-bp-text font-medium">{item.nom}</p>
                    {item.description && (
                      <p className="text-[11px] text-bp-muted max-w-[200px] truncate">{item.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-bp-text-2">{item.categorie}</td>
                  <td className="px-4 py-3 text-bp-text-2">
                    {item.prix != null ? `${item.prix}€` : "—"}
                  </td>
                  <td className="px-4 py-3 text-bp-text-2">
                    {item.prix_bouteille != null ? `${item.prix_bouteille}€` : "—"}
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-bp-muted hover:text-bp-text transition"
                        aria-label="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.nom)}
                        disabled={saving === item.id}
                        className="text-bp-muted hover:text-red-400 transition disabled:opacity-50"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal create / edit ─────────────────────────────────────────────── */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="font-serif text-[20px] text-bp-text">
                {modal.mode === "create" ? "Nouvel article" : "Modifier l'article"}
              </p>
              <button onClick={closeModal} className="text-bp-muted hover:text-bp-text transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Nom */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Nom <span className="text-red-400">*</span></Label>
                <Input
                  autoFocus
                  placeholder="Mojito Signature"
                  value={modal.item.nom ?? ""}
                  onChange={(e) => setField("nom", e.target.value)}
                />
                {modal.errors.nom && <p className="text-[11px] text-red-400">{modal.errors.nom}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Rhum blanc, menthe fraîche, citron vert…"
                  value={modal.item.description ?? ""}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </div>

              {/* Catégorie */}
              <div className="space-y-1.5">
                <Label>Catégorie <span className="text-red-400">*</span></Label>
                <Select
                  value={allCats.includes(modal.item.categorie ?? "") ? modal.item.categorie : "__custom__"}
                  onChange={(e) => {
                    if (e.target.value !== "__custom__") setField("categorie", e.target.value);
                  }}
                >
                  {allCats.map((c) => <option key={c} value={c}>{c}</option>)}
                  {!allCats.includes(modal.item.categorie ?? "") && modal.item.categorie && (
                    <option value="__custom__">{modal.item.categorie}</option>
                  )}
                </Select>
                <Input
                  placeholder="Ou saisir une nouvelle catégorie…"
                  value={modal.item.categorie ?? ""}
                  onChange={(e) => setField("categorie", e.target.value)}
                  className="mt-1.5"
                />
                {modal.errors.categorie && <p className="text-[11px] text-red-400">{modal.errors.categorie}</p>}
              </div>

              {/* Badge */}
              <div className="space-y-1.5">
                <Label>Badge</Label>
                <Select
                  value={modal.item.badge ?? ""}
                  onChange={(e) => setField("badge", e.target.value)}
                >
                  {BADGE_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b === "" ? "Aucun" : b}</option>
                  ))}
                </Select>
              </div>

              {/* Prix verre */}
              <div className="space-y-1.5">
                <Label>Prix verre (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="12"
                  value={modal.item.prix ?? ""}
                  onChange={(e) => setField("prix", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                />
              </div>

              {/* Prix bouteille */}
              <div className="space-y-1.5">
                <Label>Prix bouteille (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="80"
                  value={modal.item.prix_bouteille ?? ""}
                  onChange={(e) => setField("prix_bouteille", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                />
              </div>

              {/* Ordre */}
              <div className="space-y-1.5">
                <Label>Ordre d&apos;affichage</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={modal.item.ordre ?? 0}
                  onChange={(e) => setField("ordre", parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Disponible */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <Label>Disponible</Label>
                <button
                  type="button"
                  onClick={() => setField("disponible", !modal.item.disponible)}
                  className="flex items-center gap-2 text-[13px] text-bp-text-2 hover:text-bp-text transition"
                >
                  {modal.item.disponible
                    ? <ToggleRight className="h-6 w-6 text-bp-gold" />
                    : <ToggleLeft className="h-6 w-6 text-bp-muted" />}
                  {modal.item.disponible ? "Actif" : "Masqué"}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving === "modal"}
                className="flex-1"
              >
                {saving === "modal" ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : modal.mode === "create" ? "Créer l'article" : "Enregistrer"}
              </Button>
              <Button variant="secondary" onClick={closeModal} className="flex-1">
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
