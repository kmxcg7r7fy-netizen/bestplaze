import { brand } from "@/data/mock";

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-black/20">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <p className="font-serif text-[18px] text-bp-text">{brand.name}</p>
          <p className="text-[14px] leading-6 text-bp-text-2">
            Univers noir & or. Soirées, cocktails signatures et expérience lounge
            premium.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
            Infos
          </p>
          <p className="text-[14px] text-bp-text-2">{brand.address}</p>
          <p className="text-[14px] text-bp-text-2">{brand.phone}</p>
          <p className="text-[14px] text-bp-text-2">{brand.email}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[12px] uppercase tracking-[0.18em] text-bp-muted">
            Horaires
          </p>
          <div className="space-y-2">
            {brand.openingHours.map((h) => (
              <div key={h.label} className="flex items-center justify-between">
                <span className="text-[14px] text-bp-text-2">{h.label}</span>
                <span className="text-[14px] text-bp-text">{h.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 text-[13px] text-bp-muted sm:px-6">
          <span>© {new Date().getFullYear()} Best Plaze</span>
          <span>V1 — maquette premium</span>
        </div>
      </div>
    </footer>
  );
}

