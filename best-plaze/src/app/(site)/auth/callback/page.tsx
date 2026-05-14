"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "lucide-react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const supabase = getBrowserSupabaseClient();

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(() => {
        router.replace("/account");
      });
    } else {
      supabase.auth.getSession().then(() => {
        router.replace("/account");
      });
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-bp-text-2">
      <Loader className="h-6 w-6 animate-spin text-bp-gold" />
      <span>Connexion en cours…</span>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center gap-3 text-bp-text-2">
          <Loader className="h-6 w-6 animate-spin text-bp-gold" />
          <span>Connexion en cours…</span>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
