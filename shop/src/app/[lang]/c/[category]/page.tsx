import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/catalog";
import { CATEGORIES, products, type Category } from "@/data/products";
import { LOCALES, getDict, isLocale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

const isCategory = (c: string): c is Category => (CATEGORIES as string[]).includes(c);
const used = CATEGORIES.filter((c) => products.some((p) => p.category === c));

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => used.map((category) => ({ lang, category })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/c/[category]">): Promise<Metadata> {
  const { lang, category } = await params;
  if (!isLocale(lang) || !isCategory(category)) return {};
  const t = getDict(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: t.categories[category],
    description: t.categoryLead[category],
    alternates: { canonical: `/${lang}/c/${category}`, languages: { ru: `/ru/c/${category}`, uz: `/uz/c/${category}` } },
  };
}

export default async function CategoryPage({ params }: PageProps<"/[lang]/c/[category]">) {
  const { lang, category } = await params;
  if (!isLocale(lang) || !isCategory(category)) notFound();
  const t = getDict(lang);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
      <Link href={`/${lang}#promo-title`} className="inline-flex items-center gap-1.5 py-2 text-sm text-cocoa hover:text-ink">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {t.promo.allSection}
      </Link>
      <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.02em] sm:text-4xl">{t.categories[category]}</h1>
      <p className="mt-2 max-w-[60ch] text-cocoa">{t.categoryLead[category]}</p>

      {/* Быстрый переход между разделами */}
      <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {used.map((c) => (
          <Link
            key={c}
            href={`/${lang}/c/${c}`}
            aria-current={c === category ? "page" : undefined}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-sm transition-colors ${
              c === category ? "border-ink bg-ink text-paper" : "border-line bg-white/60 hover:border-cocoa"
            }`}
          >
            {t.categories[c]}
          </Link>
        ))}
      </nav>

      <div className="mt-2">
        <Catalog lang={lang} category={category} />
      </div>
    </div>
  );
}
