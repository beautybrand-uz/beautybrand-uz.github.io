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
  "left-[-4%] top-[14%] sm:left-[-7%]",
  "right-[-3%] top-[42%] sm:right-[-6%]",
  "left-[6%] bottom-[7%]",
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
    <div className="rise-image relative order-1 mx-auto w-full max-w-[34rem] px-4 sm:px-8 lg:order-2 lg:w-[min(100%,calc((100svh-8rem)*0.8))] lg:max-w-none lg:self-center lg:py-6">
      <div className="relative isolate aspect-[4/5] overflow-hidden rounded-[2.2rem] bg-well shadow-[0_40px_80px_-40px_rgba(42,26,21,0.55)] [clip-path:inset(0_round_2.2rem)]">
        <Image
          src={image}
          alt={t.alt}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="hero-kenburns object-cover"
        />
        <span aria-hidden className="absolute inset-0 rounded-[2.2rem] ring-1 ring-inset ring-white/40" />
      </div>
      <ul>
        {hits.map((p, i) => (
          <li
            key={p.slug}
            className={`hit-card absolute ${SPOTS[i]} w-[min(17rem,62%)] [&:nth-child(3)]:hidden sm:[&:nth-child(3)]:block`}
            style={{ animationDelay: `${650 + i * 180}ms, ${i * 1.4}s` }}
          >
            <Link
              href={`/${lang}/p/${p.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-white/70 bg-paper/85 p-2.5 pr-4 shadow-[0_18px_40px_-18px_rgba(42,26,21,0.55)] backdrop-blur-md"
            >
              <span className="relative size-11 shrink-0 sm:size-14 overflow-hidden rounded-xl bg-white">
                <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-cocoa">
                  <span aria-hidden className="size-1.5 rounded-full bg-rose" />
                  {t.hit} · {p.brand}
                </span>
                <span className="mt-0.5 block truncate text-[0.9rem] font-medium">{p.name}</span>
                <span className="block text-[0.85rem] text-rose-deep">{priceLabel(p, lang)}</span>
              </span>
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

/** «Новинка недели» — последний товар из канала */
export function WeekPick({ lang }: { lang: Locale }) {
  const t = T[lang];
  const p = products.filter((x) => !x.boutique && (x.channel ?? "") === "").sort((a, b) => b.post - a.post)[0];
  if (!p) return null;
  return (
    <section aria-labelledby="pick-title" className="shell pt-20">
      <div className="week-pick grid items-center gap-8 overflow-hidden rounded-[2rem] bg-[#efe5da] p-4 sm:p-6 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] md:gap-12 md:p-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <Link href={`/${lang}/p/${p.slug}`} className="group relative block aspect-square overflow-hidden rounded-[1.5rem] bg-white">
          <Image
            src={p.images[0]}
            alt={`${p.brand} ${p.name}`}
            fill
            sizes="(min-width: 768px) 26rem, 90vw"
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
          />
        </Link>
        <div className="pb-2 md:pb-0">
          <p className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-rose-deep">
            <span aria-hidden className="pick-dot relative size-2 rounded-full bg-rose-deep" />
            {t.pick}
          </p>
          <p className="mt-5 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-cocoa">{p.brand}</p>
          <h2 id="pick-title" className="mt-1 font-display text-3xl font-medium leading-tight tracking-[-0.01em] text-balance sm:text-4xl">
            {p.name}
          </h2>
          <p className="mt-4 max-w-[52ch] leading-relaxed text-cocoa">{p.description[lang]}</p>
          <p className="mt-6 font-display text-2xl font-medium text-rose-deep">{priceLabel(p, lang)}</p>
          <Link href={`/${lang}/p/${p.slug}`} className="btn btn-primary mt-6">
            {t.buy}
          </Link>
        </div>
      </div>
    </section>
  );
}
