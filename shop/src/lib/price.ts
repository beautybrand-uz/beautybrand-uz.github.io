import type { Product } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/site";

/** Цена для карточки: «от …» у товаров с разными вариантами, $ у флаконов под заказ */
export function priceLabel(p: Product, lang: Locale) {
  const t = getDict(lang);
  if (p.usd) {
    const min = Math.min(...p.usd.map((u) => u.usd));
    return p.usd.length > 1 ? (lang === "ru" ? `от ${min} $` : `${min} $ dan`) : `${min} $`;
  }
  const many = p.variants && new Set(p.variants.map((v) => v.price)).size > 1;
  const base = formatPrice(p.price, t.currency);
  return many ? (lang === "ru" ? `от ${base}` : `${base} dan`) : base;
}
