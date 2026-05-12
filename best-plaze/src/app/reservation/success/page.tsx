"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ReservationRow } from "@/types/reservation";

type State =
  | { status: "loading" }
  | { status: "success"; reservation: ReservationRow }
  | { status: "error"; message: string };

function ReservationSuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!sessionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "error", message: "Session de paiement introuvable." });
      return;
    }

    fetch(`/api/checkout/confirm?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setState({ status: "error", message: data.error });
        } else {
          setState({ status: "success", reservation: data.reservation });
        }
      })
      .catch(() => {
        setState({ status: "error", message: "Une erreur inattendue est survenue." });
      });
  }, [sessionId]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-bp-gold" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
        <XCircle className="mx-auto h-14 w-14 text-red-500" />
        <h1 className="font-serif text-[28px] text-bp-text">Une erreur est survenue</h1>
        <p className="text-bp-text-2">{state.message}</p>
        <Button href="/reservation">Retour à la réservation</Button>
      </div>
    );
  }

  const r = state.reservation;

  return (
    <div className="mx-auto max-w-lg space-y-8 py-12">
      <div className="space-y-3 text-center">
        <CheckCircle className="mx-auto h-14 w-14 text-bp-gold" />
        <h1 className="font-serif text-[32px] text-bp-text">Réservation confirmée !</h1>
        <p className="text-bp-text-2">
          Un email de confirmation a été envoyé à <strong className="text-bp-text">{r.email}</strong>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <p className="font-serif text-[18px] text-bp-text">Détails de votre réservation</p>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-[13px]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <dt className="text-bp-muted">Nom</dt>
              <dd className="mt-1 text-bp-text">{r.prenom} {r.nom}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <dt className="text-bp-muted">Date</dt>
              <dd className="mt-1 text-bp-text">
                {new Date(r.date_reservation).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <dt className="text-bp-muted">Heure</dt>
              <dd className="mt-1 text-bp-text">{r.heure}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <dt className="text-bp-muted">Personnes</dt>
              <dd className="mt-1 text-bp-text">{r.nb_personnes}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <dt className="text-bp-muted">Espace</dt>
              <dd className="mt-1 text-bp-text">{r.espace}</dd>
            </div>
            {r.occasion && (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <dt className="text-bp-muted">Occasion</dt>
                <dd className="mt-1 text-bp-text">{r.occasion}</dd>
              </div>
            )}
            {r.total_estimatif > 0 && (
              <div className="col-span-2 rounded-2xl border border-bp-gold/20 bg-bp-gold/10 p-3">
                <dt className="text-bp-muted">Total réglé</dt>
                <dd className="mt-1 font-serif text-[18px] text-bp-gold">
                  {r.total_estimatif.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button href="/" variant="secondary">Retour à l&apos;accueil</Button>
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
