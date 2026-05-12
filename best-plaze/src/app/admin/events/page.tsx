"use client";

import { useEffect, useState, useRef } from "react";
import { Loader, Plus, Star, Eye, EyeOff, Pencil, Trash2, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { Badge }       from "@/components/ui/Badge";
import { Button }      from "@/components/ui/Button";
import { Card }        from "@/components/ui/Card";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { eventSchema, type EventInput } from "@/lib/validations";

type EventRow = {
  id: string; titre: string; description?: string; date: string;
  heure_debut: string; heure_fin?: string; type: string; dress_code?: string;
  prix_entree: number; capacite_max?: number; a_la_une: boolean;
  statut: string; image_url?: string | null; created_at: string;
};

const EVENT_TYPES = ["DJ Set", "Live Music", "Afterwork", "Soirée à thème", "Dinner & Lounge", "Autre"];
const STATUT_COLOR: Record<string, "gold" | "soft" | "outline"> = {
  published: "gold", draft: "soft", cancelled: "outline",
};

const EMPTY_FORM: EventInput & { image_url?: string | null } = {
  titre: "", description: "", date: "", heure_debut: "22:00", heure_fin: "",
  type: "DJ Set", dress_code: "", prix_entree: 0, capacite_max: undefined,
  a_la_une: false, statut: "published", image_url: null,
};

// ─── Sous-composant champ de formulaire ──────────────────────────────────────
function FormField({ label, err, children }: { label: string; err?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {err && <p className="text-[12px] text-red-400">{err}</p>}
    </div>
  );
}

export default function AdminEventsPage() {
  const [events, setEvents]     = useState<EventRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<string | null>(null);
  const [form, setForm]         = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const { data } = await getBrowserSupabaseClient()
      .from("events")
      .select()
      .order("date", { ascending: false });
    setEvents((data as EventRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      const { data } = await getBrowserSupabaseClient()
        .from("events")
        .select()
        .order("date", { ascending: false });
      setEvents((data as EventRow[]) ?? []);
      setLoading(false);
    }
    init();
  }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setFormErrors({});
    setUploadProgress("idle");
    setShowForm(true);
  }

  function openEdit(ev: EventRow) {
    setForm({
      titre: ev.titre, description: ev.description ?? "", date: ev.date,
      heure_debut: ev.heure_debut, heure_fin: ev.heure_fin ?? "",
      type: ev.type as EventInput["type"], dress_code: ev.dress_code ?? "",
      prix_entree: ev.prix_entree, capacite_max: ev.capacite_max,
      a_la_une: ev.a_la_une, statut: ev.statut as EventInput["statut"],
      image_url: ev.image_url ?? null,
    });
    setEditing(ev.id);
    setFormErrors({});
    setUploadProgress("idle");
    setShowForm(true);
  }

  async function handleImageUpload(file: File) {
    setUploadProgress("uploading");
    const supabase = getBrowserSupabaseClient();
    const ext      = file.name.split(".").pop() ?? "jpg";
    const path     = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("events").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      setUploadProgress("error");
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("events").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: publicUrl }));
    setUploadProgress("done");
  }

  async function removeImage() {
    setForm((f) => ({ ...f, image_url: null }));
    setUploadProgress("idle");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSave() {
    const parsed = eventSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((e) => { errs[e.path[0] as string] = e.message; });
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    const supabase = getBrowserSupabaseClient();
    const payload = {
      titre:        parsed.data.titre,
      description:  parsed.data.description || null,
      date:         parsed.data.date,
      heure_debut:  parsed.data.heure_debut,
      heure_fin:    parsed.data.heure_fin || null,
      type:         parsed.data.type,
      dress_code:   parsed.data.dress_code || null,
      prix_entree:  parsed.data.prix_entree,
      capacite_max: parsed.data.capacite_max ?? null,
      a_la_une:     parsed.data.a_la_une,
      statut:       parsed.data.statut,
      image_url:    form.image_url ?? null,
    };

    if (editing) {
      await supabase.from("events").update(payload).eq("id", editing);
    } else {
      await supabase.from("events").insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    load();
  }

  async function toggleAlaUne(id: string, current: boolean) {
    await getBrowserSupabaseClient().from("events").update({ a_la_une: !current }).eq("id", id);
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, a_la_une: !current } : e));
  }

  async function toggleStatut(id: string, current: string) {
    const next = current === "published" ? "draft" : "published";
    await getBrowserSupabaseClient().from("events").update({ statut: next }).eq("id", id);
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, statut: next } : e));
  }

  async function deleteEvent(id: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    await getBrowserSupabaseClient().from("events").delete().eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle eyebrow="Administration" title="Événements" />
        <Button onClick={openNew} className="shrink-0">
          <Plus className="h-4 w-4" /> Créer
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="h-7 w-7 animate-spin text-bp-gold" /></div>
      ) : events.length === 0 ? (
        <Card className="p-8 text-center text-bp-text-2">
          Aucun événement.{" "}
          <button onClick={openNew} className="text-bp-gold hover:underline">Créer le premier →</button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((ev) => (
            <Card key={ev.id} className="overflow-hidden">
              {/* Vignette image */}
              {ev.image_url ? (
                <div className="relative h-32 w-full overflow-hidden">
                  <Image
                    src={ev.image_url}
                    alt={ev.titre}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <Badge variant={STATUT_COLOR[ev.statut] ?? "soft"}>
                      {ev.statut === "published" ? "Publié" : ev.statut === "draft" ? "Brouillon" : "Annulé"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex h-16 items-center justify-between bg-white/4 px-4">
                  <Badge variant={STATUT_COLOR[ev.statut] ?? "soft"}>
                    {ev.statut === "published" ? "Publié" : ev.statut === "draft" ? "Brouillon" : "Annulé"}
                  </Badge>
                  <span className="text-[11px] text-bp-muted">Aucune photo</span>
                </div>
              )}

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-serif text-[16px] text-bp-text">{ev.titre}</p>
                    <p className="text-[13px] text-bp-text-2 mt-0.5">
                      {new Date(ev.date + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      {" · "}{ev.heure_debut}
                    </p>
                    <p className="text-[12px] text-bp-muted mt-0.5">{ev.type}{ev.dress_code ? ` · ${ev.dress_code}` : ""}</p>
                  </div>
                  {ev.a_la_une && <Badge variant="gold">★ À la une</Badge>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => openEdit(ev)} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-3 py-1.5 text-[12px] text-bp-text-2 hover:bg-white/12">
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </button>
                  <button onClick={() => toggleAlaUne(ev.id, ev.a_la_une)} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-3 py-1.5 text-[12px] text-bp-text-2 hover:bg-white/12">
                    <Star className="h-3.5 w-3.5" /> {ev.a_la_une ? "Retirer" : "À la une"}
                  </button>
                  <button onClick={() => toggleStatut(ev.id, ev.statut)} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-3 py-1.5 text-[12px] text-bp-text-2 hover:bg-white/12">
                    {ev.statut === "published" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {ev.statut === "published" ? "Dépublier" : "Publier"}
                  </button>
                  <button onClick={() => deleteEvent(ev.id)} className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-1.5 text-[12px] text-red-400 hover:bg-red-500/14">
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <p className="font-serif text-[20px] text-bp-text">
              {editing ? "Modifier l'événement" : "Nouvel événement"}
            </p>

            {/* ── Upload photo ─────────────────────────────────── */}
            <div className="space-y-2">
              <Label>Photo de l&apos;événement</Label>
              {form.image_url ? (
                <div className="relative overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={form.image_url}
                    alt="Aperçu"
                    width={600}
                    height={300}
                    className="h-36 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 text-[13px] transition ${
                  uploadProgress === "uploading"
                    ? "border-bp-gold/40 text-bp-gold"
                    : uploadProgress === "error"
                    ? "border-red-500/40 text-red-400"
                    : "border-white/15 text-bp-muted hover:border-white/30 hover:text-bp-text-2"
                }`}>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  {uploadProgress === "uploading" ? (
                    <><Loader className="h-5 w-5 animate-spin" /> Envoi en cours…</>
                  ) : uploadProgress === "error" ? (
                    <><ImagePlus className="h-5 w-5" /> Erreur — réessayer</>
                  ) : (
                    <><ImagePlus className="h-5 w-5" /> Cliquez pour ajouter une photo<br />
                    <span className="text-[11px]">JPG, PNG ou WebP · max 5 Mo</span></>
                  )}
                </label>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Titre *" err={formErrors.titre}>
                  <Input value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} placeholder="Soirée Black & Gold" />
                </FormField>
              </div>
              <FormField label="Date *" err={formErrors.date}>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </FormField>
              <FormField label="Heure début *" err={formErrors.heure_debut}>
                <Input type="time" value={form.heure_debut} onChange={(e) => setForm((f) => ({ ...f, heure_debut: e.target.value }))} />
              </FormField>
              <FormField label="Type *" err={formErrors.type}>
                <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as EventInput["type"] }))}>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </FormField>
              <FormField label="Dress code">
                <Input value={form.dress_code ?? ""} onChange={(e) => setForm((f) => ({ ...f, dress_code: e.target.value }))} placeholder="Chic nocturne" />
              </FormField>
              <FormField label="Prix d'entrée (0 = gratuit)">
                <Input type="number" min={0} step={0.5} value={form.prix_entree} onChange={(e) => setForm((f) => ({ ...f, prix_entree: parseFloat(e.target.value) || 0 }))} />
              </FormField>
              <FormField label="Statut">
                <Select value={form.statut} onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value as EventInput["statut"] }))}>
                  <option value="published">Publié</option>
                  <option value="draft">Brouillon</option>
                  <option value="cancelled">Annulé</option>
                </Select>
              </FormField>
              <div className="sm:col-span-2">
                <FormField label="Description" err={formErrors.description}>
                  <Textarea value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description de l'événement…" />
                </FormField>
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  id="a_la_une"
                  type="checkbox"
                  checked={form.a_la_une}
                  onChange={(e) => setForm((f) => ({ ...f, a_la_une: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 bg-black/20"
                />
                <label htmlFor="a_la_une" className="text-[14px] text-bp-text-2 cursor-pointer">
                  Mettre à la une (affiché en premier sur la page événements)
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={handleSave} disabled={saving || uploadProgress === "uploading"}>
                {saving ? <><Loader className="h-4 w-4 animate-spin" /> Enregistrement…</> : (editing ? "Mettre à jour" : "Créer l'événement")}
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
