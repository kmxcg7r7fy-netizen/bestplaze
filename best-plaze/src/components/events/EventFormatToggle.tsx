"use client";

import { cn } from "@/lib/cn";
import type { EventCardMode } from "./EventCard";

const options: { value: EventCardMode; label: string; icon: React.ReactNode }[] = [
  {
    value: "grid",
    label: "Grille",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "list",
    label: "Liste",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="2" width="14" height="3.5" rx="1.5" fill="currentColor" />
        <rect x="1" y="6.5" width="14" height="3.5" rx="1.5" fill="currentColor" />
        <rect x="1" y="11" width="14" height="3.5" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "hero",
    label: "Vedette",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="1" width="14" height="8" rx="1.5" fill="currentColor" />
        <rect x="1" y="10.5" width="6.5" height="4.5" rx="1.5" fill="currentColor" />
        <rect x="8.5" y="10.5" width="6.5" height="4.5" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

export function EventFormatToggle({
  value,
  onChange,
}: {
  value: EventCardMode;
  onChange: (v: EventCardMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Format d'affichage"
      className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition",
              active
                ? "bg-bp-gold/15 text-bp-gold shadow-[inset_0_0_0_1px_rgba(216,176,90,0.25)]"
                : "text-bp-text-2 hover:bg-white/6 hover:text-bp-text",
              // Sur mobile : masquer "Vedette" (optionnel — garder 2 modes max)
              opt.value === "hero" ? "hidden sm:inline-flex" : "inline-flex",
            )}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
