import Link from "next/link";
import { BrandMark } from "@/components/branding/BrandMark";
import { Button } from "@/components/ui/Button";
import { nav } from "@/components/nav/NavLinks";
import { cn } from "@/lib/cn";

export function TopNav({ className }: { className?: string }) {
  return (
    <header className={cn("sticky top-0 z-40 w-full", className)}>
      <div className="border-b border-white/8 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0">
            <BrandMark size={50} />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav
              .filter((x) => x.key !== "reservation")
              .map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-[13px] tracking-[0.01em] text-bp-text-2 transition hover:bg-white/6 hover:text-bp-text"
                >
                  {item.label}
                </Link>
              ))}
          </nav>

          <div className="hidden md:block">
            <Button href="/reservation">Réserver</Button>
          </div>
        </div>
      </div>
    </header>
  );
}

