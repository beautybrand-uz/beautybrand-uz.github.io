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
 * «Новинки в движении» — парфюмерия Maison De Mari: ароматы сменяются в «кружочке» как видеосообщение
 * Telegram, рядом текст и кнопка канала бутика, справа — все ароматы списком (листается) — reel-stage.tsx.
 */
const REEL_T = {
  ru: {
    kicker: "Maison De Mari · Telegram",
    title: "Новинки в движении",
    text: "Ароматы парфюмерного бутика: распив от 5 мл и полные флаконы под заказ. Новинки и отзывы — каждую неделю в канале бутика.",
    cta: "Канал бутика",
  },
  uz: {
    kicker: "Maison De Mari · Telegram",
    title: "Yangiliklar harakatda",
    text: "Atir butigi: 5 ml dan quyma va buyurtma asosida to‘liq flakonlar. Yangiliklar va sharhlar — har hafta butik kanalida.",
    cta: "Butik kanali",
  },
} as const;


export function NewArrivalsReel({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const r = REEL_T[lang];
  // ароматы бутика в порядке каталога (как в канале Maison De Mari)
  const fresh = products.filter((p) => p.boutique && p.images[0]);
  return (
    <section className="reel-band relative isolate overflow-hidden bg-[#1b1310] text-paper">
      <span aria-hidden className="pointer-events-none absolute left-[18%] top-1/2 -z-10 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,164,104,0.22),rgba(168,76,92,0.1)_38%,transparent_66%)]" />
      <span aria-hidden className="reel-dust pointer-events-none absolute inset-0 -z-10" />
      {/* тонкая золотая линия-разделитель сверху, чтобы блок не сливался с бутиком */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a468]/60 to-transparent" />

      <div className="shell py-12 lg:py-14">
        <ReelStage
          lang={lang}
          channel="Maisondemari"
          channelHref={telegramLink(TELEGRAM.maison)}
          items={fresh.map((p) => ({ slug: p.slug, brand: p.brand, name: p.name, image: p.images[0], price: priceLabel(p, lang) }))}
          intro={
            <>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#c9a468]">{r.kicker}</p>
              <h2 className="mt-2 font-display text-3xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-4xl">{r.title}</h2>
              <p className="mt-3 max-w-[40ch] text-[0.95rem] leading-relaxed text-paper/70">{r.text}</p>
              <a href={telegramLink(TELEGRAM.maison)} target="_blank" rel="noopener" className="btn mt-6 bg-paper text-ink hover:bg-[#f3dfb2]">
                <TelegramIcon />
                {r.cta}
              </a>
            </>
          }
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
