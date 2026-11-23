import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Swatch } from "@/components/swatch";
import { Vitrina } from "@/components/vitrina";
import { isLocale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

const T = {
  ru: { title: "Витрина", lead: "Нажмите на товар — он сойдёт с полки и повернётся. Потяните его, чтобы покрутить, и положите в корзину прямо отсюда." },
  uz: { title: "Vitrina", lead: "Mahsulotni bosing — u javondan tushib aylanadi. Aylantirish uchun torting va shu yerdan savatga soling." },
} as const;

export async function generateMetadata({ params }: PageProps<"/[lang]/vitrina">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    metadataBase: new URL(SITE_URL),
    title: T[lang].title,
    alternates: { canonical: `/${lang}/vitrina`, languages: { ru: "/ru/vitrina", uz: "/uz/vitrina" } },
  };
}

/** Витрина: полки с объёмными упаковками (components/ui/skincare-product-shelf) */
export default async function VitrinaPage({ params }: PageProps<"/[lang]/vitrina">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = T[lang];
  return (
    <div className="pt-8">
      <div className="shell">
        <h1 className="relative isolate inline-block font-display text-3xl font-medium tracking-[-0.02em] sm:text-4xl">
          <Swatch name="blush-pink" className="-left-[0.4em] top-1/2 h-[2.2em] w-auto max-w-none -translate-y-1/2 opacity-80" />
          {t.title}
        </h1>
        <p className="mt-2 max-w-[60ch] text-cocoa">{t.lead}</p>
      </div>
      <Vitrina lang={lang} />
    </div>
  );
}
