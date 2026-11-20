import { Swatch } from "@/components/swatch";
import Image from "next/image";
import Link from "next/link";
import { TelegramIcon } from "./cart-drawer";
import { Reveal } from "./reveal";
import { products } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { formatPrice, telegramLink } from "@/lib/site";
import { houses } from "@/data/houses";

export const MAISON_CHANNEL = "Maisondemari";

const pic = (slug: string) => products.find((p) => p.slug === slug)?.images[0] ?? "";

// Три самых атмосферных фото бутика для мозаики
const MOSAIC = ["louis-vuitton-moon-tale", "orto-parisi-boccanera", "guerlain-nerolia-vetiver-set"];

function Mosaic({ big }: { big?: boolean }) {
  const [a, b, c] = MOSAIC.map(pic);
  return (
    <div className={`grid grid-cols-[1.25fr_1fr] gap-3 ${big ? "h-[22rem] sm:h-[28rem] xl:h-[32rem]" : "h-56 sm:h-72 xl:h-80"}`}>
      <div className="relative row-span-2 overflow-hidden rounded-2xl">
        <Image src={a} alt="" fill sizes="(min-width: 768px) 30vw, 55vw" className="object-cover" />
      </div>
      <div className="relative overflow-hidden rounded-2xl">
        <Image src={b} alt="" fill sizes="(min-width: 768px) 20vw, 40vw" className="object-cover" />
      </div>
      <div className="relative overflow-hidden rounded-2xl">
        <Image src={c} alt="" fill sizes="(min-width: 768px) 20vw, 40vw" className="object-cover" />
      </div>
    </div>
  );
}

function boutiqueStats(lang: Locale) {
  const t = getDict(lang).maison;
  const boutique = products.filter((p) => p.boutique);
  const min = Math.min(...boutique.filter((p) => !p.usd).map((p) => (p.variants ? Math.min(...p.variants.map((v) => v.price)) : p.price)));
  return t.heroStats(boutique.length, formatPrice(min, getDict(lang).currency), houses.length);
}

/** Шапка страницы бутика — тёмная, с золотым акцентом */
export function MaisonHero({ lang }: { lang: Locale }) {
  const t = getDict(lang).maison;
  const boutique = products.filter((p) => p.boutique);
  const aromas = boutique.length;
  const min = Math.min(...boutique.filter((p) => !p.usd).map((p) => (p.variants ? Math.min(...p.variants.map((v) => v.price)) : p.price)));
  const minPrice = formatPrice(min, getDict(lang).currency);
  return (
    <section className="bg-[#1b120f] text-paper">
      <div className="shell grid items-center gap-10 py-14 md:grid-cols-[1fr_1.05fr] md:py-20">
        <div>
          <p className="rise text-sm font-semibold text-gold">{t.label}</p>
          <h1 className="rise mt-2 font-script text-[4.2rem] leading-[0.95] text-gold sm:text-[5.5rem]" style={{ animationDelay: "80ms" }}>
            Maison De Mari
          </h1>
          <p className="rise mt-6 max-w-[44ch] text-lg leading-relaxed text-paper/75" style={{ animationDelay: "160ms" }}>
            {t.lead}
          </p>
          {/* о бутике — три факта вместо кнопок, как на главной */}
          <dl className="rise mt-9 grid max-w-[38rem] grid-cols-3 gap-4 border-t border-paper/15 pt-7 sm:gap-6" style={{ animationDelay: "240ms" }}>
            {t.heroStats(aromas, minPrice, houses.length).map(([value, label], i) => (
              <div key={label} className={`min-w-0 ${i ? "border-l border-paper/15 pl-4 sm:pl-6" : ""}`}>
                <dt className="sr-only">{label}</dt>
                <dd className="whitespace-nowrap text-[1.15rem] font-medium leading-none tracking-[-0.02em] text-gold sm:text-[1.6rem] xl:text-[1.85rem]">{value}</dd>
                <dd className="mt-2 text-[0.8rem] leading-snug text-paper/65 sm:text-sm">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rise-image relative isolate">
          <Swatch name="gold" priority className="-left-[12%] -top-[9%] h-28 w-auto max-w-none -rotate-[8deg] opacity-90 sm:h-36" />
          <Mosaic big />
        </div>
      </div>
    </section>
  );
}

/** Баннер бутика на главной */
export function MaisonBanner({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <section className="mt-20 bg-[#1b120f] text-paper">
      <Reveal>
        <Link
          href={`/${lang}/maison`}
          className="shell group grid items-center gap-10 py-14 md:grid-cols-[1fr_1.2fr] md:py-20 lg:gap-20"
        >
          <div>
            <p className="text-sm font-semibold text-gold">{t.maison.label}</p>
            <p className="mt-1 font-script text-[3.4rem] leading-none text-gold sm:whitespace-nowrap sm:text-6xl lg:text-7xl">Maison De Mari</p>
            <p className="mt-5 max-w-[40ch] leading-relaxed text-paper/75">{t.maison.bannerText}</p>
            <dl className="mt-8 grid max-w-[34rem] grid-cols-3 gap-4 border-t border-paper/15 pt-6 sm:gap-6">
              {boutiqueStats(lang).map(([value, label], i) => (
                <div key={label} className={`min-w-0 ${i ? "border-l border-paper/15 pl-4 sm:pl-6" : ""}`}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="whitespace-nowrap text-[1.15rem] font-medium leading-none tracking-[-0.02em] text-gold sm:text-[1.6rem] xl:text-[1.85rem]">{value}</dd>
                  <dd className="mt-2 text-[0.78rem] leading-snug text-paper/65 sm:text-sm">{label}</dd>
                </div>
              ))}
            </dl>
            <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-gold underline-offset-4 group-hover:underline">
              {t.maison.cta}
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="transition-transform group-hover:translate-x-1">
                <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <Mosaic />
        </Link>
      </Reveal>
    </section>
  );
}
