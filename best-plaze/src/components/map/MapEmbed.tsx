"use client";

import { MapPin } from "lucide-react";

export function MapEmbed() {
  return (
    <a
      href="https://maps.app.goo.gl/Uwk1mVFNDdjoZAuBA"
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-[220px] overflow-hidden sm:h-[300px] lg:h-[340px]"
      aria-label="Ouvrir XI BestPlaze dans Google Maps"
    >
      {/* Carte Google Maps — pointerEvents none pour que le clic passe à l'<a> */}
      <iframe
        src="https://maps.google.com/maps?q=XI+BestPlaze,+56+Rue+de+Su%C3%A8de,+Tours,+France&output=embed&z=17&hl=fr"
        className="h-full w-full border-0"
        style={{
          pointerEvents: "none",
          filter:
            "invert(92%) hue-rotate(180deg) brightness(0.62) contrast(0.86) saturate(0.42)",
        }}
        loading="lazy"
        title="XI BestPlaze — Google Maps"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Pin BestPlaze centré */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-bp-gold bg-bp-gold/20 shadow-[0_0_0_8px_rgba(216,176,90,0.10),0_0_28px_rgba(216,176,90,0.50)] backdrop-blur-sm">
            <MapPin className="h-5 w-5 text-bp-gold" />
          </div>
          <div className="whitespace-nowrap rounded-full border border-white/25 bg-black/72 px-3.5 py-1 backdrop-blur-sm">
            <p className="text-[11px] font-medium text-white">XI BestPlaze</p>
          </div>
        </div>
      </div>

      {/* CTA hover */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-end bg-black/0 p-3 transition-all duration-300 group-hover:bg-black/20">
        <span className="rounded-full border border-white/20 bg-black/65 px-3 py-1.5 text-[12px] text-white/80 opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100">
          Ouvrir dans Maps →
        </span>
      </div>
    </a>
  );
}
