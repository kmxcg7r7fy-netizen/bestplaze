import Image from "next/image";
import { brand } from "@/data/mock";
import { cn } from "@/lib/cn";

export function BrandMark({
  size = 46,
  className,
  showWordmark = true,
}: {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="relative grid place-items-center overflow-hidden rounded-2xl bg-transparent"
        style={{ width: size, height: size }}
      >
        <Image
          src={brand.assets.logoSrc}
          alt={`${brand.name} logo`}
          fill
          className="object-contain p-1.5 drop-shadow-[0_0_18px_rgba(216,176,90,0.14)]"
          priority
        />
      </div>
      {showWordmark ? (
        <div className="flex flex-col leading-none">
          <span className="font-serif text-[18px] tracking-[-0.02em] text-bp-text">
            {brand.name}
          </span>
          <span className="text-[12px] tracking-[0.14em] text-bp-muted">
            {brand.baseline}
          </span>
        </div>
      ) : null}
    </div>
  );
}

