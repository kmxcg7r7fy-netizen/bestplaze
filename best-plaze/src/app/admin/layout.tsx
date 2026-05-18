import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata = { title: { default: "Admin", template: "%s · Admin XI BestPlaze" } };

async function getPendingCount(): Promise<number> {
  try {
    const supabase = getSupabaseAdmin();
    const { count } = await supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("statut", "en_attente");
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pendingCount = await getPendingCount();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <div className="hidden w-56 shrink-0 md:flex md:flex-col">
        <AdminSidebar pendingCount={pendingCount} />
      </div>

      {/* Contenu */}
      <main className="flex-1 overflow-auto">
        {/* Top bar mobile */}
        <div className="flex items-center justify-between border-b border-white/8 bg-black/30 px-4 py-4 md:hidden">
          <p className="font-serif text-[16px] text-bp-gold">XI BestPlaze Admin</p>
        </div>

        {/* Mobile bottom nav */}
        <div className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-black/60 backdrop-blur-xl md:hidden`}>
          <MobileAdminNav />
        </div>

        <div className="p-4 pb-24 sm:p-6 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}

function MobileAdminNav() {
  const items = [
    { href: "/admin",              label: "Stats"   },
    { href: "/admin/reservations", label: "Résas"   },
    { href: "/admin/events",       label: "Événem." },
    { href: "/admin/menu",         label: "Carte"   },
    { href: "/admin/settings",     label: "Config"  },
    { href: "/",                   label: "Le site", newTab: true },
  ] as const;

  return (
    <nav className="grid grid-cols-6 px-2 py-2">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          target={"newTab" in item && item.newTab ? "_blank" : undefined}
          rel={"newTab" in item && item.newTab ? "noopener noreferrer" : undefined}
          className="flex flex-col items-center gap-1 py-2 text-[10px] text-bp-text-2 hover:text-bp-gold transition"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
