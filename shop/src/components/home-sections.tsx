import { Swatch } from "@/components/swatch";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { TelegramIcon } from "./cart-drawer";
import { BRANDS } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { TELEGRAM, telegramLink } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** «Новинки недели»: вертикальный ролик из video/ (NewArrivals) в рамке-телефоне */
export function NewArrivalsReel({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <section className="bg-[#efe5da]">
      <div className="shell grid items-center gap-10 py-14 md:grid-cols-[1fr_auto] md:gap-20 md:py-20">
        <div className="order-2 md:order-1">
          <h2 className="relative isolate inline-block font-display text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl">
            <Swatch name="pink" className="-left-[0.35em] top-1/2 h-[1.9em] w-auto max-w-none -translate-y-1/2 opacity-90 -rotate-3" />
            {t.home.newTitle}
          </h2>
          <p className="mt-4 max-w-[46ch] leading-relaxed text-cocoa">{t.home.newText}</p>
          <a
            href={telegramLink(TELEGRAM.channel)}
            target="_blank"
            rel="noopener"
            className="btn btn-primary mt-8"
          >
            <TelegramIcon />
            {t.home.newCta}
          </a>
        </div>
        <div className="order-1 mx-auto w-[min(17rem,70vw)] md:order-2 lg:w-[19rem]">
          <div className="rounded-[2.2rem] bg-[#3b2721] p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
            <video
              className="aspect-[9/16] w-full rounded-[1.8rem] bg-paper object-cover"
              src={`${BASE}/videos/new-arrivals.mp4`}
              poster={`${BASE}/brand/girl-glam-1200.webp`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={t.home.newTitle}
            />
          </div>
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
    <section className="shell pt-20">
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
      <h2 className="font-display text-2xl font-medium tracking-[-0.01em] sm:text-3xl">{t.home.howTitle}</h2>
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
