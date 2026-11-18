import Image from "next/image";
import Link from "next/link";
import { TelegramIcon } from "./cart-drawer";
import { Reveal } from "./reveal";
import { products } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { telegramLink } from "@/lib/site";

export const MAISON_CHANNEL = "Maisondemari";

const pic = (slug: string) => products.find((p) => p.slug === slug)?.images[0] ?? "";

// Три самых атмосферных фото бутика для мозаики
const MOSAIC = ["louis-vuitton-moon-tale", "orto-parisi-boccanera", "guerlain-nerolia-vetiver-set"];

function Mosaic({ big }: { big?: boolean }) {
  const [a, b, c] = MOSAIC.map(pic);
  return (
    <div className={`grid grid-cols-[1.25fr_1fr] gap-3 ${big ? "h-[22rem] sm:h-[28rem]" : "h-56 sm:h-64"}`}>
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

/** Шапка страницы бутика — тёмная, с золотым акцентом */
export function MaisonHero({ lang }: { lang: Locale }) {
  const t = getDict(lang).maison;
  return (
    <section className="bg-[#1b120f] text-paper">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1.05fr] md:py-20">
        <div>
          <p className="rise text-sm font-semibold text-gold">{t.label}</p>
          <h1 className="rise mt-2 font-script text-[4.2rem] leading-[0.95] text-gold sm:text-[5.5rem]" style={{ animationDelay: "80ms" }}>
            Maison De Mari
          </h1>
          <p className="rise mt-6 max-w-[44ch] text-lg leading-relaxed text-paper/75" style={{ animationDelay: "160ms" }}>
            {t.lead}
          </p>
          <dl className="rise mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-paper/15 pt-6" style={{ animationDelay: "240ms" }}>
            {t.stats.map(([k, v]) => (
              <div key={k}>
                <dt className="font-display text-lg text-paper">{k}</dt>
                <dd className="mt-1 text-xs leading-snug text-paper/60">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="rise mt-8 flex flex-col gap-2.5 sm:flex-row" style={{ animationDelay: "320ms" }}>
            <a href="#aromas" className="btn bg-gold text-[#1b120f] hover:bg-paper">
              {t.toAromas}
            </a>
            <a
              href={telegramLink(MAISON_CHANNEL)}
              target="_blank"
              rel="noopener"
              className="btn border border-paper/30 text-paper hover:bg-paper hover:text-ink"
            >
              <TelegramIcon />
              {t.channel}
            </a>
          </div>
        </div>
        <div className="rise-image">
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
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
      <Reveal>
        <Link
          href={`/${lang}/maison`}
          className="group grid items-center gap-8 overflow-hidden rounded-[2rem] bg-[#1b120f] p-6 text-paper sm:p-10 md:grid-cols-[1fr_1.1fr] md:p-12"
        >
          <div>
            <p className="text-sm font-semibold text-gold">{t.maison.label}</p>
            <p className="mt-1 font-script text-[3.4rem] leading-none text-gold sm:whitespace-nowrap sm:text-6xl">Maison De Mari</p>
            <p className="mt-5 max-w-[40ch] leading-relaxed text-paper/75">{t.maison.bannerText}</p>
            <span className="btn mt-7 bg-gold text-[#1b120f] transition-colors group-hover:bg-paper">
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
