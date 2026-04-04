import { cn } from "@/lib/cn";

export function Label({
  children,
  className,
  ...rest
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-[12px] uppercase tracking-[0.16em] text-bp-muted",
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  );
}

const fieldBase =
  "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-[15px] text-bp-text placeholder:text-white/35 outline-none transition focus:border-bp-gold/35 focus:ring-2 focus:ring-bp-gold/20";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input className={cn(fieldBase, className)} {...rest} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select className={cn(fieldBase, "pr-10", className)} {...rest}>
      {children}
    </select>
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const { className, ...rest } = props;
  return <textarea className={cn(fieldBase, "min-h-28", className)} {...rest} />;
}

