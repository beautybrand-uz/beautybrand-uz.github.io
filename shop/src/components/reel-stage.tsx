"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type ReelItem = { slug: string; brand: string; name: string; image: string; price: string };

const SLIDE_MS = 3200;

/**
 * «Новинки в движении» — для парфюмерии: ароматы бутика сменяются в круглом «кружочке»
 * (как видеосообщение Telegram, золотое кольцо — таймер до следующего), рядом текст,
 * справа — все ароматы списком, который листается вниз. Наведение на аромат показывает его в кружке.
 */
export function ReelStage({
  items,
  lang,
  channel,
  channelHref,
  intro,
}: {
  items: ReelItem[];
  lang: string;
  channel: string;
  channelHref: string;
  intro: ReactNode;
}) {
  const [i, setI] = useState(0);
  const [t, setT] = useState(0); // 0..1 — сколько прошло до следующего аромата
  const [hold, setHold] = useState(false);
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const n = items.length;

  // таймер слайдов: кольцо заполняется, затем следующий аромат
  useEffect(() => {
    if (!n || hold || reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = (now - start) / SLIDE_MS;
      if (p >= 1) {
        setT(0);
        setI((k) => (k + 1) % n);
        return;
      }
      setT(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i, hold, reduce, n]);

  // текущий аромат виден в списке (прокручиваем только сам список, не страницу)
  useEffect(() => {
    const ul = listRef.current;
    const li = ul?.children[i] as HTMLElement | undefined;
    if (!ul || !li || hold) return;
    ul.scrollTo({ top: li.offsetTop - ul.clientHeight / 2 + li.clientHeight / 2, behavior: reduce ? "auto" : "smooth" });
  }, [i, hold, reduce]);

  if (!n) return null;
  const cur = items[i];
  const R = 48;
  const C = 2 * Math.PI * R;
  const show = (k: number) => {
    setHold(true);
    setI(k);
    setT(0);
  };

  return (
    <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
      {/* кружочек с ароматом */}
      <div className="relative mx-auto size-[min(15rem,62vw)] md:size-[14rem] lg:size-[15.5rem]">
        <svg viewBox="0 0 100 100" className="absolute -inset-[7%] size-[114%] -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(243,223,178,0.14)" strokeWidth="1.6" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="url(#reel-ring)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray={`${C * t} ${C}`} />
          <defs>
            <linearGradient id="reel-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f3dfb2" />
              <stop offset="0.5" stopColor="#c9a468" />
              <stop offset="1" stopColor="#c9828f" />
            </linearGradient>
          </defs>
        </svg>
        <Link
          href={`/${lang}/p/${cur.slug}`}
          aria-label={`${cur.brand} ${cur.name}`}
          className="group absolute inset-0 block overflow-hidden rounded-full bg-[#120c0a] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9),0_0_60px_-12px_rgba(201,164,104,0.35)] transition-transform duration-500 hover:scale-[1.03]"
        >
          <AnimatePresence initial={false}>
            <motion.span
              key={cur.slug}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.12 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image src={cur.image} alt="" fill sizes="16rem" className="object-cover" />
            </motion.span>
          </AnimatePresence>
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.16),transparent_45%),linear-gradient(180deg,transparent_52%,rgba(0,0,0,0.6))]" />
          <span className="absolute inset-x-7 bottom-8 text-center text-paper">
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#f3dfb2]">{cur.brand}</span>
            <span className="block truncate text-[0.88rem] font-medium">{cur.name}</span>
          </span>
        </Link>
        <a
          href={channelHref}
          target="_blank"
          rel="noopener"
          className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-[#1b1310]/90 px-3 py-1 text-[0.72rem] font-semibold text-paper backdrop-blur hover:text-[#f3dfb2]"
        >
          <span className="reel-live size-1.5 rounded-full bg-[#e2564a]" aria-hidden />
          {channel}
        </a>
      </div>

      <div className="min-w-0">{intro}</div>

      {/* ароматы: список листается вниз, текущий подсвечен */}
      <div className="relative min-w-0 md:col-span-2 lg:col-span-1">
        <ul
          ref={listRef}
          onMouseLeave={() => setHold(false)}
          className="reel-list grid max-h-[17.5rem] grid-cols-1 gap-2 overflow-y-auto overscroll-contain pr-1.5 [mask-image:linear-gradient(180deg,transparent,#000_4%,#000_88%,transparent)]"
        >
          {items.map((it, k) => {
            const on = k === i;
            return (
              <li key={it.slug}>
                <Link
                  href={`/${lang}/p/${it.slug}`}
                  onMouseEnter={() => show(k)}
                  onFocus={() => show(k)}
                  onBlur={() => setHold(false)}
                  aria-current={on ? "true" : undefined}
                  className={`group flex items-center gap-3 rounded-2xl border p-1.5 pr-4 transition-colors ${
                    on ? "border-[#c9a468]/70 bg-white/[0.12]" : "border-white/10 bg-white/[0.05] hover:bg-white/[0.1]"
                  }`}
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-white">
                    <Image src={it.image} alt="" fill sizes="48px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-paper/55">{it.brand}</span>
                    <span className="block truncate text-[0.88rem] font-medium text-paper">{it.name}</span>
                  </span>
                  <span className="shrink-0 text-[0.82rem] font-semibold text-[#f3dfb2]">{it.price}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 flex items-center gap-1.5 text-[0.72rem] text-paper/45">
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14m-5-5 5 5 5-5" />
          </svg>
          {lang === "ru" ? `Листайте вниз — ${n} ароматов` : `Pastga suring — ${n} ta atir`}
        </p>
      </div>
    </div>
  );
}
