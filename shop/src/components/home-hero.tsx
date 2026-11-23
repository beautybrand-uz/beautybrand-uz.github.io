import Image from "next/image";
import Link from "next/link";
import { products, type Category } from "@/data/products";
import type { Locale } from "@/lib/i18n";
import { priceLabel } from "@/lib/price";
import type { SwatchName } from "./swatch";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Хиты на первом экране — карточки поверх натюрморта */
const HITS = ["dior-glow-stick-012-rosewood", "kerastase-genesis-anti-chute-serum", "tom-ford-tobacco-vanille"];

// Где лежит каждая карточка на картинке (в процентах от панели)
const SPOTS = [
  "left-[-5%] top-[10%] sm:left-[-9%]",
  "right-[-4%] top-[44%] sm:right-[-8%]",
  "left-[-2%] bottom-[8%] sm:left-[-5%]",
];

const T = {
  ru: { hit: "Хит", pick: "Новинка недели", more: "Подробнее", buy: "Смотреть и заказать", alt: "Помада, духи и палетка теней на шёлке" },
  uz: { hit: "Xit", pick: "Hafta yangiligi", more: "Batafsil", buy: "Ko‘rish va buyurtma", alt: "Ipakdagi lab bo‘yog‘i, atir va soyalar palitrasi" },
} as const;

/** Первый экран, правая часть: натюрморт (медленно приближается) и «плавающие» карточки хитов */
export function HeroShowcase({ lang, image }: { lang: Locale; image: string }) {
  const t = T[lang];
  const hits = HITS.map((s) => products.find((p) => p.slug === s)).filter((p) => p !== undefined);
  return (
    <div className="rise-image relative order-1 mx-auto w-full max-w-[24rem] px-6 sm:px-10 lg:order-2 lg:w-[min(100%,calc((100svh-14rem)*0.8),27rem)] lg:max-w-none lg:self-center lg:py-6">
      <div className="relative isolate aspect-[4/5] overflow-hidden rounded-[1.8rem] bg-well shadow-[0_40px_80px_-40px_rgba(42,26,21,0.55)] [clip-path:inset(0_round_1.8rem)]">
        <Image
          src={image}
          alt={t.alt}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="hero-kenburns object-cover"
        />
        <span aria-hidden className="absolute inset-0 rounded-[1.8rem] ring-1 ring-inset ring-white/40" />
      </div>
      <ul>
        {hits.map((p, i) => (
          <li
            key={p.slug}
            className={`hit-card absolute ${SPOTS[i]} w-[min(15rem,76%)]`}
            style={{ animationDelay: `${650 + i * 180}ms, ${i * 1.4}s` }}
          >
            <Link
              href={`/${lang}/p/${p.slug}`}
              className="group flex items-center gap-2.5 rounded-full border border-white/70 bg-paper/80 py-1.5 pl-1.5 pr-3 shadow-[0_14px_30px_-16px_rgba(42,26,21,0.55)] backdrop-blur-md transition-colors hover:bg-paper"
            >
              <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-white">
                <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-cocoa">
                  <span aria-hidden className="mr-1 inline-block size-1.5 rounded-full bg-rose align-middle" />
                  {t.hit} · {p.brand}
                </span>
                <span className="mt-0.5 block truncate text-[0.8rem] font-medium">{p.name}</span>
                <span className="block text-[0.74rem] text-rose-deep">{priceLabel(p, lang)}</span>
              </span>
              <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" className="shrink-0 text-cocoa transition-transform duration-300 group-hover:translate-x-0.5">
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Мазки-кнопки разделов: мазок «прорисовывается» при появлении и оживает при наведении */
const CATS: { c: Category; swatch: SwatchName; href?: string }[] = [
  { c: "makeup", swatch: "pink" },
  { c: "hair", swatch: "gold" },
  { c: "skin", swatch: "peach" },
  { c: "fragrance", swatch: "lipstick-berry", href: "maison" },
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
