"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type Status = "idle" | "loading" | "error";

export default function AccountLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [status, setStatus]     = useState<Status>("idle");
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const supabase = getBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      setError(
        authError.message.includes("Invalid login")
          ? "Email ou mot de passe incorrect."
          : authError.message,
      );
      setStatus("error");
      return;
    }

    router.push("/account");
    router.refresh();
  }

  async function handleMagicLink() {
    if (!email.trim()) {
      setError("Entrez votre email pour recevoir un lien de connexion.");
      return;
    }
    setStatus("loading");
    const supabase = getBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError(authError.message);
      setStatus("error");
    } else {
      setError("");
      setStatus("idle");
      alert(`Un lien de connexion a été envoyé à ${email}`);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8 py-16">
      <div className="space-y-2 text-center">
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
          Espace membre
        </p>
        <h1 className="font-serif text-[32px] text-bp-text">Connexion</h1>
        <p className="text-[14px] text-bp-text-2">
          Pas encore de compte ?{" "}
          <Link href="/account/register" className="text-bp-gold hover:underline underline-offset-2">
            Créer un compte
          </Link>
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[12px] text-bp-muted hover:text-bp-gold transition"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bp-muted hover:text-bp-text transition"
                aria-label={showPwd ? "Masquer" : "Afficher le mot de passe"}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? (
              <><Loader className="h-4 w-4 animate-spin" /> Connexion…</>
            ) : (
              <><LogIn className="h-4 w-4" /> Se connecter</>
            )}
          </Button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/8" />
          <span className="text-[12px] text-bp-muted">ou</span>
          <div className="h-px flex-1 bg-white/8" />
        </div>

        <button
          type="button"
          onClick={handleMagicLink}
          disabled={status === "loading"}
          className="mt-4 w-full rounded-full border border-white/10 bg-white/6 px-5 py-3 text-[14px] text-bp-text-2 transition hover:bg-white/10 disabled:opacity-50"
        >
          Recevoir un lien par email
        </button>
      </Card>
    </div>
  );

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Entrez votre email pour réinitialiser votre mot de passe.");
      return;
    }
    const supabase = getBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/account` },
    );
    if (authError) {
      setError(authError.message);
    } else {
      alert(`Un email de réinitialisation a été envoyé à ${email}.`);
    }
  }
}
