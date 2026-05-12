"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Minus, Plus, Sparkles, Phone, Mail } from "lucide-react";
import { ReservationSummary, type ReservationDraft } from "@/components/reservation/ReservationSummary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { brand, menuItems } from "@/data/mock";

const timeSlots = [
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "19:00", "19:30", "20:00", "20:30", "21:00",
  "21:30", "22:00", "22:30", "23:00",
];
const areas = ["Lounge", "Terrasse", "Salle"] as const;
const occasions = ["—", "Anniversaire", "Soirée privée", "Afterwork", "Dîner romantique", "Autre"] as const;

/** Date locale YYYY-MM-DD (évite le décalage UTC de toISOString). */
function todayPlusLocal(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ReservationPage() {
  const [contact, setContact] = useState({ email: brand.email, phone: brand.phone });

  useEffect(() => {
    async function fetchContact() {
      const { data } = await getBrowserSupabaseClient()
        .from("admin_settings")
        .select("email_contact, telephone")
        .single();
      if (data) {
        setContact({ email: data.email_contact ?? brand.email, phone: data.telephone ?? brand.phone });
      }
    }
    async function fetchClosures() {
      const { data } = await getBrowserSupabaseClient()
        .from("closures")
        .select("date");
      if (data) setClosedDates(data.map((c: { date: string }) => c.date));
    }
    fetchContact();
    fetchClosures();
  }, []);

  const preselectOptions = useMemo(() => {
    const picks = menuItems
      .filter(
        (x) =>
          (x.category === "Cocktails" && x.id !== "ct-punch") ||
          x.category === "Sans alcool" ||
          x.category === "Champagnes",
      )
      .slice(0, 6)
      .map((x) => ({
        label: x.name,
        unitPrice: x.price,
      }));
    return picks;
  }, []);

  const [draft, setDraft] = useState<ReservationDraft>({
    dateISO: todayPlusLocal(3),
    time: "20:00",
    guests: 2,
    area: "Lounge",
    occasion: "—",
    preselected: preselectOptions.map((x) => ({ ...x, qty: 0 })),
  });

  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = useCallback(async () => {
    setError(null);

    if (!draft.firstName || !draft.lastName || (!draft.email && !draft.phone) || !draft.dateISO || !draft.time || !draft.area) {
      setError("Veuillez remplir tous les champs obligatoires (prénom, nom, email ou téléphone, date, heure, espace).");
      return;
    }

    if (draft.dateISO && closedDates.includes(draft.dateISO)) {
      setError("L'établissement est fermé à cette date. Veuillez choisir une autre date.");
      return;
    }

    const selectedItems = draft.preselected?.filter((x) => x.qty > 0) ?? [];
    const totalEstimatif = selectedItems.reduce((sum, x) => sum + (x.unitPrice ?? 0) * x.qty, 0);

    setIsLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName:      draft.firstName,
          lastName:       draft.lastName,
          email:          draft.email ?? "",
          phone:          draft.phone ?? "",
          dateISO:        draft.dateISO,
          time:           draft.time,
          guests:         draft.guests,
          area:           draft.area,
          occasion:       draft.occasion !== "—" ? draft.occasion : undefined,
          note:           draft.note,
          totalEstimatif,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      window.location.href = `/reservation/success?id=${data.reservation.id}`;
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  }, [draft]);

  return (
    <div className="space-y-8">
      <SectionTitle
        eyebrow="Réservation"
        title="Réservez votre table"
        description="Choisissez votre créneau, votre espace, puis pré-sélectionnez boissons et tapas pour une expérience sans effort."
      />

      {/* Encart réservations spéciales */}
      <div className="rounded-2xl border border-bp-gold/20 bg-bp-gold/8 px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-bp-text">Réservation spéciale ?</p>
          <p className="text-[12px] text-bp-text-2 mt-0.5">
            Grand groupe, privatisation, événement… Contactez directement notre équipe.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-[12px] text-bp-text-2 hover:text-bp-text transition">
            <Mail className="h-3.5 w-3.5 text-bp-gold/80" />{contact.email}
          </a>
          <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/20 px-3 py-1.5 text-[12px] text-bp-text-2 hover:text-bp-text transition">
            <Phone className="h-3.5 w-3.5 text-bp-gold/80" />{contact.phone}
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={draft.dateISO ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, dateISO: e.target.value }))
                  }
                />
                {draft.dateISO && closedDates.includes(draft.dateISO) && (
                  <p className="text-[11px] text-red-400">
                    Établissement fermé ce jour — choisissez une autre date.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Heure</Label>
                <Select
                  value={draft.time ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, time: e.target.value }))
                  }
                >
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nombre de personnes</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="h-11 w-11 rounded-2xl p-0"
                    onClick={() =>
                      setDraft((d) => ({ ...d, guests: Math.max(1, d.guests - 1) }))
                    }
                  >
                    <Minus className="h-5 w-5" />
                  </Button>
                  <div className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-[15px] text-bp-text">
                    {draft.guests}
                  </div>
                  <Button
                    variant="secondary"
                    className="h-11 w-11 rounded-2xl p-0"
                    onClick={() =>
                      setDraft((d) => ({ ...d, guests: Math.min(12, d.guests + 1) }))
                    }
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-[12px] text-bp-muted">Jusqu’à 12 personnes (V1).</p>
              </div>

              <div className="space-y-2">
                <Label>Espace souhaité</Label>
                <Select
                  value={draft.area ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, area: e.target.value }))}
                >
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  placeholder="Camille"
                  autoComplete="given-name"
                  value={draft.firstName ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  placeholder="Durand"
                  autoComplete="family-name"
                  value={draft.lastName ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, lastName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-bp-muted font-normal">(ou téléphone)</span></Label>
                <Input
                  type="email"
                  placeholder="camille@email.com"
                  value={draft.email ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Téléphone <span className="text-bp-muted font-normal">(ou email)</span></Label>
                <Input
                  inputMode="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={draft.phone ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                />
                <p className="text-[11px] text-bp-muted">Au moins un des deux est requis.</p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Occasion</Label>
                <Select
                  value={draft.occasion ?? "—"}
                  onChange={(e) => setDraft((d) => ({ ...d, occasion: e.target.value }))}
                >
                  {occasions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Notes spéciales</Label>
                <Textarea
                  placeholder="Allergies, placement, surprise, etc."
                  value={draft.note ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
                  Pré-sélection
                </p>
                <p className="font-serif text-[22px] text-bp-text">
                  Anticipez votre expérience
                </p>
                <p className="text-[14px] leading-6 text-bp-text-2">
                  Sélectionnez quelques produits (cocktails, premium, tapas). Le total est estimatif.
                </p>
              </div>
              <div className="hidden rounded-2xl border border-bp-gold/20 bg-bp-gold/10 px-3 py-2 text-[12px] tracking-[0.12em] text-bp-gold sm:flex">
                <Sparkles className="h-4 w-4" /> Luxe discret
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {draft.preselected.map((x, idx) => (
                <div
                  key={x.label}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-bp-text">
                      {x.label}
                    </p>
                    {x.unitPrice ? (
                      <p className="text-[12px] text-bp-muted">{x.unitPrice}€ / unité</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="h-10 w-10 rounded-2xl p-0"
                      onClick={() =>
                        setDraft((d) => {
                          const copy = [...d.preselected];
                          copy[idx] = { ...copy[idx], qty: Math.max(0, copy[idx].qty - 1) };
                          return { ...d, preselected: copy };
                        })
                      }
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <div className="grid h-10 w-12 place-items-center rounded-2xl border border-white/10 bg-black/20 text-[14px] text-bp-text">
                      {x.qty}
                    </div>
                    <Button
                      variant="secondary"
                      className="h-10 w-10 rounded-2xl p-0"
                      onClick={() =>
                        setDraft((d) => {
                          const copy = [...d.preselected];
                          copy[idx] = { ...copy[idx], qty: Math.min(9, copy[idx].qty + 1) };
                          return { ...d, preselected: copy };
                        })
                      }
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 space-y-3">
          {error && (
            <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
              {error}
            </p>
          )}
          <ReservationSummary draft={draft} onConfirm={handleConfirm} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

