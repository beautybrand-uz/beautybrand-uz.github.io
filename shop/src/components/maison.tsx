import { Scent } from "./scent";
import Image from "next/image";
import Link from "next/link";
import { TelegramIcon } from "./cart-drawer";
import { Reveal } from "./reveal";
import { products } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { TELEGRAM, formatPrice, telegramLink } from "@/lib/site";
import { houses } from "@/data/houses";

export const MAISON_CHANNEL = TELEGRAM.maison;

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";


function Mosaic({ big }: { big?: boolean }) {
  // картинки бутика (Higgsfield): распивы, полка бутика, шлейф аромата
  const [a, b, c] = ["decants", "shelf", "mist"].map((n) => `${BASE_PATH}/brand/boutique/${n}.webp`);
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
    <section className="relative isolate overflow-hidden bg-[#1b120f] text-paper">
      <Scent />
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
                <dd className="whitespace-nowrap text-[1rem] font-medium leading-none tracking-[-0.01em] text-gold sm:text-[1.2rem] xl:text-[1.35rem]">{value}</dd>
                <dd className="mt-2 text-[0.75rem] leading-snug text-paper/65 sm:text-[0.82rem]">{label}</dd>
              </div>
            ))}
          </dl>
          <div className="rise mt-8" style={{ animationDelay: "320ms" }}>
            <a
            href={telegramLink(TELEGRAM.maison)}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-[#1b120f]"
          >
            <TelegramIcon />
            {t.channel} · t.me/Maisondemari
          </a>
          </div>
        </div>
        <div className="rise-image relative isolate">
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
    <section className="relative isolate mt-20 overflow-hidden bg-[#1b120f] text-paper">
      <Scent />
      <Reveal>
        <div className="shell grid items-center gap-10 py-14 md:grid-cols-[1fr_1.2fr] md:py-20 lg:gap-20">
          <div>
            <p className="text-sm font-semibold text-gold">{t.maison.label}</p>
            <p className="mt-1 font-script text-[3rem] leading-none text-gold sm:whitespace-nowrap sm:text-[3.6rem] lg:text-[4.2rem]">Maison De Mari</p>
            <p className="mt-5 max-w-[40ch] leading-relaxed text-paper/75">{t.maison.bannerText}</p>
            <dl className="mt-8 grid max-w-[34rem] grid-cols-3 gap-4 border-t border-paper/15 pt-6 sm:gap-6">
              {boutiqueStats(lang).map(([value, label], i) => (
                <div key={label} className={`min-w-0 ${i ? "border-l border-paper/15 pl-4 sm:pl-6" : ""}`}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="whitespace-nowrap text-[1rem] font-medium leading-none tracking-[-0.01em] text-gold sm:text-[1.2rem] xl:text-[1.35rem]">{value}</dd>
                  <dd className="mt-2 text-[0.75rem] leading-snug text-paper/65 sm:text-[0.82rem]">{label}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href={`/${lang}/maison`} className="group inline-flex items-center gap-2 text-sm font-semibold text-gold underline-offset-4 hover:underline">
                {t.maison.cta}
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </Link>
              <a
                href={telegramLink(TELEGRAM.maison)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 text-sm font-semibold text-paper/75 underline-offset-4 hover:text-gold hover:underline"
              >
                <TelegramIcon />
                {t.maison.channel}
              </a>
            </div>
          </div>
          <Link href={`/${lang}/maison`} aria-label="Maison De Mari" className="group block">
            <Mosaic />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
