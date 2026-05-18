"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { registerSchema } from "@/lib/validations";

export default function AccountRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", password: "", confirmPassword: "",
  });
  const [showPwd, setShowPwd]   = useState(false);
  const [status, setStatus]     = useState<"idle" | "loading" | "success">("idle");
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setErrors({});

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        const key = err.path[0] as string;
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setStatus("loading");
    const supabase = getBrowserSupabaseClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email:    form.email.trim().toLowerCase(),
      password: form.password,
      options:  {
        data: {
          prenom:    form.prenom.trim(),
          nom:       form.nom.trim(),
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setGlobalError("Cet email est déjà utilisé. Connectez-vous.");
      } else {
        setGlobalError(signUpError.message);
      }
      setStatus("idle");
      return;
    }

    // Mettre à jour le profil avec prenom/nom
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({
        id:     user.id,
        email:  form.email.trim().toLowerCase(),
        prenom: form.prenom.trim(),
        nom:    form.nom.trim(),
      });
    }

    setStatus("success");
    setTimeout(() => {
      router.push("/account");
      router.refresh();
    }, 1500);
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-md py-16 text-center space-y-4">
        <p className="font-serif text-[28px] text-bp-text">Compte créé !</p>
        <p className="text-bp-text-2">Bienvenue chez XI BestPlaze. Redirection…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-8 py-16">
      <div className="space-y-2 text-center">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
          Espace membre
        </p>
        <h1 className="font-serif text-[32px] text-bp-text">Créer un compte</h1>
        <p className="text-[14px] text-bp-text-2">
          Déjà membre ?{" "}
          <Link href="/account/login" className="text-bp-gold hover:underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" error={errors.prenom}>
              <Input
                placeholder="Camille"
                autoComplete="given-name"
                value={form.prenom}
                onChange={(e) => update("prenom", e.target.value)}
              />
            </Field>
            <Field label="Nom" error={errors.nom}>
              <Input
                placeholder="Durand"
                autoComplete="family-name"
                value={form.nom}
                onChange={(e) => update("nom", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Email" error={errors.email}>
            <Input
              type="email"
              placeholder="votre@email.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>

          <Field label="Mot de passe" error={errors.password}>
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                placeholder="8 caractères minimum"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bp-muted hover:text-bp-text"
                aria-label={showPwd ? "Masquer" : "Afficher le mot de passe"}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Field label="Confirmer le mot de passe" error={errors.confirmPassword}>
            <Input
              type={showPwd ? "text" : "password"}
              placeholder="Répétez le mot de passe"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
            />
          </Field>

          {globalError && (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
              {globalError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? (
              <><Loader className="h-4 w-4 animate-spin" /> Création…</>
            ) : (
              <><UserPlus className="h-4 w-4" /> Créer mon compte</>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
