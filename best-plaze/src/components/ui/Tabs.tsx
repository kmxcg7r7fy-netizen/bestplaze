import { cn } from "@/lib/cn";

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]",
        className,
      )}
    >
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-[13px] tracking-[0.01em] transition",
              active
                ? "border-bp-gold/30 bg-bp-gold/15 text-bp-gold"
                : "border-white/10 bg-white/5 text-bp-text-2 hover:bg-white/7 hover:text-bp-text",
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

