import { products, type ProductWithImages } from "./products";

/** Адрес страницы парфюмерного дома: «Penhaligon’s» → penhaligons, «Zielinski & Rozen» → zielinski-rozen */
export function houseSlug(brand: string) {
  return brand
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type House = { slug: string; brand: string; items: ProductWithImages[]; minPrice: number; minUsd: number };

/** Парфюмерные дома бутика Maison De Mari — по товарам с пометкой boutique */
export const houses: House[] = (() => {
  const map = new Map<string, House>();
  for (const p of products.filter((x) => x.boutique)) {
    const slug = houseSlug(p.brand);
    const h = map.get(slug) ?? { slug, brand: p.brand, items: [], minPrice: 0, minUsd: 0 };
    h.items.push(p);
    const price = p.variants ? Math.min(...p.variants.map((v) => v.price)) : p.price;
    if (!p.usd && price && (!h.minPrice || price < h.minPrice)) h.minPrice = price;
    if (p.usd) {
      const u = Math.min(...p.usd.map((x) => x.usd));
      if (!h.minUsd || u < h.minUsd) h.minUsd = u;
    }
    map.set(slug, h);
  }
  // дома с большим выбором — первыми
  return [...map.values()].sort((a, b) => b.items.length - a.items.length || a.brand.localeCompare(b.brand));
})();

export const getHouse = (slug: string) => houses.find((h) => h.slug === slug);
