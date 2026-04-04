"use client";

import { useEffect, useState } from "react";
import {
  Loader, Save, CheckCircle, ExternalLink,
  CreditCard, Unlink,
} from "lucide-react";
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
  stripe_connected: boolean;
  stripe_account_id?: string;
  stripe_account_email?: string;
  stripe_onboarding_complete?: boolean;
  pourcentage_acompte: number;
  montant_min_acompte: number;
  delai_annulation_heures: number;
  capacite_max_lounge: number;
  capacite_max_terrasse: number;
  capacite_max_salle: number;
  message_confirmation: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings]           = useState<Settings | null>(null);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

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
        pourcentage_acompte:     settings.pourcentage_acompte,
        montant_min_acompte:     settings.montant_min_acompte,
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

  async function handleConnectStripe() {
    setStripeLoading(true);
    try {
      const res  = await fetch("/api/stripe/connect/authorize");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setStripeLoading(false);
    }
  }

  async function handleDisconnectStripe() {
    if (!settings || !confirm("Déconnecter le compte Stripe ? Les paiements resteront dans votre tableau de bord Stripe mais les futurs acomptes ne seront plus transférés automatiquement.")) return;
    await getBrowserSupabaseClient()
      .from("admin_settings")
      .update({
        stripe_connected:           false,
        stripe_account_id:          null,
        stripe_account_email:       null,
        stripe_onboarding_complete: false,
      })
      .eq("id", settings.id);
    setSettings((s) => s ? { ...s, stripe_connected: false, stripe_account_id: undefined, stripe_account_email: undefined } : s);
  }

  function update(key: keyof Settings, value: string | number | boolean) {
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

      {/* Informations bar */}
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

      {/* Stripe Connect */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-bp-gold" />
          <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Stripe Connect</p>
        </div>

        {settings.stripe_connected ? (
          <div className="space-y-4">
            {/* Compte connecté */}
            <div className="rounded-2xl border border-green-500/20 bg-green-500/8 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-[14px] font-medium">Stripe connecté</span>
                </div>
                <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[11px] text-green-400">Actif</span>
              </div>
              {settings.stripe_account_id && (
                <p className="text-[12px] text-bp-muted font-mono">{settings.stripe_account_id}</p>
              )}
              {settings.stripe_account_email && (
                <p className="text-[12px] text-bp-muted">{settings.stripe_account_email}</p>
              )}
            </div>

            <div className="flex gap-3">
              <a
                href={`https://dashboard.stripe.com/${settings.stripe_account_id ?? ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2.5 text-[13px] text-bp-text hover:bg-white/8 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Dashboard Stripe
              </a>
              <button
                onClick={handleDisconnectStripe}
                className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/8 px-4 py-2.5 text-[13px] text-red-400 hover:bg-red-500/15 transition"
              >
                <Unlink className="h-3.5 w-3.5" /> Déconnecter
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[14px] text-bp-text">Aucun compte Stripe connecté</p>
              <p className="mt-1 text-[12px] text-bp-muted">
                Connectez votre compte Stripe pour recevoir les acomptes directement sur votre compte bancaire.
              </p>
            </div>
            <Button onClick={handleConnectStripe} disabled={stripeLoading} variant="secondary">
              {stripeLoading
                ? <><Loader className="h-4 w-4 animate-spin" /> Redirection…</>
                : <><CreditCard className="h-4 w-4" /> Connecter mon compte Stripe</>
              }
            </Button>
          </div>
        )}

        <div className="border-t border-white/8 pt-4 grid gap-4 sm:grid-cols-2">
          <FieldInput
            label="Acompte (%)"
            value={String(settings.pourcentage_acompte)}
            type="number"
            onChange={(v) => update("pourcentage_acompte", parseInt(v) || 30)}
          />
          <FieldInput
            label="Acompte minimum (€)"
            value={String(settings.montant_min_acompte)}
            type="number"
            onChange={(v) => update("montant_min_acompte", parseFloat(v) || 20)}
          />
          <FieldInput
            label="Délai annulation (heures)"
            value={String(settings.delai_annulation_heures)}
            type="number"
            onChange={(v) => update("delai_annulation_heures", parseInt(v) || 24)}
          />
        </div>
      </Card>

      {/* Capacités */}
      <Card className="p-6 space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Capacités par espace</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <FieldInput label="Lounge"    value={String(settings.capacite_max_lounge)}    type="number" onChange={(v) => update("capacite_max_lounge",    parseInt(v) || 40)} />
          <FieldInput label="Terrasse"  value={String(settings.capacite_max_terrasse)}  type="number" onChange={(v) => update("capacite_max_terrasse",  parseInt(v) || 30)} />
          <FieldInput label="Salle"     value={String(settings.capacite_max_salle)}     type="number" onChange={(v) => update("capacite_max_salle",     parseInt(v) || 60)} />
        </div>
      </Card>

      {/* Message confirmation */}
      <Card className="p-6 space-y-4">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Message de confirmation</p>
        <div className="space-y-1.5">
          <Label>Texte envoyé après paiement</Label>
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
