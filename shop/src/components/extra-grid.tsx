"use client";

import { ProductCard } from "./catalog";
import { useExtraProducts } from "@/lib/extra-products";
import type { Locale } from "@/lib/i18n";

/** Товары бутика, добавленные через админку (подгружаются в браузере) */
export function ExtraBoutique({ lang, usd }: { lang: Locale; usd: boolean }) {
  const list = useExtraProducts().filter((p) => p.boutique && Boolean(p.usd) === usd);
  if (!list.length) return null;
  return (
    <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {list.map((p) => (
        <li key={p.slug}>
          <ProductCard p={p} lang={lang} />
        </li>
      ))}
    </ul>
  );
}
