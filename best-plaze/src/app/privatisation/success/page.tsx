"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

function PrivatisationSuccessInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <div className="mx-auto max-w-lg space-y-8 py-14 text-center">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-bp-gold/20 bg-bp-gold/10">
          <CheckCircle className="h-10 w-10 text-bp-gold" />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="font-serif text-[32px] text-bp-text">Demande reçue !</h1>
        <p className="text-[15px] leading-7 text-bp-text-2">
          Votre demande de privatisation a bien été enregistrée.
          Notre équipe vous contactera sous <span className="text-bp-text">24h</span> pour
          affiner les détails et vous envoyer un devis personnalisé.
        </p>
        {id && (
          <p className="text-[13px] text-bp-muted">
            Référence : <span className="font-mono text-bp-text">{id.slice(0, 8).toUpperCase()}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button href="/">Retour à l&apos;accueil</Button>
        <Button href="/events" variant="secondary">Voir les événements</Button>
      </div>
    </div>
  );
}

export default function PrivatisationSuccessPage() {
  return (
    <Suspense>
      <PrivatisationSuccessInner />
    </Suspense>
  );
}
