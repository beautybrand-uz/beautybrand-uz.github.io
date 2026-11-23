"use client";

import { BagIcon } from "./catalog";
import type { Locale } from "@/lib/i18n";
import { MIN_ORDERS, hitLabel, orderedText, useSales } from "@/lib/sales";

/** Страница товара: «Заказали 34 раза · Хит продаж» — только по настоящим заказам */
export function SalesNote({ slug, lang }: { slug: string; lang: Locale }) {
  const { orders, hits } = useSales();
  const n = orders.get(slug) ?? 0;
  if (n < MIN_ORDERS) return null;
  return (
    <p className="rise mt-3 flex flex-wrap items-center gap-2 text-sm text-cocoa">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/60 px-3 py-1">
        <BagIcon />
        {orderedText(n, lang)}
      </span>
      {hits.has(slug) ? (
        <span className="hit-badge rounded-full bg-ink px-3 py-1 text-[0.8rem] font-semibold text-paper">{hitLabel(lang)}</span>
      ) : null}
    </p>
  );
}
