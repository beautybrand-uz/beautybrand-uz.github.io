import { Swatch } from "@/components/swatch";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, products, type Category } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/site";
import { Tilt } from "@/components/tilt";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Своя рекламная картинка раздела: brand/categories → shop/public/brand/categories (make_categories.py)
function bannerFor(c: Category) {
  const file = path.join(process.cwd(), "public", "brand", "categories", `${c}.webp`);
  return fs.existsSync(file) ? `${BASE}/brand/categories/${c}.webp` : undefined;
}

// Запасной вариант, пока картинки нет, — фото товара, которое лучше всего показывает раздел
const COVER: Record<Category, string> = {
  makeup: "dior-backstage-glow-maximizer-007",
  skin: "dior-hydra-life-fresh-sorbet-creme",
  hair: "kerastase-genesis-cure",
  fragrance: "mfk-724",
  body: "bath-body-works-shimmer-body-butter",
  tools: "makeup-by-mario-brush-set",
  sets: "charlotte-tilbury-hollywood-beauty-wonderland",
};

// Где на картинке главный предмет: верх кадра не обрезаем, чтобы флаконы и палетки стояли ровно
const FOCUS: Partial<Record<Category, string>> = {
  makeup: "object-[center_25%]",
  skin: "object-[center_35%]",
};

// Размер плитки в сетке: макияж — главный, уход за лицом — широкий
const SPAN: Partial<Record<Category, string>> = {
  makeup: "col-span-2 row-span-2",
  skin: "md:col-span-2",
};

export function CategoryPromos({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const count = (c: Category) => products.filter((p) => p.category === c).length;
  const sale = products.find((p) => p.oldPrice);

  return (
    <section className="shell relative isolate pt-14" aria-labelledby="promo-title">
      <Swatch name="blush-pink" className="-right-10 -top-6 h-56 w-auto max-w-none opacity-80" />
      <h2 id="promo-title" className="relative isolate mb-5 inline-block font-display text-2xl font-medium tracking-[-0.01em] sm:text-3xl">
        <Swatch name="lipstick-nude" className="-left-[0.6em] top-[60%] h-auto w-[140%] max-w-none -translate-y-1/2 opacity-80 -rotate-2" />
        {t.promo.title}
      </h2>
      <div className="grid auto-rows-[11rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] md:grid-cols-4 md:gap-4 xl:auto-rows-[16rem]">
        {CATEGORIES.filter((c) => count(c) > 0).map((c) => {
          const cover = bannerFor(c) ?? products.find((p) => p.slug === COVER[c])?.images[0];
          const big = c === "makeup";
          return (
            <Tilt key={c} className={SPAN[c] ?? ""} max={big ? 4 : 7} radius="1rem">
            <Link
              href={c === "fragrance" ? `/${lang}/maison` : `/${lang}/c/${c}`}
              className="card-3d group relative flex h-full overflow-hidden rounded-2xl bg-well"
            >
              {cover ? (
                <Image
                  src={cover}
                  alt=""
                  fill
                  sizes={big ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                  className={`object-cover transition-transform duration-700 group-hover:scale-[1.05] ${FOCUS[c] ?? "object-center"}`}
                />
              ) : null}
              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(42,26,21,0)_25%,rgba(42,26,21,0.55)_60%,rgba(42,26,21,0.9)_100%)]" />
              <span className="relative mt-auto flex w-full items-end justify-between gap-3 p-4 text-paper sm:p-5">
                <span className="min-w-0">
                  <span
                    className={`block font-display font-medium leading-tight tracking-[-0.01em] ${
                      big ? "text-2xl sm:text-4xl" : "text-lg sm:text-xl"
                    }`}
                  >
                    {t.categories[c]}
                  </span>
                  <span className={`mt-1 block text-paper/80 ${big ? "text-sm sm:text-base" : "hidden text-sm sm:block"}`}>
                    {t.categoryLead[c]}
                  </span>
                  <span className="mt-1.5 block text-xs text-paper/70">{t.catalog.found(count(c))}</span>
                </span>
                <span
                  className={`hidden shrink-0 items-center rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink transition-colors group-hover:bg-rose group-hover:text-white sm:inline-flex ${
                    big ? "" : "md:hidden"
                  }`}
                >
                  {t.promo.cta}
                </span>
              </span>
            </Link>
            </Tilt>
          );
        })}

        {sale?.oldPrice ? (
          <Tilt className="col-span-2 md:col-span-1" max={7} radius="1rem">
          <Link
            href={`/${lang}/p/${sale.slug}`}
            className="card-3d group relative flex h-full items-center gap-4 overflow-hidden rounded-2xl bg-rose p-4 text-white md:flex-col md:items-start md:justify-between sm:p-5"
          >
            <span>
              <span className="block text-sm font-semibold text-white/80">{t.promo.sale}</span>
              <span className="block font-display text-5xl font-semibold leading-none tracking-[-0.04em] sm:text-6xl">
                −{Math.round((1 - sale.price / sale.oldPrice) * 100)}%
              </span>
            </span>
            <span className="min-w-0">
              <span className="block text-sm text-white/80">{sale.brand}</span>
              <span className="block font-medium leading-snug">{sale.name}</span>
              <span className="mt-1 block text-sm font-semibold">{formatPrice(sale.price, t.currency)}</span>
            </span>
          </Link>
          </Tilt>
        ) : null}
      </div>
    </section>
  );
}
