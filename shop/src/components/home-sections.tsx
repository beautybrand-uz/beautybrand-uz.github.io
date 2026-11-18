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
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-ink p-6 text-paper sm:p-10 md:grid-cols-[1fr_auto] md:gap-14 md:p-14">
        <div className="order-2 md:order-1">
          <h2 className="font-display text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-4xl">{t.home.newTitle}</h2>
          <p className="mt-4 max-w-[46ch] leading-relaxed text-paper/75">{t.home.newText}</p>
          <a
            href={telegramLink(TELEGRAM.channel)}
            target="_blank"
            rel="noopener"
            className="btn mt-8 bg-paper text-ink hover:bg-rose hover:text-white"
          >
            <TelegramIcon />
            {t.home.newCta}
          </a>
        </div>
        <div className="order-1 mx-auto w-[min(17rem,70vw)] md:order-2">
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
  }));
  const rest = BRANDS.length - logos.length;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-3xl font-medium sm:text-4xl">{t.home.brandsTitle}</h2>
        <Link href={`/${lang}/catalog`} className="shrink-0 text-sm text-cocoa underline underline-offset-4 hover:text-ink">
          {t.home.brandsAll}
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
        {logos.map((l) => (
          <li key={l.brand}>
            <Link
              href={`/${lang}/catalog?brand=${encodeURIComponent(l.brand)}`}
              className="group grid h-20 place-items-center rounded-xl border border-line bg-white/70 px-4 transition-colors hover:border-ink sm:h-24"
              aria-label={l.brand}
            >
              {l.has ? (
                // eslint-disable-next-line @next/next/no-img-element -- SVG-логотипы, оптимизация не нужна
                <img
                  src={`${BASE}/brand/logos/${l.file}`}
                  alt={l.brand}
                  loading="lazy"
                  className="max-h-8 w-auto max-w-[78%] object-contain opacity-75 brightness-0 transition-opacity group-hover:opacity-100 sm:max-h-9"
                />
              ) : (
                <span className="text-center font-display text-[0.95rem] uppercase leading-tight tracking-[0.14em] text-ink/75 transition-colors group-hover:text-ink sm:text-lg">
                  {l.brand}
                </span>
              )}
            </Link>
          </li>
        ))}
        {rest > 0 ? (
          <li>
            <Link
              href={`/${lang}/catalog`}
              className="grid h-20 place-items-center rounded-xl bg-ink px-3 text-center text-sm font-semibold text-paper transition-colors hover:bg-rose-deep sm:h-24"
            >
              {t.home.moreBrands(rest)}
            </Link>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

/** Как заказать — три шага по порядку */
export function HowToOrder({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
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
