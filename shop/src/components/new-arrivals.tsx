"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getDetails } from "@/data/details";
import { products } from "@/data/products";
import type { Locale } from "@/lib/i18n";
import { priceLabel } from "@/lib/price";

const COUNT = 5;

const T = {
  ru: { title: "Новинки недели", lead: "Только что приехали в магазин", buy: "Смотреть и заказать", next: "Следующая новинка", prev: "Предыдущая новинка", show: "Показать" },
  uz: { title: "Hafta yangiliklari", lead: "Do‘konga hozirgina keldi", buy: "Ko‘rish va buyurtma", next: "Keyingi yangilik", prev: "Oldingi yangilik", show: "Ko‘rsatish" },
} as const;

/**
 * «Новинки недели»: пять последних товаров из канала.
 * Фото — колода карт (следующие выглядывают сзади), смена сама каждые 6 с;
 * полоска на миниатюре — таймер, при наведении он замирает. При «уменьшить движение» — без автосмены.
 */
export function NewArrivals({ lang }: { lang: Locale }) {
  const t = T[lang];
  const list = products
    .filter((p) => !p.boutique && !p.channel && p.images[0])
    .sort((a, b) => b.post - a.post)
    .slice(0, COUNT);
  const [i, setI] = useState(0);
  if (!list.length) return null;
  const n = list.length;
  const go = (k: number) => setI((k + n) % n);
  const p = list[i];
  const d = getDetails(p.slug);
  const points = d?.kind === "care" ? d.points[lang].slice(0, 3) : [];

  return (
    <section aria-labelledby="na-title" className="shell pt-20">
      <div className="na-stage relative isolate overflow-hidden rounded-[2rem] bg-[#efe5da] px-4 py-8 sm:px-8 md:px-12 md:py-12">
        {/* фоновая надпись и мягкое свечение */}
        <span aria-hidden className="pointer-events-none absolute -right-6 -top-10 -z-10 select-none font-script text-[9rem] leading-none text-[#e3d2bf] sm:text-[13rem]">
          Nouveauté
        </span>
        <span aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 -z-10 size-[26rem] rounded-full bg-[radial-gradient(circle,rgba(201,164,104,0.35),transparent_65%)]" />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-rose-deep">
              <span aria-hidden className="pick-dot relative size-2 rounded-full bg-rose-deep" />
              {t.lead}
            </p>
            <h2 id="na-title" className="mt-2 font-display text-3xl font-medium sm:text-4xl">
              {t.title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-display text-lg tabular-nums text-cocoa" aria-live="polite">
              <span className="text-ink">{String(i + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </p>
            <button type="button" onClick={() => go(i - 1)} aria-label={t.prev} className="grid size-11 place-items-center rounded-full border border-ink/15 bg-paper/60 transition-colors hover:bg-ink hover:text-paper">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" onClick={() => go(i + 1)} aria-label={t.next} className="grid size-11 place-items-center rounded-full border border-ink/15 bg-paper/60 transition-colors hover:bg-ink hover:text-paper">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-8 grid items-center gap-10 md:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] md:gap-14 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
          {/* колода: следующие две новинки выглядывают из-за текущей */}
          <div className="relative mx-auto aspect-[4/5] w-[min(100%,24rem)] md:w-full">
            {[2, 1].map((off) => {
              const q = list[(i + off) % n];
              return n > off ? (
                <button
                  key={`${q.slug}-${off}`}
                  type="button"
                  onClick={() => go(i + off)}
                  aria-label={`${t.show}: ${q.brand} ${q.name}`}
                  className={`na-back absolute inset-0 overflow-hidden rounded-[1.6rem] bg-white shadow-[0_20px_40px_-25px_rgba(42,26,21,0.6)] na-back-${off}`}
                >
                  <Image src={q.images[0]} alt="" fill sizes="24rem" className="object-cover opacity-80" />
                </button>
              ) : null;
            })}
            <Link
              key={p.slug}
              href={`/${lang}/p/${p.slug}`}
              className="na-front group absolute inset-0 block overflow-hidden rounded-[1.6rem] bg-white shadow-[0_34px_60px_-30px_rgba(42,26,21,0.7)]"
            >
              <Image
                src={p.images[0]}
                alt={`${p.brand} ${p.name}`}
                fill
                sizes="(min-width: 768px) 28rem, 90vw"
                className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
              />
              <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-rose-deep backdrop-blur">
                New
              </span>
            </Link>
          </div>

          {/* текст меняется вместе с карточкой */}
          <div key={p.slug} className="min-w-0">
            <p className="rise text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-cocoa">{p.brand}</p>
            <h3 className="rise mt-1 font-display text-3xl font-medium leading-tight tracking-[-0.01em] text-balance sm:text-[2.6rem]" style={{ animationDelay: "60ms" }}>
              {p.name}
            </h3>
            <p className="rise mt-4 max-w-[54ch] leading-relaxed text-cocoa" style={{ animationDelay: "120ms" }}>
              {p.description[lang]}
            </p>
            {points.length ? (
              <ul className="mt-5 space-y-2">
                {points.map((x, k) => (
                  <li key={x} className="rise flex gap-3 leading-snug" style={{ animationDelay: `${180 + k * 70}ms` }}>
                    <span aria-hidden className="mt-[0.45em] size-1.5 shrink-0 rotate-45 bg-gold" />
                    {x}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="rise mt-7 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ animationDelay: "380ms" }}>
              <span className="font-display text-[1.9rem] font-medium text-rose-deep">{priceLabel(p, lang)}</span>
              <Link href={`/${lang}/p/${p.slug}`} className="btn btn-primary">
                {t.buy}
              </Link>
            </div>
          </div>
        </div>

        {/* миниатюры с таймером: полоска заполнилась — следующая новинка */}
        <ul className="mt-10 grid grid-cols-5 gap-2 sm:gap-3">
          {list.map((q, k) => (
            <li key={q.slug}>
              <button
                type="button"
                onClick={() => go(k)}
                aria-current={k === i ? "true" : undefined}
                aria-label={`${t.show}: ${q.brand} ${q.name}`}
                className={`group block w-full text-left transition-opacity ${k === i ? "" : "opacity-55 hover:opacity-100"}`}
              >
                <span className="relative block aspect-square overflow-hidden rounded-xl bg-white sm:aspect-[5/4]">
                  <Image src={q.images[0]} alt="" fill sizes="(min-width: 640px) 12rem, 18vw" className="object-cover" />
                </span>
                <span className="mt-2 block h-[3px] overflow-hidden rounded-full bg-ink/10">
                  {k === i ? (
                    <span key={i} className="na-progress block h-full origin-left bg-rose-deep" onAnimationEnd={() => go(i + 1)} />
                  ) : null}
                </span>
                <span className="mt-1.5 hidden truncate text-xs text-cocoa sm:block">{q.brand}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
