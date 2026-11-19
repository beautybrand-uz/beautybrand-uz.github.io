import meta from "@/data/swatches.json";

/**
 * Декоративная косметика: мазки теней (brand/tools/swatch.py), помада, карандаши,
 * хайлайтер и румяна, блеск и лак, тушь (brand/tools/cosmetics.py).
 * Стоит за контентом; data-swatch — цвет «следа» от мышки (swatch-trail.tsx).
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const SWATCHES = meta as Record<string, { color: string; w: number; h: number }>;
export type SwatchName = keyof typeof meta;

export function Swatch({ name, className = "", priority }: { name: SwatchName; className?: string; priority?: boolean }) {
  const s = SWATCHES[name];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- декоративная картинка с прозрачностью, своя раскладка
    <img
      src={`${BASE}/brand/swatches/${name}.webp`}
      alt=""
      aria-hidden
      width={s.w}
      height={s.h}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      data-swatch={s.color}
      className={`swatch-deco pointer-events-none absolute -z-10 select-none ${className}`}
    />
  );
}
