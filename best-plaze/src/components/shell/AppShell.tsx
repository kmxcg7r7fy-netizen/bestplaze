import { MobileNav } from "@/components/nav/MobileNav";
import { TopNav } from "@/components/nav/TopNav";
import { Footer } from "@/components/shell/Footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-10">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}

