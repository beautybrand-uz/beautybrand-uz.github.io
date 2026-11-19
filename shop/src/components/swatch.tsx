/**
 * Декоративный мазок теней (картинки из brand/tools/swatch.py).
 * Стоит за контентом; цвет нужен «следу» от мышки (swatch-trail.tsx).
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const SWATCHES = {
  rose: { color: "#a87268", w: 986, h: 1600 },
  gold: { color: "#c9a468", w: 1688, h: 691 },
  bronze: { color: "#8f5d41", w: 636, h: 1300 },
  pink: { color: "#c9828f", w: 1600, h: 503 },
  plum: { color: "#7a4560", w: 802, h: 1400 },
  peach: { color: "#d6a48a", w: 1500, h: 556 },
} as const;

export type SwatchName = keyof typeof SWATCHES;

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
