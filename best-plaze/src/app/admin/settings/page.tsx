"use client";

import { useEffect, useState } from "react";
import { Loader, Save, CheckCircle } from "lucide-react";
import { Button }       from "@/components/ui/Button";
import { Card }         from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type Settings = {
  id: string;
  nom_etablissement: string;
  adresse: string;
  telephone: string;
  email_contact: string;
  delai_annulation_heures: number;
  capacite_max_lounge: number;
  capacite_max_terrasse: number;
  capacite_max_salle: number;
  message_confirmation: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    getBrowserSupabaseClient()
      .from("admin_settings")
      .select()
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as Settings);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    await getBrowserSupabaseClient()
      .from("admin_settings")
      .update({
        nom_etablissement:       settings.nom_etablissement,
        adresse:                 settings.adresse,
        telephone:               settings.telephone,
        email_contact:           settings.email_contact,
        delai_annulation_heures: settings.delai_annulation_heures,
        capacite_max_lounge:     settings.capacite_max_lounge,
        capacite_max_terrasse:   settings.capacite_max_terrasse,
        capacite_max_salle:      settings.capacite_max_salle,
        message_confirmation:    settings.message_confirmation,
      })
      .eq("id", settings.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function update(key: keyof Settings, value: string | number) {
    setSettings((s) => s ? { ...s, [key]: value } : s);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-bp-gold" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="py-12 text-center text-bp-text-2">
        Paramètres non trouvés. Exécutez la migration SQL 003.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <SectionTitle eyebrow="Administration" title="Paramètres" />
        <Button onClick={handleSave} disabled={saving} className="shrink-0">
          {saving ? (
            <><Loader className="h-4 w-4 animate-spin" /> Enregistrement…</>
          ) : saved ? (
            <><CheckCircle className="h-4 w-4" /> Enregistré</>
          ) : (
            <><Save className="h-4 w-4" /> Enregistrer</>
          )}
        </Button>
      </div>

      {/* Établissement */}
      <Card className="p-6 space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Établissement</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldInput label="Nom de l'établissement" value={settings.nom_etablissement} onChange={(v) => update("nom_etablissement", v)} />
          <FieldInput label="Téléphone" value={settings.telephone} onChange={(v) => update("telephone", v)} />
          <div className="sm:col-span-2">
            <FieldInput label="Adresse" value={settings.adresse} onChange={(v) => update("adresse", v)} />
          </div>
          <div className="sm:col-span-2">
            <FieldInput label="Email de contact" value={settings.email_contact} type="email" onChange={(v) => update("email_contact", v)} />
          </div>
        </div>
      </Card>

      {/* Politiques */}
      <Card className="p-6 space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Politique d&apos;annulation</p>
        <FieldInput
          label="Délai annulation (heures)"
          value={String(settings.delai_annulation_heures)}
          type="number"
          onChange={(v) => update("delai_annulation_heures", parseInt(v) || 24)}
        />
      </Card>

      {/* Capacités */}
      <Card className="p-6 space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Capacités par espace</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <FieldInput label="Lounge"   value={String(settings.capacite_max_lounge)}   type="number" onChange={(v) => update("capacite_max_lounge",   parseInt(v) || 40)} />
          <FieldInput label="Terrasse" value={String(settings.capacite_max_terrasse)} type="number" onChange={(v) => update("capacite_max_terrasse", parseInt(v) || 30)} />
          <FieldInput label="Salle"    value={String(settings.capacite_max_salle)}    type="number" onChange={(v) => update("capacite_max_salle",    parseInt(v) || 60)} />
        </div>
      </Card>

      {/* Message confirmation */}
      <Card className="p-6 space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Message de confirmation</p>
        <div className="space-y-1.5">
          <Label>Texte envoyé au client après réservation</Label>
          <Textarea
            value={settings.message_confirmation}
            onChange={(e) => update("message_confirmation", e.target.value)}
            rows={3}
          />
        </div>
      </Card>
    </div>
  );
}

function FieldInput({
  label, value, type = "text", onChange,
}: { label: string; value: string; type?: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
