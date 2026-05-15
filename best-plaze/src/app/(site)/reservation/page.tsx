"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Minus, Plus, Sparkles, Phone, Mail, CalendarDays, ChevronDown } from "lucide-react";
import { ReservationSummary, type ReservationDraft } from "@/components/reservation/ReservationSummary";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { brand, menuItems, menuCategories } from "@/data/mock";

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
  const [contact, setContact]     = useState({ email: brand.email, phone: brand.phone });
  const [eventTitle, setEventTitle] = useState<string | null>(null);

  useEffect(() => {
    // Pré-remplissage depuis les query params (lien depuis EventCard)
    const params = new URLSearchParams(window.location.search);
    const pDate = params.get("date");
    const pTime = params.get("time");
    const pTitle = params.get("title");
    if (pDate || pTime) {
      setDraft((d) => ({
        ...d,
        ...(pDate ? { dateISO: pDate } : {}),
        ...(pTime ? { time: pTime } : {}),
      }));
    }
    if (pTitle) setEventTitle(decodeURIComponent(pTitle));

    void (async () => {
      try {
        const sb = getBrowserSupabaseClient();
        const { data: settings } = await sb
          .from("admin_settings")
          .select("email_contact, telephone")
          .single();
        if (settings) {
          setContact({
            email: settings.email_contact ?? brand.email,
            phone: settings.telephone ?? brand.phone,
          });
        }
        const { data: closures } = await sb.from("closures").select("date");
        if (closures) {
          setClosedDates(closures.map((c: { date: string }) => c.date));
        }
      } catch {
        // Pas de .env Supabase, hors ligne, ou tables absentes : la page reste utilisable.
      }
    })();
  }, []);

  // Toute la carte disponible en pré-sélection
  const preselectOptions = useMemo(
    () => menuItems.map((x) => ({ label: x.name, unitPrice: x.price })),
    [],
  );

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
  // Catégories dépliées — Cocktails ouverte par défaut
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(["Cocktails"]));
  const toggleCat = useCallback((id: string) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

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

      {/* Badge pré-remplissage depuis un événement */}
      {eventTitle && (
        <div className="flex items-center gap-3 rounded-2xl border border-bp-gold/25 bg-bp-gold/8 px-4 py-3">
          <CalendarDays className="h-4 w-4 text-bp-gold shrink-0" />
          <p className="text-[13px] text-bp-text">
            Réservation liée à l&apos;événement{" "}
            <span className="font-medium text-bp-gold">{eventTitle}</span>
            {" "}— date et heure pré-remplies.
          </p>
        </div>
      )}

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

          {/* ── Pré-sélection boissons — accordion mobile-first ── */}
          <div className="overflow-hidden rounded-3xl border border-white/10">
            {/* En-tête fixe */}
            <div className="border-b border-white/8 px-5 py-4">
              <div className="flex items-center gap-2">
                <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
                  Pré-sélection boissons
                </p>
                <span className="rounded-full border border-white/12 bg-white/5 px-2 py-0.5 text-[11px] text-bp-muted">
                  Facultatif
                </span>
              </div>
              <p className="mt-1 font-serif text-[20px] text-bp-text">Anticipez votre soirée</p>
              {/* Mention aucun paiement */}
              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-bp-gold/18 bg-bp-gold/6 px-3.5 py-2.5">
                <Sparkles className="mt-px h-3.5 w-3.5 shrink-0 text-bp-gold" />
                <p className="text-[11px] leading-relaxed text-bp-text-2">
                  <span className="font-medium text-bp-text">Aucun paiement requis.</span>{" "}
                  Indicatif uniquement — règlement sur place.
                </p>
              </div>
            </div>

            {/* Accordéon par catégorie */}
            {menuCategories.map((cat, catI) => {
              const catItems = menuItems
                .map((item, idx) => ({ item, idx }))
                .filter(({ item }) => item.category === cat.id);
              if (catItems.length === 0) return null;

              const isOpen = openCats.has(cat.id);
              // Nombre d'items sélectionnés + sous-total dans cette catégorie
              const selCount = catItems.reduce((n, { idx }) => n + (draft.preselected[idx]?.qty ?? 0), 0);
              const selTotal = catItems.reduce(
                (s, { item, idx }) => s + item.price * (draft.preselected[idx]?.qty ?? 0),
                0,
              );

              return (
                <div
                  key={cat.id}
                  className={catI < menuCategories.length - 1 ? "border-b border-white/8" : ""}
                >
                  {/* Header cliquable */}
                  <button
                    type="button"
                    onClick={() => toggleCat(cat.id)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03] active:bg-white/[0.05]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[14px] font-medium text-bp-text">{cat.label}</span>
                      {selCount > 0 && (
                        <span className="flex items-center gap-1 rounded-full border border-bp-gold/30 bg-bp-gold/12 px-2 py-0.5 text-[11px] text-bp-gold">
                          {selCount} · {selTotal}€
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-bp-muted transition-transform duration-300"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  {/* Contenu — animation hauteur via grid trick */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      transition: "grid-template-rows 0.28s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="divide-y divide-white/6 px-4 pb-3 pt-1">
                        {catItems.map(({ item, idx }) => {
                          const qty = draft.preselected[idx]?.qty ?? 0;
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center gap-3 py-3 transition-colors ${
                                qty > 0 ? "opacity-100" : "opacity-90"
                              }`}
                            >
                              {/* Infos produit */}
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-medium text-bp-text">{item.name}</p>
                                <p className="text-[12px] text-bp-gold">{item.price}€</p>
                              </div>

                              {/* Compteur inline */}
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  disabled={qty === 0}
                                  onClick={() =>
                                    setDraft((d) => {
                                      const copy = [...d.preselected];
                                      copy[idx] = { ...copy[idx], qty: Math.max(0, qty - 1) };
                                      return { ...d, preselected: copy };
                                    })
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-bp-text-2 transition hover:bg-white/10 disabled:opacity-30"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>

                                <div
                                  className="grid h-9 w-10 place-items-center rounded-2xl border text-[13px] font-medium transition-colors"
                                  style={{
                                    borderColor: qty > 0 ? "rgba(216,176,90,0.35)" : "rgba(255,255,255,0.08)",
                                    color: qty > 0 ? "var(--bp-gold)" : "var(--bp-text)",
                                    background: qty > 0 ? "rgba(216,176,90,0.08)" : "rgba(0,0,0,0.2)",
                                  }}
                                >
                                  {qty}
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDraft((d) => {
                                      const copy = [...d.preselected];
                                      copy[idx] = { ...copy[idx], qty: Math.min(20, qty + 1) };
                                      return { ...d, preselected: copy };
                                    })
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-bp-text-2 transition hover:bg-white/10"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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

