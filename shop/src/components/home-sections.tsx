import { Swatch } from "@/components/swatch";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ReelStage } from "./reel-stage";
import { priceLabel } from "@/lib/price";
import { TelegramIcon } from "./cart-drawer";
import { BRANDS, products } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { TELEGRAM, telegramLink } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * «Новинки в движении»: большая сторис с роликом из канала (полоски прогресса в такт видео)
 * и парящие вокруг карточки свежих поступлений с параллаксом — reel-stage.tsx.
 */
const REEL_T = {
  ru: { kicker: "Reels · Telegram", title: "Новинки в движении", subs: "подписчиков уже смотрят", watch: "Смотреть в канале", now: "свежий ролик" },
  uz: { kicker: "Reels · Telegram", title: "Yangiliklar harakatda", subs: "obunachi allaqachon kuzatmoqda", watch: "Kanalda ko‘rish", now: "yangi rolik" },
} as const;

/** Сколько товаров показано в ролике new-arrivals.mp4 — столько полосок у сторис */
const REEL_SEGMENTS = 6;

export function NewArrivalsReel({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const r = REEL_T[lang];
  const fresh = products
    .filter((p) => !p.boutique && !p.channel && p.images[0])
    .sort((x, y) => y.post - x.post)
    .slice(0, 4);
  return (
    <section className="reel-band relative isolate overflow-hidden bg-[#1b1310] text-paper">
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-[62%] -z-10 size-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,164,104,0.3),rgba(168,76,92,0.14)_38%,transparent_66%)]" />
      <span aria-hidden className="reel-dust pointer-events-none absolute inset-0 -z-10" />
      {/* тонкая золотая линия-разделитель сверху, чтобы блок не сливался с бутиком */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a468]/60 to-transparent" />

      <div className="shell py-16 lg:py-24">
        <div className="mx-auto max-w-[44rem] text-center">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#c9a468]">{r.kicker}</p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-6xl">{r.title}</h2>
          <p className="mx-auto mt-4 max-w-[46ch] leading-relaxed text-paper/70">{t.home.newText}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
            <a href={telegramLink(TELEGRAM.channel)} target="_blank" rel="noopener" className="btn bg-paper text-ink hover:bg-[#f3dfb2]">
              <TelegramIcon />
              {t.home.newCta}
            </a>
            <p className="text-left leading-tight">
              <span className="block font-display text-2xl text-[#f3dfb2]">6 300+</span>
              <span className="text-xs text-paper/60">{r.subs}</span>
            </p>
          </div>
        </div>

        <ReelStage
          video={`${BASE}/videos/new-arrivals.mp4`}
          poster={fresh[0]?.images[0]}
          segments={REEL_SEGMENTS}
          lang={lang}
          channel="beauty_branduz"
          channelHref={telegramLink(TELEGRAM.channel)}
          watch={r.watch}
          now={r.now}
          items={fresh.map((p) => ({ slug: p.slug, brand: p.brand, name: p.name, image: p.images[0], price: priceLabel(p, lang) }))}
        />
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
