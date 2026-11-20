import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaisonHero } from "@/components/maison";
import { HouseGrid } from "@/components/houses";
import { MoodFinder } from "@/components/mood-finder";
import { MOODS } from "@/data/moods";
import fs from "node:fs";
import path from "node:path";
import { houses } from "@/data/houses";
import { ReviewsFeed } from "@/components/reviews";
import { ExtraBoutique } from "@/components/extra-grid";
import { getDict, isLocale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/maison">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang).maison;
  return {
    metadataBase: new URL(SITE_URL),
    title: `Maison De Mari — ${t.label}`,
    description: t.lead,
    alternates: { canonical: `/${lang}/maison`, languages: { ru: "/ru/maison", uz: "/uz/maison" } },
  };
}

export default async function MaisonPage({ params }: PageProps<"/[lang]/maison">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang).maison;
  // картинки настроений есть — показываем их, иначе фото аромата
  const moodImages = Object.fromEntries(
    MOODS.map((m) => [m, fs.existsSync(path.join(process.cwd(), "public", "brand", "moods", `${m}.webp`))]),
  );


  return (
    <>
      <MaisonHero lang={lang} />
      <MoodFinder lang={lang} images={moodImages} />
      {/* цитата — пауза между выбором по настроению и домами */}
      <figure className="shell pt-20 text-center">
        <span aria-hidden className="mx-auto block h-px w-24 bg-gradient-to-r from-transparent via-[#c9a468] to-transparent" />
        <blockquote className="mx-auto mt-8 max-w-[34ch] text-balance text-[1.6rem] font-light leading-snug tracking-[-0.01em] sm:text-[2.2rem]">
          «{t.quote}»
        </blockquote>
        <figcaption className="mt-4 font-script text-3xl text-[#b88a3e]">{t.quoteBy}</figcaption>
      </figure>
      <section id="aromas" className="shell scroll-mt-24 pt-16">
        <h2 className="font-display text-3xl font-medium sm:text-4xl">{t.housesTitle}</h2>
        <p className="mt-2 max-w-[60ch] text-cocoa">{t.housesLead}</p>
        <HouseGrid houses={houses} lang={lang} />
        <ExtraBoutique lang={lang} usd={false} title={t.newIn} />
        <ExtraBoutique lang={lang} usd />
      </section>
      <ReviewsFeed lang={lang} plain />
    </>
  );
}
