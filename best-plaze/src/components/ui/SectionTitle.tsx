import { cn } from "@/lib/cn";

export function SectionTitle({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {eyebrow ? (
        <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-serif text-[24px] leading-[1.1] tracking-[-0.02em] text-bp-text sm:text-[28px]">
        {title}
      </h2>
      {description ? (
        <p className="text-[15px] leading-7 text-bp-text-2">{description}</p>
      ) : null}
    </div>
  );
}

