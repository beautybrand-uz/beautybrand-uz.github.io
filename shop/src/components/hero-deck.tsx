"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { products } from "@/data/products";
import type { Locale } from "@/lib/i18n";
import { priceLabel } from "@/lib/price";
import { Tilt } from "./tilt";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Бестселлеры в колоде — по одному из каждого мира: лицо, волосы, губы, парфюм, пудра */
const SLUGS = [
  "dior-glow-stick-012-rosewood",
  "kerastase-genesis-anti-chute-serum",
  "tom-ford-tobacco-vanille",
  "armani-blush-balm-05",
  "charlotte-tilbury-loose-setting-powder",
];
const VISIBLE = 3;
const AUTO_MS = 5000;

const T = {
  ru: { hit: "Хит", hint: "Смахните карточку", prev: "Предыдущий хит", next: "Следующий хит", go: "Показать хит", label: "Хиты магазина" },
  uz: { hit: "Xit", hint: "Kartani suring", prev: "Oldingi xit", next: "Keyingi xit", go: "Xitni ko‘rsatish", label: "Do‘kon xitlari" },
} as const;

type Exit = { side: number; top: boolean };

/**
 * Первый экран: колода хитов. Верхнюю карточку можно смахнуть (мышь/палец), листать стрелками
 * и точками; сама переворачивается каждые 5 с, пока на неё не навели. Вертикальная прокрутка
 * на телефоне не блокируется (touch-action: pan-y).
 */
export function HeroDeck({ lang }: { lang: Locale }) {
  const t = T[lang];
  const list = SLUGS.map((s) => products.find((p) => p.slug === s)).filter((p) => p !== undefined);
  const n = list.length;
  const [i, setI] = useState(0);
  const [exit, setExit] = useState<Exit>({ side: -1, top: true });
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  const step = (d: number, side = -d) => {
    setExit({ side, top: d > 0 });
    setI((k) => (k + d + n) % n);
  };

  useEffect(() => {
    if (paused || reduce || n < 2) return;
    const id = setTimeout(() => step(1), AUTO_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused, reduce, n]);

  if (!n) return null;
  const shown = Array.from({ length: Math.min(VISIBLE, n) }, (_, d) => ({ p: list[(i + d) % n], depth: d }));

  return (
    <div
      className="rise-image relative order-1 mx-auto flex w-full max-w-[30rem] flex-col items-center px-6 pb-2 pt-4 sm:px-10 lg:order-2 lg:max-w-none lg:self-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* фон: тёплое свечение и размытый натюрморт */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[6%] bottom-[14%] -z-10">
        <div className="absolute left-1/2 top-1/2 size-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,180,184,0.55),rgba(201,164,104,0.25)_45%,transparent_70%)]" />
        <Image src={`${BASE}/brand/hero/stilllife.webp`} alt="" fill sizes="40vw" className="deck-glow rounded-[3rem] object-cover opacity-45 blur-2xl" />
      </div>

      <Tilt className="w-[min(100%,23rem)] lg:w-[min(100%,calc((100svh-15rem)*0.8),26rem)]" max={6} lift={1.01} radius="1.8rem">
      <section aria-roledescription="carousel" aria-label={t.label} className="relative aspect-[4/5] w-full">
        <AnimatePresence initial={false} custom={exit}>
          {shown
            .slice()
            .reverse()
            .map(({ p, depth }) => (
              <DeckCard
                key={p.slug}
                depth={depth}
                lang={lang}
                hit={t.hit}
                slug={p.slug}
                brand={p.brand}
                name={p.name}
                price={priceLabel(p, lang)}
                image={p.images[0]}
                onSwipe={(side) => step(1, side)}
                reduce={!!reduce}
              />
            ))}
        </AnimatePresence>
      </section>
      </Tilt>

      {/* управление без перетаскивания: стрелки и точки */}
      <div className="mt-6 flex items-center gap-4">
        <button type="button" onClick={() => step(-1)} aria-label={t.prev} className="grid size-11 place-items-center rounded-full border border-ink/15 bg-paper/70 backdrop-blur transition-colors hover:bg-ink hover:text-paper">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5">
          {list.map((p, k) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => k !== i && step(k - i > 0 ? k - i : k - i + n)}
              aria-label={`${t.go}: ${p.brand} ${p.name}`}
              aria-current={k === i ? "true" : undefined}
              className="grid h-6 place-items-center px-0.5"
            >
              <span className={`block h-1.5 rounded-full transition-all duration-500 ${k === i ? "w-6 bg-rose-deep" : "w-1.5 bg-ink/25"}`} />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => step(1)} aria-label={t.next} className="grid size-11 place-items-center rounded-full border border-ink/15 bg-paper/70 backdrop-blur transition-colors hover:bg-ink hover:text-paper">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-cocoa">
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden className="deck-hint" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-.5a6 6 0 0 1-4.7-2.3L5 15.5a1.6 1.6 0 0 1 2.4-2.1L9 15" />
        </svg>
        {t.hint}
      </p>
      <p className="sr-only" aria-live="polite">
        {list[i].brand} {list[i].name}
      </p>
    </div>
  );
}

/** Положение карточки в колоде: верхняя ровно, остальные чуть ниже, меньше и с наклоном */
const pose = (depth: number) => ({
  x: depth * 26,
  y: depth * 12,
  scale: 1 - depth * 0.05,
  rotate: depth === 0 ? 0 : depth % 2 ? 6 : 11,
  opacity: 1 - depth * 0.12,
});

function DeckCard(props: {
  depth: number;
  lang: Locale;
  hit: string;
  slug: string;
  brand: string;
  name: string;
  price: string;
  image: string;
  onSwipe: (side: number) => void;
  reduce: boolean;
}) {
  const { depth, lang, hit, slug, brand, name, price, image, onSwipe, reduce } = props;
  const top = depth === 0;
  const x = useMotionValue(0);
  const tilt = useTransform(x, [-220, 220], [-16, 16]);
  const dragged = useRef(false);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const far = Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 600;
    if (far) onSwipe(Math.sign(info.offset.x || info.velocity.x));
    setTimeout(() => (dragged.current = false), 0);
  };

  return (
    <motion.div
      variants={{
        exit: (e: Exit) =>
          e.top
            ? { x: e.side * 520, y: 40, rotate: e.side * 24, opacity: 0, transition: { duration: reduce ? 0 : 0.45, ease: [0.4, 0, 0.2, 1] } }
            : { opacity: 0, scale: 0.8, transition: { duration: reduce ? 0 : 0.3 } },
      }}
      initial={{ ...pose(VISIBLE), opacity: 0 }}
      animate={pose(depth)}
      exit="exit"
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
      style={top ? { x, rotate: tilt, zIndex: 10, touchAction: "pan-y" } : { zIndex: 10 - depth }}
      drag={top && !reduce ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragStart={() => (dragged.current = true)}
      onDragEnd={onDragEnd}
      whileDrag={{ cursor: "grabbing", scale: 1.02 }}
      aria-hidden={!top}
      className={`absolute inset-0 ${top ? "cursor-grab" : "pointer-events-none"}`}
    >
      <Link
        href={`/${lang}/p/${slug}`}
        tabIndex={top ? 0 : -1}
        draggable={false}
        onClick={(e) => dragged.current && e.preventDefault()}
        className="card-3d relative flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-white/80 bg-white p-2.5 shadow-[0_30px_60px_-28px_rgba(42,26,21,0.55)]"
      >
        <span className="relative block min-h-0 flex-1 overflow-hidden rounded-[1.35rem] bg-well">
          <Image src={image} alt={`${brand} ${name}`} fill priority={depth === 0} sizes="(min-width: 1024px) 26rem, 80vw" draggable={false} className="pointer-events-none select-none object-cover" />
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/85 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-paper backdrop-blur">
            <span aria-hidden className="size-1.5 rounded-full bg-[#f3dfb2]" />
            {hit}
          </span>
        </span>
        <span className="flex items-end justify-between gap-3 px-2 pb-1.5 pt-3.5">
          <span className="min-w-0">
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cocoa">{brand}</span>
            <span className="mt-0.5 line-clamp-2 block text-[1.05rem] font-semibold leading-tight tracking-[-0.01em]">{name}</span>
          </span>
          <span className="shrink-0 rounded-full bg-[#f6ede4] px-3 py-1.5 text-sm font-semibold text-rose-deep">{price}</span>
        </span>
      </Link>
    </motion.div>
  );
}
