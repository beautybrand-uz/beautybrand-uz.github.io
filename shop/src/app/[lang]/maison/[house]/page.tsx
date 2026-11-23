import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog";
import { houseImage, houseMeta } from "@/components/houses";
import { Reveal } from "@/components/reveal";
import { Scent } from "@/components/scent";
import { getHouse, houses } from "@/data/houses";
import { LOCALES, getDict, isLocale } from "@/lib/i18n";
import { SITE_URL, TELEGRAM, telegramLink } from "@/lib/site";
import { TelegramIcon } from "@/components/cart-drawer";

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => houses.map((h) => ({ lang, house: h.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/maison/[house]">): Promise<Metadata> {
  const { lang, house } = await params;
  const h = getHouse(house);
  if (!h || !isLocale(lang)) return {};
  return {
    metadataBase: new URL(SITE_URL),
    title: `${h.brand} — Maison De Mari`,
    description: `${h.brand}: ${houseMeta(h, lang)}`,
    alternates: { canonical: `/${lang}/maison/${house}`, languages: { ru: `/ru/maison/${house}`, uz: `/uz/maison/${house}` } },
  };
}

/** Страница парфюмерного дома: атмосферная шапка и все его ароматы */
export default async function HousePage({ params }: PageProps<"/[lang]/maison/[house]">) {
  const { lang, house } = await params;
  const h = getHouse(house);
  if (!h || !isLocale(lang)) notFound();
  const t = getDict(lang).maison;
  const decants = h.items.filter((p) => !p.usd);
  const bottles = h.items.filter((p) => p.usd);

  const Grid = ({ items }: { items: typeof h.items }) => (
    <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((p, i) => (
        <Reveal as="li" key={p.slug} delay={(i % 4) * 60}>
          <ProductCard p={p} lang={lang} />
        </Reveal>
      ))}
    </ul>
  );

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#1b120f] text-paper">
        <Scent />
        <div className="shell grid items-center gap-8 py-10 md:grid-cols-[1fr_minmax(0,22rem)] md:py-14">
          <div>
            <Link href={`/${lang}/maison`} className="inline-flex items-center gap-1.5 text-sm text-paper/65 hover:text-paper">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Maison De Mari
            </Link>
            <h1 className="rise mt-4 text-[2.6rem] font-medium leading-none tracking-[-0.03em] sm:text-6xl">{h.brand}</h1>
            <p className="rise mt-4 text-paper/70" style={{ animationDelay: "90ms" }}>
              {houseMeta(h, lang)}
            </p>
            <a
              href={telegramLink(TELEGRAM.maison)}
              target="_blank"
              rel="noopener"
              className="rise mt-6 inline-flex items-center gap-2 rounded-full border border-gold/50 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-[#1b120f]"
              style={{ animationDelay: "160ms" }}
            >
              <TelegramIcon />
              {getDict(lang).maison.channel}
            </a>
          </div>
          <div className="rise-image relative mx-auto aspect-[4/5] w-full max-w-[16rem] overflow-hidden rounded-2xl md:max-w-none">
            <Image src={houseImage(h)} alt="" fill priority sizes="(min-width: 768px) 22rem, 16rem" className="object-cover" />
          </div>
        </div>
      </section>
      {decants.length ? (
        <section className="shell pt-14">
          <h2 className="font-display text-3xl font-medium">{t.decants}</h2>
          <p className="mt-2 max-w-[60ch] text-cocoa">{t.decantsLead}</p>
          <Grid items={decants} />
        </section>
      ) : null}
      {bottles.length ? (
        <section className="shell pt-14">
          <h2 className="font-display text-3xl font-medium">{t.bottles}</h2>
          <p className="mt-2 max-w-[60ch] text-cocoa">{t.bottlesLead}</p>
          <Grid items={bottles} />
        </section>
      ) : null}
    </>
  );
}
