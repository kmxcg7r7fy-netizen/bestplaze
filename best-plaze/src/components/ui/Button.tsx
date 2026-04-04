import Link from "next/link";
import { cn } from "@/lib/cn";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-medium tracking-[0.01em] transition will-change-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-gold/40 focus-visible:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary:
    "bg-bp-gold text-black shadow-[var(--bp-shadow-gold)] hover:bg-bp-gold-2",
  secondary:
    "bg-white/6 text-bp-text border border-white/10 hover:bg-white/8 hover:border-white/16",
  ghost: "bg-transparent text-bp-text-2 hover:text-bp-text hover:bg-white/6",
} as const;

export function Button({
  children,
  variant = "primary",
  className,
  href,
  type,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const classes = cn(base, variants[variant], className);

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type ?? "button"}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

