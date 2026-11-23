"use client";

import { useEffect, useState } from "react";
import { getProduct, isCatalogSlug, registerExtra, type Category, type ProductWithImages } from "@/data/products";
import { rest, supabaseEnabled } from "./supabase";

/** Строка таблицы shop_products (supabase/products.sql) */
export type ShopProductRow = {
  slug: string;
  created_at: string;
  brand: string;
  name: string;
  category: Category;
  price: number;
  old_price: number | null;
  variants: { label: string; price: number }[] | null;
  usd: { label: string; usd: number }[] | null;
  bottle: string | null;
  description_ru: string;
  description_uz: string;
  images: string[];
  boutique: boolean;
  published: boolean;
};

export function rowToProduct(r: ShopProductRow): ProductWithImages {
  return {
    slug: r.slug,
    brand: r.brand,
    name: r.name,
    category: r.category,
    price: r.price,
    oldPrice: r.old_price ?? undefined,
    variants: r.variants && r.variants.length ? r.variants : undefined,
    usd: r.usd && r.usd.length ? r.usd : undefined,
    bottle: r.bottle ?? undefined,
    description: { ru: r.description_ru, uz: r.description_uz || r.description_ru },
    post: 0,
    boutique: r.boutique,
    images: r.images,
    video: undefined,
    dynamic: true,
  };
}

let loading: Promise<ProductWithImages[]> | null = null;

/** Товары из админки (один запрос на страницу); регистрируются, чтобы их видели корзина и карточки */
export function loadExtraProducts(): Promise<ProductWithImages[]> {
  if (!supabaseEnabled) return Promise.resolve([]);
  if (!loading) {
    loading = rest<ShopProductRow[]>("shop_products?select=*&published=eq.true&order=created_at.desc")
      .then((rows) => {
        const list = rows.map(rowToProduct);
        registerExtra(list);
        // правки товаров каталога уже применены к ним; новыми товарами считаем только остальные
        return list.filter((p) => !isCatalogSlug(p.slug));
      })
      .catch(() => []);
  }
  return loading;
}

export function useExtraProducts() {
  const [list, setList] = useState<ProductWithImages[]>([]);
  useEffect(() => {
    let alive = true;
    loadExtraProducts().then((l) => alive && setList(l));
    return () => {
      alive = false;
    };
  }, []);
  return list;
}

/** Товар с учётом правок из админки: компонент перерисуется, когда правки загрузятся */
export function useLiveProduct(slug: string) {
  useExtraProducts();
  return getProduct(slug);
}

/** Ссылка на страницу товара: у товаров из админки своя страница */
export function productHref(lang: string, p: { slug: string; dynamic?: boolean }) {
  return p.dynamic ? `/${lang}/item/?p=${encodeURIComponent(p.slug)}` : `/${lang}/p/${p.slug}`;
}
