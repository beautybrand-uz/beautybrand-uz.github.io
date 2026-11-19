import { Swatch } from "@/components/swatch";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/catalog";
import { getDict, isLocale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/catalog">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: t.catalog.title,
    alternates: { canonical: `/${lang}/catalog`, languages: { ru: "/ru/catalog", uz: "/uz/catalog" } },
  };
}

/** Полный каталог с поиском — отдельная страница, на главной его нет */
export default async function CatalogPage({ params }: PageProps<"/[lang]/catalog">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <div className="shell pt-8">
      <h1 className="relative isolate inline-block mb-4 font-display text-3xl font-medium tracking-[-0.02em] sm:text-4xl">
        <Swatch name="peach" className="-left-[0.35em] top-1/2 h-[1.9em] w-auto max-w-none -translate-y-1/2 opacity-90 -rotate-2" />{t.catalog.title}</h1>
      <Catalog lang={lang} />
    </div>
  );
}
