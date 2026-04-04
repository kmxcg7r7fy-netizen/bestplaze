import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Paiement annulé" };

export default function ReservationCancelPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8 py-16 text-center">
      <XCircle className="mx-auto h-14 w-14 text-bp-muted" />

      <div className="space-y-3">
        <h1 className="font-serif text-[32px] text-bp-text">
          Paiement annulé
        </h1>
        <p className="text-[15px] leading-7 text-bp-text-2">
          Votre réservation n&apos;a pas été confirmée.
          Aucun montant n&apos;a été débité.
        </p>
      </div>

      <Card className="p-6 text-left">
        <p className="text-[13px] uppercase tracking-[0.16em] text-bp-muted">
          Que souhaitez-vous faire ?
        </p>
        <div className="mt-4 space-y-3">
          <Button href="/reservation" className="w-full">
            Recommencer la réservation
          </Button>
          <Button href="/" variant="secondary" className="w-full">
            Retour à l&apos;accueil
          </Button>
        </div>
      </Card>

      <p className="text-[13px] text-bp-muted">
        Un problème ?{" "}
        <Link
          href="tel:0768627319"
          className="text-bp-gold underline-offset-2 hover:underline"
        >
          Appelez-nous : 07 68 62 73 19
        </Link>
      </p>
    </div>
  );
}
