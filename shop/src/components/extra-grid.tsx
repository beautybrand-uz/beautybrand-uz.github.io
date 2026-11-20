"use client";

import { ProductCard } from "./catalog";
import { useExtraProducts } from "@/lib/extra-products";
import type { Locale } from "@/lib/i18n";

/** Товары бутика, добавленные через админку (подгружаются в браузере) */
export function ExtraBoutique({ lang, usd, title }: { lang: Locale; usd: boolean; title?: string }) {
  const list = useExtraProducts().filter((p) => p.boutique && Boolean(p.usd) === usd);
  if (!list.length) return null;
  return (
    <>
    {title ? <h3 className="mt-14 text-2xl font-medium">{title}</h3> : null}
    <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {list.map((p) => (
        <li key={p.slug}>
          <ProductCard p={p} lang={lang} />
        </li>
      ))}
    </ul>
    </>
  );
}
