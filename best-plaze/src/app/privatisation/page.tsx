"use client";

import { useState, useCallback } from "react";
import {
  Users, CalendarDays, Sparkles, Music, ChefHat, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";

const TYPES_EVENEMENT = [
  "—", "Anniversaire", "EVJF / EVG", "Soirée privée", "Corporate / Afterwork",
  "Tournage / Shooting", "Autre",
] as const;

const BUDGETS = ["—", "< 500€", "500 – 1 000€", "1 000 – 2 500€", "> 2 500€"] as const;

/** Date locale YYYY-MM-DD */
function todayPlusLocal(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type FormState = {
  prenom: string; nom: string; email: string; telephone: string;
  date: string; nb_personnes: string; type_evenement: string;
  budget_range: string; message: string;
};

const EMPTY: FormState = {
  prenom: "", nom: "", email: "", telephone: "",
  date: todayPlusLocal(7), nb_personnes: "", type_evenement: "—",
  budget_range: "—", message: "",
};

const perks = [
  { icon: Users,    title: "Espace exclusif",   body: "Lounge, terrasse ou salle entière réservée rien que pour vous." },
  { icon: Music,    title: "Ambiance sur mesure", body: "DJ, playlist personnalisée, éclairage adapté à votre événement." },
  { icon: ChefHat,  title: "Service dédié",      body: "Équipe attribuée, cocktails signature, tapas et buffet à la carte." },
  { icon: Shield,   title: "Discrétion totale",  body: "Accès privatif, confidentialité garantie pour vos invités." },
];

export default function PrivatisationPage() {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function setField(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  }

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (!form.prenom || !form.nom || !form.email || !form.date) {
      setError("Veuillez remplir les champs obligatoires : prénom, nom, email, date.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Adresse email invalide.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/privatisation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom:         form.prenom.trim(),
          nom:            form.nom.trim(),
          email:          form.email.trim(),
          telephone:      form.telephone.trim() || undefined,
          date:           form.date,
          nb_personnes:   form.nb_personnes ? parseInt(form.nb_personnes) : undefined,
          type_evenement: form.type_evenement !== "—" ? form.type_evenement : undefined,
          budget_range:   form.budget_range !== "—" ? form.budget_range : undefined,
          message:        form.message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Une erreur est survenue."); return; }
      window.location.href = `/privatisation/success?id=${data.request.id}`;
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  return (
    <div className="space-y-10">
      <SectionTitle
        eyebrow="Privatisation"
        title="Réservez l'espace entier"
        description="Anniversaire, soirée privée, corporate… Créez une expérience exclusive dans notre univers noir & or."
      />

      {/* Atouts */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {perks.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title} className="p-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-bp-gold/20 bg-bp-gold/10">
                <Icon className="h-5 w-5 text-bp-gold" />
              </div>
              <p className="text-[14px] font-medium text-bp-text">{p.title}</p>
              <p className="text-[13px] leading-6 text-bp-text-2">{p.body}</p>
            </Card>
          );
        })}
      </div>

      {/* Formulaire */}
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-2 rounded-2xl border border-bp-gold/20 bg-bp-gold/8 px-4 py-3">
          <Sparkles className="h-4 w-4 text-bp-gold shrink-0" />
          <p className="text-[13px] text-bp-text-2">
            Notre équipe vous contacte sous 24h pour affiner les détails et établir un devis personnalisé.
          </p>
        </div>

        <Card className="p-6 space-y-5">
          <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">Votre demande</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Prénom <span className="text-red-400">*</span></Label>
              <Input
                placeholder="Camille"
                autoComplete="given-name"
                value={form.prenom}
                onChange={(e) => setField("prenom", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nom <span className="text-red-400">*</span></Label>
              <Input
                placeholder="Durand"
                autoComplete="family-name"
                value={form.nom}
                onChange={(e) => setField("nom", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email <span className="text-red-400">*</span></Label>
              <Input
                type="email"
                placeholder="camille@email.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Téléphone</Label>
              <Input
                inputMode="tel"
                placeholder="+33 6 12 34 56 78"
                value={form.telephone}
                onChange={(e) => setField("telephone", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date souhaitée <span className="text-red-400">*</span></Label>
              <Input
                type="date"
                min={todayPlusLocal(3)}
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nombre de personnes estimé</Label>
              <Input
                type="number"
                min="1"
                max="200"
                placeholder="50"
                value={form.nb_personnes}
                onChange={(e) => setField("nb_personnes", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type d&apos;événement</Label>
              <Select value={form.type_evenement} onChange={(e) => setField("type_evenement", e.target.value)}>
                {TYPES_EVENEMENT.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Budget estimé</Label>
              <Select value={form.budget_range} onChange={(e) => setField("budget_range", e.target.value)}>
                {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Message & besoins spécifiques</Label>
              <Textarea
                placeholder="Décrivez votre événement, vos attentes, vos contraintes…"
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
              {error}
            </p>
          )}

          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? "Envoi en cours…" : "Envoyer ma demande de privatisation"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
