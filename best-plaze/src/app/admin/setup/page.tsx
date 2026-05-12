"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User, Building2, CreditCard, Settings2,
  Eye, EyeOff, CheckCircle, Loader, ChevronRight, AlertCircle,
} from "lucide-react";
import { Button }       from "@/components/ui/Button";
import { Card }         from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

// ─── Petit composant champ ────────────────────────────────────────────────────

function Field({
  label, id, error, children,
}: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[12px] text-red-400">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Barre de progression ─────────────────────────────────────────────────────

function StepBar({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Compte",        icon: User },
    { n: 2, label: "Stripe",        icon: CreditCard },
    { n: 3, label: "Configuration", icon: Settings2 },
  ];
  return (
    <div className="flex items-center justify-center gap-2 pb-8">
      {steps.map(({ n, label, icon: Icon }, i) => (
        <div key={n} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
            step === n
              ? "bg-bp-gold text-black"
              : step > n
              ? "bg-green-500/20 text-green-400"
              : "bg-white/6 text-bp-muted"
          }`}>
            {step > n ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <Icon className="h-3.5 w-3.5" />
            )}
            {label}
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 shrink-0 text-white/20" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Étape 1 — Création du compte admin ──────────────────────────────────────

function Step1({ onNext }: { onNext: (email: string) => void }) {
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", password: "", confirm: "",
    nom_etablissement: "XI BestPlaze", telephone: "", adresse: "",
  });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const next = { ...e }; delete next[k]; return next; });
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.prenom.trim())   errs.prenom = "Requis";
    if (!form.nom.trim())      errs.nom    = "Requis";
    if (!form.email.includes("@")) errs.email = "Email invalide";
    if (form.password.length < 8)  errs.password = "8 caractères minimum";
    else if (!/[A-Z]/.test(form.password)) errs.password = "1 majuscule requise";
    else if (!/[0-9]/.test(form.password)) errs.password = "1 chiffre requis";
    if (form.password !== form.confirm) errs.confirm = "Les mots de passe ne correspondent pas";
    if (!form.nom_etablissement.trim()) errs.nom_etablissement = "Requis";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // Crée l'utilisateur via l'API (service role)
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:             form.email.trim().toLowerCase(),
          password:          form.password,
          prenom:            form.prenom.trim(),
          nom:               form.nom.trim(),
          nom_etablissement: form.nom_etablissement.trim(),
          telephone:         form.telephone.trim(),
          adresse:           form.adresse.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors({ _global: data.error ?? "Une erreur est survenue." });
        setLoading(false);
        return;
      }

      // Connexion côté client
      const supabase = getBrowserSupabaseClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (signInErr) {
        setErrors({ _global: "Compte créé mais connexion échouée. Rafraîchissez la page." });
        setLoading(false);
        return;
      }

      // Sauvegarde l'email dans localStorage pour persistance
      localStorage.setItem("bp_setup_email", form.email.trim().toLowerCase());
      localStorage.setItem("bp_setup_step",  "2");
      onNext(form.email.trim().toLowerCase());
    } catch {
      setErrors({ _global: "Erreur réseau. Réessayez." });
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors._global && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-[13px] text-red-400">
          {errors._global}
        </div>
      )}

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-bp-muted">
          <User className="h-3.5 w-3.5" /> Votre compte administrateur
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom" id="prenom" error={errors.prenom}>
            <Input id="prenom" value={form.prenom} onChange={(e) => set("prenom", e.target.value)} autoComplete="given-name" />
          </Field>
          <Field label="Nom" id="nom" error={errors.nom}>
            <Input id="nom" value={form.nom} onChange={(e) => set("nom", e.target.value)} autoComplete="family-name" />
          </Field>
        </div>

        <Field label="Email professionnel" id="email" error={errors.email}>
          <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
        </Field>

        <Field label="Mot de passe" id="password" error={errors.password}>
          <div className="relative">
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              autoComplete="new-password"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-bp-muted hover:text-bp-text"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[11px] text-bp-muted">8 caractères min., 1 majuscule, 1 chiffre</p>
        </Field>

        <Field label="Confirmer le mot de passe" id="confirm" error={errors.confirm}>
          <Input
            id="confirm"
            type={showPwd ? "text" : "password"}
            value={form.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            autoComplete="new-password"
          />
        </Field>
      </Card>

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-bp-muted">
          <Building2 className="h-3.5 w-3.5" /> Votre établissement
        </div>

        <Field label="Nom de l'établissement" id="nom_etablissement" error={errors.nom_etablissement}>
          <Input id="nom_etablissement" value={form.nom_etablissement} onChange={(e) => set("nom_etablissement", e.target.value)} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Téléphone" id="telephone" error={errors.telephone}>
            <Input id="telephone" type="tel" value={form.telephone} onChange={(e) => set("telephone", e.target.value)} />
          </Field>
          <div className="sm:col-span-1" />
        </div>

        <Field label="Adresse complète" id="adresse" error={errors.adresse}>
          <Input id="adresse" value={form.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder="56 Rue de Suède, 37100 Tours" />
        </Field>
      </Card>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <><Loader className="h-4 w-4 animate-spin" /> Création du compte…</> : <>Créer mon compte <ChevronRight className="h-4 w-4" /></>}
      </Button>
    </form>
  );
}

// ─── Étape 2 — Stripe Connect ─────────────────────────────────────────────────

function Step2({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [loading, setLoading]       = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Vérifier si on revient de Stripe avec une erreur
  const searchParams = useSearchParams();
  useEffect(() => {
    const err = searchParams.get("stripe_error");
    if (err) {
      const msgs: Record<string, string> = {
        state_mismatch: "Problème de sécurité lors de la connexion Stripe. Réessayez.",
        no_code:        "Stripe n'a pas retourné de code d'autorisation.",
        access_denied:  "Vous avez refusé l'autorisation Stripe.",
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStripeError(msgs[err] ?? `Erreur Stripe : ${err}`);
    }
  }, [searchParams]);

  async function handleConnect() {
    setLoading(true);
    try {
      const res  = await fetch("/api/stripe/connect/authorize");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStripeError(data.error ?? "Impossible d'obtenir l'URL Stripe.");
        setLoading(false);
      }
    } catch {
      setStripeError("Erreur réseau. Réessayez.");
      setLoading(false);
    }
  }

  function handleSkip() {
    localStorage.setItem("bp_setup_step", "3");
    onSkip();
  }

  return (
    <div className="space-y-6">
      {stripeError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-[13px] text-red-400">
          {stripeError}
        </div>
      )}

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bp-gold/15">
            <CreditCard className="h-5 w-5 text-bp-gold" />
          </div>
          <div>
            <p className="font-medium text-bp-text">Connectez votre compte Stripe</p>
            <p className="text-[12px] text-bp-muted">Recevez les acomptes directement sur votre compte</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/20 p-4 space-y-3 text-[13px] text-bp-text-2 leading-relaxed">
          <p>
            Stripe est le système de paiement utilisé par votre plateforme de réservation.
            En connectant votre compte, les acomptes versés par vos clients lors d&apos;une réservation
            sont <strong className="text-bp-text">versés directement sur votre compte bancaire</strong>.
          </p>
          <p>
            Si vous n&apos;avez pas encore de compte Stripe, ne vous inquiétez pas :
            Stripe vous guidera pour en créer un gratuitement. Vous aurez besoin de votre
            IBAN et d&apos;une pièce d&apos;identité.
          </p>
        </div>

        <div className="grid gap-2 text-[12px] text-bp-muted">
          {["Aucun abonnement requis — Stripe prend 1,4% + 0,25€ par transaction", "Virements automatiques sous 2 à 7 jours ouvrés", "Tableau de bord Stripe inclus pour suivre vos revenus"].map((txt) => (
            <div key={txt} className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
              {txt}
            </div>
          ))}
        </div>

        <Button onClick={handleConnect} disabled={loading} className="w-full">
          {loading
            ? <><Loader className="h-4 w-4 animate-spin" /> Redirection vers Stripe…</>
            : <><CreditCard className="h-4 w-4" /> Créer ou connecter mon compte Stripe</>
          }
        </Button>
      </Card>

      <div className="text-center">
        <button
          type="button"
          onClick={handleSkip}
          className="text-[13px] text-bp-muted hover:text-bp-text-2 underline-offset-2 hover:underline transition"
        >
          Passer cette étape — je configurerai Stripe plus tard
        </button>
      </div>
    </div>
  );
}

// ─── Étape 3 — Configuration de base ─────────────────────────────────────────

function Step3({ onFinish }: { onFinish: () => void }) {
  const [form, setForm] = useState({
    pourcentage_acompte:  30,
    montant_min_acompte:  20,
    message_confirmation: "Votre réservation au XI BestPlaze est confirmée ! Nous avons hâte de vous accueillir.",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Vérifier si Stripe a bien été connecté (paramètre URL)
  const searchParams  = useSearchParams();
  const stripeOk      = searchParams.get("stripe_ok") === "1";

  async function handleFinish() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la sauvegarde.");
        setLoading(false);
        return;
      }
      // Nettoyer localStorage
      localStorage.removeItem("bp_setup_step");
      localStorage.removeItem("bp_setup_email");
      onFinish();
    } catch {
      setError("Erreur réseau. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {stripeOk && (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-[13px] text-green-400 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Stripe connecté avec succès ! Les acomptes seront virés automatiquement.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-[13px] text-red-400">
          {error}
        </div>
      )}

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-bp-muted">
          <Settings2 className="h-3.5 w-3.5" /> Politique d&apos;acompte
        </div>

        {/* Slider acompte */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Pourcentage d&apos;acompte demandé</Label>
            <span className="rounded-xl bg-bp-gold/15 px-3 py-1 font-serif text-[20px] text-bp-gold">
              {form.pourcentage_acompte}%
            </span>
          </div>
          <input
            type="range"
            min={10} max={100} step={5}
            value={form.pourcentage_acompte}
            onChange={(e) => setForm((f) => ({ ...f, pourcentage_acompte: parseInt(e.target.value) }))}
            className="w-full accent-[var(--bp-gold)]"
          />
          <div className="flex justify-between text-[11px] text-bp-muted">
            <span>10%</span><span>50%</span><span>100%</span>
          </div>
          <p className="text-[12px] text-bp-muted">
            Pour une réservation avec 100€ de pré-sélection, l&apos;acompte sera de{" "}
            <strong className="text-bp-text">{form.pourcentage_acompte}€</strong>.
          </p>
        </div>

        {/* Montant minimum */}
        <div className="space-y-1.5">
          <Label htmlFor="min_acompte">Montant minimum d&apos;acompte (€)</Label>
          <Input
            id="min_acompte"
            type="number"
            min={0}
            value={form.montant_min_acompte}
            onChange={(e) => setForm((f) => ({ ...f, montant_min_acompte: parseFloat(e.target.value) || 0 }))}
          />
          <p className="text-[12px] text-bp-muted">
            Appliqué quand aucun article n&apos;est pré-sélectionné.
          </p>
        </div>
      </Card>

      {/* Message de confirmation */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-bp-muted">
          Message de confirmation
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="msg_confirm">Texte envoyé à vos clients après paiement</Label>
          <textarea
            id="msg_confirm"
            rows={3}
            value={form.message_confirmation}
            onChange={(e) => setForm((f) => ({ ...f, message_confirmation: e.target.value }))}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-[15px] text-bp-text placeholder:text-white/35 outline-none transition focus:border-bp-gold/35 focus:ring-2 focus:ring-bp-gold/20"
          />
        </div>
      </Card>

      <Button onClick={handleFinish} disabled={loading} className="w-full">
        {loading
          ? <><Loader className="h-4 w-4 animate-spin" /> Finalisation…</>
          : <><CheckCircle className="h-4 w-4" /> Terminer la configuration</>
        }
      </Button>
    </div>
  );
}

// ─── Page principale (wrapper Suspense) ──────────────────────────────────────

function AdminSetupInner() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [done, setDone] = useState(false);

  // Déterminer l'étape initiale
  useEffect(() => {
    const urlStep = searchParams.get("step");
    const lsStep  = localStorage.getItem("bp_setup_step");

    /* eslint-disable react-hooks/set-state-in-effect */
    if (urlStep === "3") {
      setStep(3);
    } else if (urlStep === "2") {
      setStep(2);
    } else if (lsStep === "3") {
      setStep(3);
    } else if (lsStep === "2") {
      setStep(2);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [searchParams]);

  function handleFinish() {
    setDone(true);
    setTimeout(() => router.replace("/admin"), 1500);
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <CheckCircle className="h-16 w-16 text-bp-gold" />
        <h1 className="font-serif text-[32px] text-bp-text">Configuration terminée !</h1>
        <p className="text-bp-text-2">Bienvenue sur votre tableau de bord XI BestPlaze.</p>
        <Loader className="mt-2 h-5 w-5 animate-spin text-bp-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-bp-gold mb-3">XI BestPlaze</p>
          <h1 className="font-serif text-[32px] leading-tight text-bp-text">
            Bienvenue sur votre plateforme
          </h1>
          <p className="mt-2 text-bp-text-2">
            Configurez votre espace en 3 étapes — cela prend moins de 5 minutes.
          </p>
        </div>

        <StepBar step={step} />

        {step === 1 && (
          <Step1 onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Step2
            onNext={() => { localStorage.setItem("bp_setup_step", "3"); setStep(3); }}
            onSkip={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3 onFinish={handleFinish} />
        )}
      </div>
    </div>
  );
}

export default function AdminSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-bp-gold" />
        </div>
      }
    >
      <AdminSetupInner />
    </Suspense>
  );
}
