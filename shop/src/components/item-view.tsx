"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BuyBox, Gallery } from "./product-client";
import { ProductReviews } from "./reviews";
import { getProduct, type ProductWithImages } from "@/data/products";
import { loadExtraProducts } from "@/lib/extra-products";
import { getDict, type Locale } from "@/lib/i18n";

export function ItemView({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const [p, setP] = useState<ProductWithImages | null | undefined>(undefined);

  useEffect(() => {
    const slug = new URLSearchParams(location.search).get("p") ?? "";
    loadExtraProducts().then(() => setP(getProduct(slug) ?? null));
  }, []);

  if (p === undefined) return <div className="shell min-h-[60vh] pt-10" aria-busy="true" />;
  if (p === null)
    return (
      <div className="shell flex min-h-[50vh] flex-col items-start justify-center gap-4 pt-10">
        <h1 className="font-display text-3xl">{t.notFound.title}</h1>
        <Link href={`/${lang}/catalog`} className="btn btn-primary">
          {t.notFound.action}
        </Link>
      </div>
    );

  return (
    <div className="shell pt-5">
      <Link
        href={`/${lang}/c/${p.category}`}
        className="inline-flex items-center gap-1.5 py-2 text-sm text-cocoa hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {`${t.product.back}: ${t.categories[p.category]}`}
      </Link>
      <div className="mt-3 grid gap-8 font-product md:grid-cols-2 md:gap-12">
        <Gallery images={p.images} alt={`${p.brand} ${p.name}`} />
        <div className="md:pt-4">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-cocoa">{p.brand}</p>
          <h1 className="mt-2 text-[2rem] font-semibold leading-[1.04] tracking-[-0.035em] text-balance sm:text-[2.5rem]">{p.name}</h1>
          {p.description[lang] ? <p className="mt-5 max-w-[60ch] whitespace-pre-line leading-relaxed">{p.description[lang]}</p> : null}
          <BuyBox slug={p.slug} lang={lang} />
          <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-cocoa">
            <li>{t.product.original}</li>
            <li>{t.product.pickup}</li>
          </ul>
        </div>
      </div>
      <ProductReviews slug={p.slug} productName={`${p.brand} ${p.name}`} lang={lang} />
    </div>
  );
}
