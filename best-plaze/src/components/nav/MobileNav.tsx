"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  GlassWater,
  House,
  Key,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/events", label: "Événements", icon: Sparkles },
  { href: "/menu", label: "Carte", icon: GlassWater },
  { href: "/privatisation", label: "Privatiser", icon: Key },
  { href: "/reservation", label: "Réserver", icon: CalendarDays },
  { href: "/account", label: "Compte", icon: User },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden" aria-label="Navigation principale">
      <div className="mx-auto w-full max-w-lg px-4 pb-safe-or-4" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}>
        <div className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
          <div className="grid grid-cols-6" role="list">
            {items.map((it) => {
              const active =
                it.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(it.href);
              const Icon = it.icon;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  role="listitem"
                  aria-label={it.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[48px] flex-col items-center justify-center gap-1 px-2 py-3 text-[11px] tracking-[0.01em] transition",
                    active ? "text-bp-gold" : "text-bp-text-2 hover:text-bp-text",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active ? "drop-shadow-[0_0_14px_rgba(216,176,90,0.18)]" : "",
                    )}
                    aria-hidden="true"
                  />
                  <span className="leading-none">{it.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

