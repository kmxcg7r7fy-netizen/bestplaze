"use client";

import { useEffect, useState } from "react";
import { Loader, Plus, Trash2, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type ClosureRow = { id: string; date: string; motif?: string };

/** YYYY-MM-DD local (évite le décalage UTC) */
function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function AdminClosuresPage() {
  const [closures, setClosures] = useState<ClosureRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm]         = useState({ date: "", motif: "" });
  const [error, setError]       = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await getBrowserSupabaseClient()
      .from("closures")
      .select()
      .order("date");
    setClosures((data as ClosureRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    async function init() { await load(); }
    init();
  }, []);

  async function handleAdd() {
    setError(null);
    if (!form.date) { setError("Veuillez choisir une date."); return; }
    if (closures.some((c) => c.date === form.date)) {
      setError("Cette date est déjà fermée."); return;
    }
    setSaving(true);
    const { error: err } = await getBrowserSupabaseClient()
      .from("closures")
      .insert({ date: form.date, motif: form.motif.trim() || null });
    if (err) { setError(err.message); setSaving(false); return; }
    setForm({ date: "", motif: "" });
    await load();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await getBrowserSupabaseClient().from("closures").delete().eq("id", id);
    setClosures((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  }

  const upcoming = closures.filter((c) => c.date >= todayLocal());
  const past     = closures.filter((c) => c.date < todayLocal());

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Administration" title="Fermetures exceptionnelles" />

      {/* Formulaire ajout */}
      <div className="rounded-3xl border border-white/10 bg-black/20 p-6 space-y-4">
        <p className="text-[13px] uppercase tracking-[0.16em] text-bp-muted">Ajouter une fermeture</p>
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr_auto] items-end">
          <div className="space-y-1.5">
            <Label>Date <span className="text-red-400">*</span></Label>
            <Input
              type="date"
              min={todayLocal()}
              value={form.date}
              onChange={(e) => { setForm((f) => ({ ...f, date: e.target.value })); setError(null); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Motif (optionnel)</Label>
            <Input
              placeholder="Jour férié, événement privé…"
              value={form.motif}
              onChange={(e) => setForm((f) => ({ ...f, motif: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            />
          </div>
          <Button onClick={handleAdd} disabled={saving} className="h-[50px]">
            {saving ? <Loader className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Ajouter</>}
          </Button>
        </div>
        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-400">
            {error}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader className="h-6 w-6 animate-spin text-bp-gold" />
        </div>
      ) : closures.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-bp-muted">
          <CalendarX className="h-8 w-8 opacity-40" />
          <p className="text-[13px]">Aucune fermeture enregistrée.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-bp-muted px-1">À venir</p>
              <ClosureList rows={upcoming} deleting={deleting} onDelete={handleDelete} />
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-2 opacity-50">
              <p className="text-[11px] uppercase tracking-[0.16em] text-bp-muted px-1">Passées</p>
              <ClosureList rows={past} deleting={deleting} onDelete={handleDelete} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ClosureList({
  rows, deleting, onDelete,
}: {
  rows: ClosureRow[];
  deleting: string | null;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      {rows.map((c, i) => (
        <div
          key={c.id}
          className={`flex items-center justify-between gap-4 px-5 py-3.5 ${i > 0 ? "border-t border-white/6" : ""}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-bp-gold/20 bg-bp-gold/8">
              <CalendarX className="h-4 w-4 text-bp-gold" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-bp-text">{formatDate(c.date)}</p>
              {c.motif && <p className="text-[12px] text-bp-muted">{c.motif}</p>}
            </div>
          </div>
          <button
            onClick={() => onDelete(c.id)}
            disabled={deleting === c.id}
            className="text-bp-muted hover:text-red-400 transition disabled:opacity-40"
            aria-label="Supprimer"
          >
            {deleting === c.id
              ? <Loader className="h-4 w-4 animate-spin" />
              : <Trash2 className="h-4 w-4" />}
          </button>
        </div>
      ))}
    </div>
  );
}
