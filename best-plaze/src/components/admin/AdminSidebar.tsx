"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, CalendarDays, ChefHat, LogOut, Settings, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

const navItems = [
  { href: "/admin",              label: "Dashboard",      icon: BarChart3   },
  { href: "/admin/reservations", label: "Réservations",   icon: CalendarDays },
  { href: "/admin/events",       label: "Événements",     icon: Sparkles    },
  { href: "/admin/menu",         label: "Carte",          icon: ChefHat     },
  { href: "/admin/settings",     label: "Paramètres",     icon: Settings    },
] as const;

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
        {navItems.map((item) => {
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

      {/* Déconnexion */}
      <div className="border-t border-white/8 px-3 py-4">
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
