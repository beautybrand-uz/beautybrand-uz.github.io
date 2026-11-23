import Link from "next/link";
import type { Category } from "@/data/products";
import type { Locale } from "@/lib/i18n";
import type { SwatchName } from "./swatch";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Мазки-кнопки разделов: мазок «прорисовывается» при появлении и оживает при наведении */
const CATS: { c: Category; swatch: SwatchName; href?: string }[] = [
  { c: "makeup", swatch: "pink" },
  { c: "hair", swatch: "gold" },
  { c: "skin", swatch: "peach" },
  { c: "body", swatch: "lipstick-berry" },
];

export function CategorySwatches({ lang, labels }: { lang: Locale; labels: Record<Category, string> }) {
  return (
    <nav aria-label={lang === "ru" ? "Быстрый выбор раздела" : "Bo‘limni tez tanlash"} className="shell pt-10">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {CATS.map(({ c, swatch, href }, i) => (
          <li key={c}>
            <Link
              href={`/${lang}/${href ?? `c/${c}`}`}
              className="cat-swatch group relative isolate flex h-[4.5rem] items-center justify-center px-4 text-center font-display text-xl font-medium text-ink sm:h-24 sm:text-2xl"
              style={{ ["--d" as string]: `${i * 140}ms` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- декоративный мазок с прозрачностью */}
              <img
                src={`${BASE}/brand/swatches/${swatch}.webp`}
                alt=""
                aria-hidden
                loading="lazy"
                className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-fill opacity-90"
              />
              <span className="transition-transform duration-500 group-hover:-translate-y-0.5">{labels[c]}</span>
              <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" className="ml-2 -translate-x-1 opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                <path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
