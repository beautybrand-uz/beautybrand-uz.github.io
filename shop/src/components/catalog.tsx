"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "./cart";
import { BRANDS, CATEGORIES, products, type Category, type ProductWithImages } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/site";

/** `category` — страница раздела: категория зафиксирована, чипы категорий скрыты */
export function Catalog({ lang, category }: { lang: Locale; category?: Category }) {
  const t = getDict(lang);
  const [catState, setCat] = useState<Category | "all">("all");
  const cat = category ?? catState;
  const brands = category ? BRANDS.filter((b) => products.some((p) => p.category === category && p.brand === b)) : BRANDS;
  const [brand, setBrand] = useState("");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const m = new Map<Category, number>();
    for (const p of products) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, []);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (!brand || p.brand === brand) &&
        (!query || `${p.brand} ${p.name}`.toLowerCase().includes(query)),
    );
  }, [cat, brand, q]);

  const filtered = (!category && cat !== "all") || brand || q;

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-line/70 bg-paper/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div
          className={`-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 ${
            category ? "hidden" : ""
          }`}
        >
          <Chip active={cat === "all"} onClick={() => setCat("all")}>
            {t.catalog.all} <span className="opacity-60">{products.length}</span>
          </Chip>
          {CATEGORIES.filter((c) => counts.get(c)).map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {t.categories[c]} <span className="opacity-60">{counts.get(c)}</span>
            </Chip>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">{t.catalog.search}</span>
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cocoa"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              className="field h-11 min-h-0 py-0 pl-10"
              placeholder={t.catalog.search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <label className="w-[38%] max-w-56">
            <span className="sr-only">{t.catalog.brand}</span>
            <select className="field h-11 min-h-0 py-0" value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">{t.catalog.allBrands}</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="mt-5 text-sm text-cocoa" aria-live="polite">
        {t.catalog.found(list.length)}
      </p>

      {list.length === 0 ? (
        <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl bg-well p-6">
          <p className="text-cocoa">{t.catalog.empty}</p>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setCat("all");
              setBrand("");
              setQ("");
            }}
          >
            {t.catalog.reset}
          </button>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p, i) => (
            <li key={p.slug}>
              <ProductCard p={p} lang={lang} priority={!filtered && i < 4} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-sm transition-colors ${
        active ? "border-ink bg-ink text-paper" : "border-line bg-white/60 text-ink hover:border-cocoa"
      }`}
    >
      {children}
    </button>
  );
}

export function ProductCard({ p, lang, priority }: { p: ProductWithImages; lang: Locale; priority?: boolean }) {
  const t = getDict(lang);
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const href = `/${lang}/p/${p.slug}`;

  return (
    <article className="group flex h-full flex-col">
      <div className="relative">
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-well">
        {p.images[0] ? (
          <Image
            src={p.images[0]}
            alt={`${p.brand} ${p.name}`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
        {p.oldPrice ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-paper px-2 py-0.5 text-xs font-semibold text-rose">
            −{Math.round((1 - p.price / p.oldPrice) * 100)}%
          </span>
        ) : null}
      </Link>
      <div className="absolute bottom-2.5 right-2.5">
          {p.variants ? (
            <Link
              href={href}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-paper text-ink shadow-sm transition-colors hover:bg-ink hover:text-paper"
              aria-label={`${t.catalog.choose}: ${p.name}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                add(p.slug);
                setJustAdded(true);
                setTimeout(() => setJustAdded(false), 1400);
              }}
              className={`grid size-10 shrink-0 place-items-center rounded-full shadow-sm transition-colors ${
                justAdded ? "bg-rose text-white" : "bg-ink text-paper hover:bg-rose-deep"
              }`}
              aria-label={`${t.product.add}: ${p.name}`}
            >
              {justAdded ? (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}
      </div>
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <p className="text-xs text-cocoa">{p.brand}</p>
        <h3 className="mt-0.5 text-[0.95rem] font-medium leading-snug">
          <Link href={href} className="hover:text-rose-deep">
            {p.name}
          </Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3">
          <span className="tag">
            {p.variants && new Set(p.variants.map((v) => v.price)).size > 1 ? (lang === "ru" ? "от " : "") : ""}
            {formatPrice(p.price, t.currency)}
            {p.variants && new Set(p.variants.map((v) => v.price)).size > 1 && lang === "uz" ? " dan" : ""}
          </span>
          {p.oldPrice ? <s className="text-xs text-cocoa">{formatPrice(p.oldPrice, t.currency)}</s> : null}
        </div>
      </div>
    </article>
  );
}
