"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getDetails } from "@/data/details";
import { products } from "@/data/products";
import type { Locale } from "@/lib/i18n";
import { priceLabel } from "@/lib/price";
import { Tilt } from "./tilt";

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
    .filter((p) => !p.channel && p.images[0])
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
    <section aria-labelledby="na-title" className="shell pt-16">
      <div className="na-stage panel-3d relative isolate overflow-hidden rounded-[2rem] bg-[#efe5da] px-4 py-6 sm:px-7 md:px-10 md:py-8">
        {/* фоновая надпись и мягкое свечение */}
        <span aria-hidden className="pointer-events-none absolute bottom-5 right-8 -z-10 hidden select-none font-script text-[6.5rem] leading-[1.2] text-[#e3d2bf] md:block lg:text-[8rem]">
          Nouveauté
        </span>
        <span aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 -z-10 size-[20rem] rounded-full bg-[radial-gradient(circle,rgba(201,164,104,0.35),transparent_65%)]" />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-rose-deep">
              <span aria-hidden className="pick-dot relative size-2 rounded-full bg-rose-deep" />
              {t.lead}
            </p>
            <h2 id="na-title" className="mt-1.5 font-display text-2xl font-medium sm:text-3xl">
              {t.title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-display text-lg tabular-nums text-cocoa" aria-live="polite">
              <span className="text-ink">{String(i + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </p>
            <button type="button" onClick={() => go(i - 1)} aria-label={t.prev} className="grid size-10 place-items-center rounded-full border border-ink/15 bg-paper/60 transition-colors hover:bg-ink hover:text-paper">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" onClick={() => go(i + 1)} aria-label={t.next} className="grid size-10 place-items-center rounded-full border border-ink/15 bg-paper/60 transition-colors hover:bg-ink hover:text-paper">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-6 grid items-center gap-8 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-12 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
          {/* колода: следующие две новинки выглядывают из-за текущей */}
          <Tilt className="mx-auto w-[min(78%,17rem)] md:w-full" max={10} radius="1.6rem">
          <div className="relative aspect-[4/5] w-full">
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
                  <Image src={q.images[0]} alt="" fill sizes="17rem" className="object-cover opacity-80" />
                </button>
              ) : null;
            })}
            <Link
              key={p.slug}
              href={`/${lang}/p/${p.slug}`}
              className="na-front card-3d group absolute inset-0 block overflow-hidden rounded-[1.6rem] bg-white shadow-[0_34px_60px_-30px_rgba(42,26,21,0.7)]"
            >
              <Image
                src={p.images[0]}
                alt={`${p.brand} ${p.name}`}
                fill
                sizes="(min-width: 768px) 17rem, 80vw"
                className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
              />
              <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-rose-deep backdrop-blur">
                New
              </span>
            </Link>
          </div>
          </Tilt>

          {/* текст меняется вместе с карточкой */}
          <div className="min-w-0">
          <div key={p.slug}>
            <p className="rise text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-cocoa">{p.brand}</p>
            <h3 className="rise mt-1 font-display text-2xl font-medium leading-tight tracking-[-0.01em] text-balance sm:text-[2rem]" style={{ animationDelay: "60ms" }}>
              {p.name}
            </h3>
            <p className="rise mt-3 max-w-[56ch] text-[0.95rem] leading-relaxed text-cocoa" style={{ animationDelay: "120ms" }}>
              {p.description[lang]}
            </p>
            {points.length ? (
              <ul className="mt-4 space-y-1.5 text-[0.92rem]">
                {points.map((x, k) => (
                  <li key={x} className="rise flex gap-3 leading-snug" style={{ animationDelay: `${180 + k * 70}ms` }}>
                    <span aria-hidden className="mt-[0.45em] size-1.5 shrink-0 rotate-45 bg-gold" />
                    {x}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="rise mt-5 flex flex-wrap items-center gap-x-5 gap-y-3" style={{ animationDelay: "380ms" }}>
              <span className="font-display text-[1.5rem] font-medium text-rose-deep">{priceLabel(p, lang)}</span>
              <Link href={`/${lang}/p/${p.slug}`} className="btn btn-primary">
                {t.buy}
              </Link>
            </div>
          </div>
          {/* миниатюры с таймером: полоска заполнилась — следующая новинка */}
          <ul className="mt-7 flex gap-2">
            {list.map((q, k) => (
              <li key={q.slug} className="w-14 sm:w-16">
                <button
                  type="button"
                  onClick={() => go(k)}
                  aria-current={k === i ? "true" : undefined}
                  aria-label={`${t.show}: ${q.brand} ${q.name}`}
                  className={`group block w-full text-left transition-opacity ${k === i ? "" : "opacity-55 hover:opacity-100"}`}
                >
                  <span className="relative block aspect-square overflow-hidden rounded-lg bg-white">
                    <Image src={q.images[0]} alt="" fill sizes="4rem" className="object-cover" />
                  </span>
                  <span className="mt-1.5 block h-[3px] overflow-hidden rounded-full bg-ink/10">
                    {k === i ? (
                      <span key={i} className="na-progress block h-full origin-left bg-rose-deep" onAnimationEnd={() => go(i + 1)} />
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
