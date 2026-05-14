"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/Button";

function ReservationSuccessInner() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("id");

  return (
    <div className="mx-auto max-w-lg space-y-8 py-12 text-center">
      <CheckCircle className="mx-auto h-14 w-14 text-bp-gold" />
      <div className="space-y-3">
        <h1 className="font-serif text-[32px] text-bp-text">Réservation reçue !</h1>
        <p className="text-bp-text-2">
          Votre demande a bien été enregistrée. Notre équipe la confirmera dans les plus brefs délais.
        </p>
        {reservationId && (
          <p className="text-[13px] text-bp-muted">
            Référence : <span className="text-bp-text">{reservationId.slice(0, 8).toUpperCase()}</span>
          </p>
        )}
      </div>
      <div className="flex flex-col items-center gap-3">
        <Button href="/">Retour à l&apos;accueil</Button>
        <Button href="/events" variant="secondary">Voir les événements</Button>
      </div>
    </div>
  );
}

export default function ReservationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-bp-gold" />
        </div>
      }
    >
      <ReservationSuccessInner />
    </Suspense>
  );
}
