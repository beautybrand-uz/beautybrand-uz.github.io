"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductCard } from "./catalog";
import { MOODS, MOOD_OF, type Mood } from "@/data/moods";
import { products } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * «Найдите свой аромат»: четыре настроения-карточки. Выбрали — под ними раскрываются подходящие ароматы.
 * Нажали ещё раз — свернулось.
 */
export function MoodFinder({ lang, images }: { lang: Locale; images: Partial<Record<Mood, boolean>> }) {
  const t = getDict(lang).maison;
  const [mood, setMood] = useState<Mood | null>(null);
  const list = mood ? products.filter((p) => p.boutique && MOOD_OF[p.slug] === mood) : [];

  return (
    <section className="shell pt-16" aria-labelledby="mood-title">
      <h2 id="mood-title" className="font-display text-3xl font-medium sm:text-4xl">
        {t.moodTitle}
      </h2>
      <p className="mt-2 max-w-[60ch] text-cocoa">{t.moodLead}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" role="group" aria-label={t.moodTitle}>
        {MOODS.map((m) => {
          const active = mood === m;
          const dim = mood !== null && !active;
          const fallback = products.find((p) => p.boutique && MOOD_OF[p.slug] === m)?.images[0] ?? "";
          return (
            <button
              key={m}
              type="button"
              aria-pressed={active}
              onClick={() => setMood(active ? null : m)}
              className={`mood-card group relative aspect-[3/4] overflow-hidden rounded-[1.6rem] text-left transition-[transform,opacity,filter] duration-500 ${
                active ? "mood-active" : ""
              } ${dim ? "opacity-55 saturate-[0.6]" : ""}`}
            >
              <Image
                src={images[m] ? `${BASE}/brand/moods/${m}.webp` : fallback}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
              />
              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,18,15,0)_35%,rgba(27,18,15,0.82)_100%)]" />
              <span className="absolute inset-x-0 bottom-0 p-4 text-paper sm:p-6">
                <span className="block font-script text-[2.3rem] leading-none text-[#f3dfb2] sm:text-[3rem]">{t.moods[m][0]}</span>
                <span className="mt-2 block text-[0.8rem] leading-snug text-paper/80 sm:text-sm">{t.moods[m][1]}</span>
              </span>
              <span
                aria-hidden
                className={`absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-paper/40 text-paper transition-colors ${
                  active ? "bg-[#f3dfb2] text-[#1b120f]" : "bg-black/20 backdrop-blur-sm"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24">
                  {active ? (
                    <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  ) : (
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  )}
                </svg>
              </span>
            </button>
          );
        })}
      </div>

      <div className={`mood-results grid transition-[grid-template-rows] duration-500 ${mood ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          {mood ? (
            <div key={mood} className="pt-10">
              <p className="text-sm text-cocoa">
                {t.moods[mood][0]} · {t.count(list.length)}
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
                {list.map((p, i) => (
                  <li key={p.slug} className="rise" style={{ animationDelay: `${i * 60}ms` }}>
                    <ProductCard p={p} lang={lang} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
