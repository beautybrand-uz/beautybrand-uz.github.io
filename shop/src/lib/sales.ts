"use client";

import { useEffect, useState } from "react";
import { SB_URL, headers, supabaseEnabled } from "./supabase";
import type { Locale } from "./i18n";

/**
 * Сколько раз заказывали товары — из функции product_sales (supabase/sales.sql).
 * Только настоящие заказы: пока база не подключена, ничего не показываем.
 */
export type Sales = { orders: Map<string, number>; hits: Set<string> };

/** С какого числа заказов показываем строку «Заказали N раз» */
export const MIN_ORDERS = 3;
/** Сколько самых продаваемых товаров получают значок «Хит продаж» */
const HITS = 6;

const EMPTY: Sales = { orders: new Map(), hits: new Set() };
let cache: Promise<Sales> | null = null;

function load(): Promise<Sales> {
  if (!supabaseEnabled) return Promise.resolve(EMPTY);
  cache ??= fetch(`${SB_URL}/rest/v1/rpc/product_sales`, { method: "POST", headers: headers(), body: "{}" })
    .then((r) => (r.ok ? r.json() : []))
    .then((rows: { slug: string; orders: number }[]) => {
      const orders = new Map(rows.map((r) => [r.slug, Number(r.orders)]));
      const hits = new Set(
        rows
          .filter((r) => Number(r.orders) >= MIN_ORDERS)
          .sort((a, b) => Number(b.orders) - Number(a.orders))
          .slice(0, HITS)
          .map((r) => r.slug),
      );
      return { orders, hits };
    })
    .catch(() => EMPTY);
  return cache;
}

export function useSales(): Sales {
  const [s, setS] = useState(EMPTY);
  useEffect(() => {
    let live = true;
    load().then((x) => live && setS(x));
    return () => {
      live = false;
    };
  }, []);
  return s;
}

/** «Заказали 12 раз» / «12 marta buyurtma qilindi» */
export function orderedText(n: number, lang: Locale) {
  if (lang === "uz") return `${n} marta buyurtma qilindi`;
  const d = n % 10;
  const dd = n % 100;
  const word = d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? "раза" : "раз";
  return `Заказали ${n} ${word}`;
}

export const hitLabel = (lang: Locale) => (lang === "ru" ? "Хит продаж" : "Xit savdo");
