import Link from "next/link";
import { brand } from "@/data/mock";

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-black/20">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <p className="font-serif text-[18px] text-bp-text">{brand.name}</p>
          <p className="text-[14px] leading-6 text-bp-text-2">
            Soirées, cocktails signatures et expérience lounge premium.
          </p>
          <div className="mt-1 flex items-center gap-3">
            {brand.social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-bp-muted transition hover:text-bp-gold"
                aria-label={s.label}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
            Infos
          </p>
          <p className="text-[14px] text-bp-text-2">{brand.address}</p>
          <a
            href={`tel:${brand.phone}`}
            className="text-[14px] text-bp-text-2 transition hover:text-bp-text"
          >
            {brand.phone}
          </a>
          <a
            href={`mailto:${brand.email}`}
            className="text-[14px] text-bp-text-2 transition hover:text-bp-text"
          >
            {brand.email}
          </a>
          <Link
            href="/privatisation"
            className="mt-1 text-[13px] text-bp-gold/80 transition hover:text-bp-gold"
          >
            Privatisation →
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
            Horaires
          </p>
          <div className="space-y-2">
            {brand.openingHours.map((h) => (
              <div key={h.label} className="flex items-center justify-between">
                <span className="text-[14px] text-bp-text-2">{h.label}</span>
                <span className="text-[14px] text-bp-text">{h.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/6">
        <p className="mx-auto max-w-6xl px-4 py-4 text-center text-[12px] text-bp-muted sm:px-6">
          © {new Date().getFullYear()} XI BestPlaze · 56 Rue de Suède, 37100 Tours
        </p>
      </div>
    </footer>
  );
}

