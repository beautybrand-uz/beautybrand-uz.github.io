import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog";
import { MaisonHero } from "@/components/maison";
import { Reveal } from "@/components/reveal";
import { ReviewsFeed } from "@/components/reviews";
import { products } from "@/data/products";
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
  const boutique = products.filter((p) => p.boutique);
  const decants = boutique.filter((p) => !p.usd);
  const bottles = boutique.filter((p) => p.usd);

  const Grid = ({ items }: { items: typeof boutique }) => (
    <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p, i) => (
        <Reveal as="li" key={p.slug} delay={(i % 4) * 60}>
          <ProductCard p={p} lang={lang} />
        </Reveal>
      ))}
    </ul>
  );

  return (
    <>
      <MaisonHero lang={lang} />
      <section id="aromas" className="shell scroll-mt-20 pt-16">
        <h2 className="font-display text-3xl font-medium sm:text-4xl">{t.decants}</h2>
        <p className="mt-2 max-w-[60ch] text-cocoa">{t.decantsLead}</p>
        <Grid items={decants} />
      </section>
      <section className="shell pt-20">
        <h2 className="font-display text-3xl font-medium sm:text-4xl">{t.bottles}</h2>
        <p className="mt-2 max-w-[60ch] text-cocoa">{t.bottlesLead}</p>
        <Grid items={bottles} />
      </section>
      <ReviewsFeed lang={lang} />
    </>
  );
}
