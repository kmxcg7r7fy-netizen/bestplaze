import { cn } from "@/lib/cn";

const variants = {
  gold: "bg-bp-gold/15 text-bp-gold border-bp-gold/25",
  soft: "bg-white/6 text-bp-text-2 border-white/10",
  outline: "bg-transparent text-bp-text-2 border-white/14",
} as const;

export function Badge({
  children,
  variant = "soft",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] leading-none tracking-wide",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

