import { Swatch } from "@/components/swatch";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { Tilt } from "./tilt";
import { priceLabel } from "@/lib/price";
import { TelegramIcon } from "./cart-drawer";
import { BRANDS, products } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { TELEGRAM, telegramLink } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * «Новинки в движении»: тёмная витрина — ролик из канала в реалистичном телефоне (рамка, «островок»,
 * кнопки, блик, отражение, 3D-наклон), слева — призыв в Telegram, справа — свежие поступления с ценами.
 */
const REEL_T = {
  ru: { kicker: "Reels · Telegram", title: "Новинки в движении", fresh: "Свежие поступления", subs: "подписчиков уже смотрят" },
  uz: { kicker: "Reels · Telegram", title: "Yangiliklar harakatda", fresh: "Yangi kelganlar", subs: "obunachi allaqachon kuzatmoqda" },
} as const;

export function NewArrivalsReel({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const r = REEL_T[lang];
  const fresh = products
    .filter((p) => !p.boutique && !p.channel && p.images[0])
    .sort((x, y) => y.post - x.post)
    .slice(0, 4);
  return (
    <section className="reel-band relative isolate overflow-hidden bg-[#1b1310] text-paper">
      {/* тёплый свет за телефоном и золотая пыль */}
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,164,104,0.28),rgba(168,76,92,0.12)_40%,transparent_68%)]" />
      <span aria-hidden className="reel-dust pointer-events-none absolute inset-0 -z-10" />

      <div className="shell grid items-center gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-14 lg:py-24">
        <div className="order-2 min-w-0 lg:order-1">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#c9a468]">{r.kicker}</p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-5xl">{r.title}</h2>
          <p className="mt-4 max-w-[40ch] leading-relaxed text-paper/70">{t.home.newText}</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a href={telegramLink(TELEGRAM.channel)} target="_blank" rel="noopener" className="btn bg-paper text-ink hover:bg-[#f3dfb2]">
              <TelegramIcon />
              {t.home.newCta}
            </a>
            <p className="leading-tight">
              <span className="block font-display text-2xl text-[#f3dfb2]">6 300+</span>
              <span className="text-xs text-paper/60">{r.subs}</span>
            </p>
          </div>
        </div>

        {/* телефон */}
        <div className="order-1 mx-auto lg:order-2">
          <Tilt className="w-[min(16.5rem,68vw)] lg:w-[17.5rem]" max={9} radius="2.9rem">
            <div className="reel-phone relative rounded-[2.9rem] p-[0.55rem]">
              <span aria-hidden className="absolute -left-[3px] top-[22%] h-10 w-[3px] rounded-l bg-[#8f8174]" />
              <span aria-hidden className="absolute -left-[3px] top-[34%] h-14 w-[3px] rounded-l bg-[#8f8174]" />
              <span aria-hidden className="absolute -right-[3px] top-[30%] h-20 w-[3px] rounded-r bg-[#8f8174]" />
              <div className="relative overflow-hidden rounded-[2.35rem] bg-black">
                <video
                  className="aspect-[9/16] w-full object-cover"
                  src={`${BASE}/videos/new-arrivals.mp4`}
                  poster={fresh[0]?.images[0]}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={r.title}
                />
                <span aria-hidden className="absolute left-1/2 top-2.5 h-[1.55rem] w-[5.4rem] -translate-x-1/2 rounded-full bg-black" />
                <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_32%)]" />
              </div>
            </div>
          </Tilt>
          {/* отражение на «полу» */}
          <span aria-hidden className="mx-auto mt-5 block h-4 w-[70%] rounded-[50%] bg-black/60 blur-md" />
        </div>

        {/* свежие поступления */}
        <div className="order-3 min-w-0">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-paper/55">{r.fresh}</p>
          <ul className="mt-4 space-y-2.5">
            {fresh.map((p, i) => (
              <li key={p.slug} className="reel-chip" style={{ animationDelay: `${i * 0.9}s` }}>
                <Link
                  href={`/${lang}/p/${p.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-2 pr-4 backdrop-blur transition-colors hover:border-[#c9a468]/60 hover:bg-white/[0.1]"
                >
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-white">
                    <Image src={p.images[0]} alt="" fill sizes="56px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-paper/55">{p.brand}</span>
                    <span className="block truncate text-[0.92rem] font-medium">{p.name}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-[#f3dfb2]">{priceLabel(p, lang)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// Логотипы брендов (SVG с Wikimedia Commons, см. public/brand/logos/SOURCES.md).
// brand — точное название, как в каталоге: по нему работает фильтр.
const LOGOS: { brand: string; file: string }[] = [
  { brand: "Chanel", file: "chanel.svg" },
  { brand: "Dior", file: "dior.svg" },
  { brand: "YSL", file: "ysl.svg" },
  { brand: "Tom Ford", file: "tom-ford.svg" },
  { brand: "Louis Vuitton", file: "louis-vuitton.svg" },
  { brand: "Creed", file: "creed.svg" },
  { brand: "Burberry", file: "burberry.svg" },
  { brand: "Bvlgari", file: "bvlgari.svg" },
  { brand: "Guerlain", file: "guerlain.svg" },
  { brand: "Versace", file: "versace.svg" },
  { brand: "Armani Beauty", file: "armani.svg" },
  { brand: "Charlotte Tilbury", file: "charlotte-tilbury.svg" },
  { brand: "Penhaligon’s", file: "penhaligons.svg" },
  { brand: "Bath & Body Works", file: "bath-body-works.svg" },
];

/** Бренды — сетка логотипов; клик открывает каталог с этим брендом */
export function BrandWall({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const logos = LOGOS.filter((l) => BRANDS.includes(l.brand)).map((l) => ({
    ...l,
    // есть ли файл логотипа — проверяется при сборке; если нет, показываем название
    has: fs.existsSync(path.join(process.cwd(), "public", "brand", "logos", l.file)),
  })).filter((l) => l.has); // только бренды с настоящим логотипом
  return (
    <section className="shell relative isolate pt-20">
      <Swatch name="gloss-pink" className="-bottom-10 -right-8 h-auto w-24 max-w-none rotate-[20deg] sm:w-32" />
      <div className="flex items-end justify-between gap-4">
        <h2 className="relative isolate inline-block font-display text-3xl font-medium sm:text-4xl">
          <Swatch name="peach" className="-left-[0.35em] top-1/2 h-[1.9em] w-auto max-w-none -translate-y-1/2 opacity-90 rotate-2" />
          {t.home.brandsTitle}
        </h2>
        <Link href={`/${lang}/catalog`} className="shrink-0 text-sm text-cocoa underline underline-offset-4 hover:text-ink">
          {t.home.brandsAll}
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-5">
        {logos.map((l) => (
          <li key={l.brand}>
            <Link
              href={`/${lang}/catalog?brand=${encodeURIComponent(l.brand)}`}
              className="group grid h-20 place-items-center rounded-xl border border-line bg-white/70 px-4 transition-colors hover:border-ink sm:h-24"
              aria-label={l.brand}
            >
                <img
                  src={`${BASE}/brand/logos/${l.file}`}
                  alt={l.brand}
                  loading="lazy"
                  className="max-h-9 w-auto max-w-[72%] object-contain opacity-80 brightness-0 transition-opacity group-hover:opacity-100 sm:max-h-11"
                />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Как заказать — три шага по порядку */
export function HowToOrder({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <section className="shell relative isolate pt-20">
      <Swatch name="bronze" className="-right-[4%] top-8 h-[26rem] w-auto max-w-none rotate-[18deg] opacity-80" />
      <h2 className="relative isolate inline-block font-display text-2xl font-medium tracking-[-0.01em] sm:text-3xl">
        <Swatch name="lipliner-burgundy" className="-bottom-4 -left-1 h-[0.6rem] w-[115%] max-w-none opacity-80" />
        {t.home.howTitle}
      </h2>
      <ol className="mt-6 grid gap-3 md:grid-cols-3 md:gap-4">
        {t.home.how.map(([title, text], i) => (
          <li key={title} className="rounded-2xl border border-line bg-white/60 p-6">
            <span className="tag">{i + 1}</span>
            <p className="mt-4 font-display text-xl font-medium">{title}</p>
            <p className="mt-1.5 leading-relaxed text-cocoa">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
