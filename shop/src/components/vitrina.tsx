"use client";

import { ProductShelf, type Product as ShelfProduct, type ShelfLabels } from "@/components/ui/skincare-product-shelf";
import { useCart } from "./cart";
import { NOTE, getDetails } from "@/data/details";
import { products } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Как выглядит упаковка каждого товара на полке: форма, цвета корпуса, крышки и печати.
 * Подобраны по фото из канала. Товары — настоящие, цены и описания — из каталога.
 */
const LOOK: { slug: string; kind: ShelfProduct["kind"]; short: string; sub?: string; color: string; cap: string; label?: string; ink: string; glass?: boolean; liquid?: string }[] = [
  // полка 1 — лицо и губы
  { slug: "dior-hydra-life-fresh-sorbet-creme", kind: "jar", short: "Hydra Life", sub: "Sorbet Creme", color: "#f6eef0", cap: "#f2dde3", ink: "#5a3d45" },
  { slug: "charlotte-tilbury-loose-setting-powder", kind: "jar", short: "Setting Powder", sub: "Loose", color: "#efd7cc", cap: "#c8937e", ink: "#6b3f33" },
  { slug: "dior-glow-stick-012-rosewood", kind: "stick", short: "Rosy Glow", sub: "012", color: "#c9737f", cap: "#e8c3c8", ink: "#ffffff" },
  { slug: "bobbi-brown-extra-plump-lip-serum", kind: "lip", short: "Extra Plump", sub: "Lip Serum", color: "#f0a2b4", cap: "#f4f1ee", ink: "#7a2f42" },
  // полка 2 — волосы
  { slug: "kerastase-genesis-anti-chute-serum", kind: "dropper", short: "Genesis", sub: "Sérum Anti-Chute", color: "#f2e4e6", cap: "#d8253f", label: "#ffffff", ink: "#c8102e", glass: true, liquid: "#f6d2d8" },
  { slug: "kerastase-genesis-defense-thermique", kind: "pump", short: "Genesis", sub: "Défense Thermique", color: "#f3cfd5", cap: "#f7f4f2", ink: "#b0162e" },
  { slug: "color-wow-dream-coat-extra-strength", kind: "mist", short: "Dream Coat", sub: "Extra Strength", color: "#2a2a2d", cap: "#151515", ink: "#e8e2d8" },
  { slug: "keune-rush-hour", kind: "mist", short: "Rush Hour", sub: "2-in-1 Spray", color: "#f3f3f1", cap: "#dcdcd8", ink: "#1d1d1d" },
  // полка 3 — тело и ароматы
  { slug: "keune-derma-activate-thickening-spray", kind: "bottle", short: "Derma Activate", sub: "Thickening Spray", color: "#f5f5f3", cap: "#e8e8e4", label: "#ffffff", ink: "#2b2b2b" },
  { slug: "bath-body-works-shimmer-body-butter", kind: "jar", short: "Shimmer", sub: "Body Butter", color: "#f1e5d8", cap: "#d9b98f", ink: "#6a4b33" },
  { slug: "mfk-724", kind: "perfume", short: "724", sub: "Eau de Parfum", color: "#eef0f0", cap: "#d9d6cf", ink: "#2a2a2a", glass: true, liquid: "#f3ecdc" },
  { slug: "bleu-de-chanel-parfum", kind: "perfume", short: "Bleu de Chanel", sub: "Parfum", color: "#1f2a44", cap: "#121826", ink: "#e8e4da", glass: true, liquid: "#2c3c63" },
];

const T = {
  ru: {
    rows: ["Лицо и губы", "Волосы", "Тело и ароматы"],
    labels: {
      shelf: "Витрина",
      size: "Объём",
      add: "В корзину",
      added: "Добавлено в корзину",
      details: "Что даёт",
      ingredients: "Ноты аромата",
      howTo: "Как использовать",
      drag: "Потяните, чтобы повернуть",
      delivery: ["Доставка:", "по Ташкенту — уточним в Telegram"],
      pickup: ["Самовывоз:", "Ц5 и Ц1, сегодня"],
      more: "Подробнее о товаре",
      ratings: (n: number) => `${n} отзывов`,
      bag: (n: number) => `Корзина, ${n}`,
      less: "Меньше",
      moreQty: "Больше",
    } satisfies ShelfLabels,
    notes: ["Верх", "Сердце", "База"],
  },
  uz: {
    rows: ["Yuz va lablar", "Sochlar", "Tana va atirlar"],
    labels: {
      shelf: "Vitrina",
      size: "Hajm",
      add: "Savatga",
      added: "Savatga qo‘shildi",
      details: "Nima beradi",
      ingredients: "Atir notalari",
      howTo: "Qanday qo‘llash",
      drag: "Aylantirish uchun torting",
      delivery: ["Yetkazib berish:", "Toshkent bo‘ylab — Telegramda aniqlaymiz"],
      pickup: ["Olib ketish:", "Ts5 va Ts1, bugun"],
      more: "Mahsulot haqida batafsil",
      ratings: (n: number) => `${n} ta sharh`,
      bag: (n: number) => `Savat, ${n}`,
      less: "Kamroq",
      moreQty: "Ko‘proq",
    } satisfies ShelfLabels,
    notes: ["Yuqori", "Yurak", "Asos"],
  },
} as const;

/** «Витрина»: полки с упаковками настоящих товаров магазина, «В корзину» — в корзину сайта */
export function Vitrina({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const L = T[lang];
  const { add } = useCart();
  const i = lang === "ru" ? 0 : 1;

  const items: ShelfProduct[] = LOOK.flatMap((look) => {
    const p = products.find((x) => x.slug === look.slug);
    if (!p) return [];
    const d = getDetails(p.slug);
    const scent = d?.kind === "scent" ? d : null;
    const care = d?.kind === "care" ? d : null;
    const sizes = p.variants?.map((v) => v.label) ?? [""];
    return [
      {
        id: p.slug,
        kind: look.kind,
        name: p.name,
        brand: p.brand,
        short: look.short,
        sub: look.sub,
        category: t.categories[p.category],
        color: look.color,
        cap: look.cap,
        label: look.label ?? look.color,
        ink: look.ink,
        glass: look.glass,
        liquid: look.liquid,
        price: p.price,
        compareAt: p.oldPrice,
        sizes,
        sizePrices: p.variants?.map((v) => v.price),
        tagline: care ? care.forWhom[lang] : scent ? `${scent.family[lang]} · ${scent.wear[lang]}` : "",
        description: p.description[lang],
        benefits: care ? [...care.points[lang]] : [],
        ingredients: scent
          ? (["top", "heart", "base"] as const).map((tier, k) => `${L.notes[k]}: ${scent[tier].map((n) => NOTE[n][i]).join(", ")}`).join(" · ")
          : "",
        howTo: care ? care.howTo[lang] : scent ? scent.wear[lang] : "",
        href: `${BASE}/${lang}/p/${p.slug}`,
      },
    ];
  });

  return (
    <ProductShelf
      products={items}
      chrome={false}
      labels={L.labels}
      rowLabels={[...L.rows]}
      formatPrice={(n) => formatPrice(n, t.currency)}
      onAdd={(p, size, qty) => {
        const variant = size || undefined;
        for (let k = 0; k < qty; k++) add(p.id, variant);
      }}
      className="font-product"
    />
  );
}
