"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, CalendarDays, CalendarX, ChefHat, ExternalLink, Key, LogOut, Settings, Sparkles, FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

const navItems = [
  { href: "/admin",              label: "Dashboard",      icon: BarChart3,     devOnly: false },
  { href: "/admin/reservations", label: "Réservations",   icon: CalendarDays,  devOnly: false },
  { href: "/admin/events",       label: "Événements",     icon: Sparkles,      devOnly: false },
  { href: "/admin/menu",         label: "Carte",          icon: ChefHat,       devOnly: false },
  { href: "/admin/privatisations", label: "Privatisations", icon: Key,           devOnly: false },
  { href: "/admin/closures",     label: "Fermetures",     icon: CalendarX,     devOnly: false },
  { href: "/admin/settings",     label: "Paramètres",     icon: Settings,      devOnly: false },
  { href: "/admin/demo",         label: "Mode Démo",      icon: FlaskConical,  devOnly: true  },
] as const;

const IS_DEV = process.env.NODE_ENV !== "production";
/** Affiche « Mode Démo » en dev, ou en prod si NEXT_PUBLIC_ADMIN_DEMO=true (rebuild requis). */
const SHOW_DEMO = IS_DEV || process.env.NEXT_PUBLIC_ADMIN_DEMO === "true";

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function signOut() {
    await getBrowserSupabaseClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/8 bg-black/40">
      {/* Logo */}
      <div className="border-b border-white/8 px-6 py-5">
        <p className="font-serif text-[18px] text-bp-gold">XI BestPlaze</p>
        <p className="text-[11px] uppercase tracking-[0.16em] text-bp-muted">Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigation admin">
        {navItems.filter((item) => !item.devOnly || SHOW_DEMO).map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] transition",
                active
                  ? "bg-bp-gold/12 text-bp-gold"
                  : "text-bp-text-2 hover:bg-white/6 hover:text-bp-text",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Voir le site + Déconnexion */}
      <div className="border-t border-white/8 px-3 py-4 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[14px] text-bp-text-2 transition hover:bg-white/6 hover:text-bp-text"
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
          Voir le site
        </a>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[14px] text-bp-muted transition hover:bg-white/6 hover:text-bp-text"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
