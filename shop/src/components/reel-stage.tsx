"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type ReelItem = { slug: string; brand: string; name: string; image: string; price: string };

/**
 * «Новинки в движении» — компактно, в стиле Telegram: ролик в круглом «кружочке» с золотым
 * кольцом прогресса, рядом текст и кнопка, справа — свежие поступления строками с ценами.
 */
export function ReelStage({
  video,
  poster,
  items,
  lang,
  channel,
  channelHref,
  intro,
}: {
  video: string;
  poster?: string;
  items: ReelItem[];
  lang: string;
  channel: string;
  channelHref: string;
  intro: ReactNode;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [prog, setProg] = useState(0);
  const reduce = useReducedMotion();

  // кольцо вокруг «кружочка» заполняется в такт ролику
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let raf = 0;
    const tick = () => {
      if (v.duration) setProg(v.currentTime / v.duration);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const R = 48;
  const C = 2 * Math.PI * R;

  return (
    <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
      {/* кружочек */}
      <a href={channelHref} target="_blank" rel="noopener" aria-label={channel} className="group relative mx-auto block size-[min(15rem,62vw)] md:size-[14rem] lg:size-[15.5rem]">
        <svg viewBox="0 0 100 100" className="absolute -inset-[7%] size-[114%] -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(243,223,178,0.14)" strokeWidth="1.6" />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="url(#reel-ring)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray={`${C * prog} ${C}`}
          />
          <defs>
            <linearGradient id="reel-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f3dfb2" />
              <stop offset="0.5" stopColor="#c9a468" />
              <stop offset="1" stopColor="#c9828f" />
            </linearGradient>
          </defs>
        </svg>
        <motion.span
          className="absolute inset-0 block overflow-hidden rounded-full bg-black shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9),0_0_60px_-12px_rgba(201,164,104,0.35)]"
          whileHover={reduce ? undefined : { scale: 1.04 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <video
            ref={ref}
            className="size-full scale-[1.12] object-cover"
            src={video}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
        </motion.span>
        {/* подпись канала, как у видеосообщения */}
        <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-[#1b1310]/90 px-3 py-1 text-[0.72rem] font-semibold text-paper backdrop-blur">
          <span className="reel-live size-1.5 rounded-full bg-[#e2564a]" aria-hidden />
          {channel}
        </span>
      </a>

      <div className="min-w-0">{intro}</div>

      {/* свежие поступления */}
      <ul className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 md:col-span-2 lg:col-span-1 lg:grid-cols-1">
        {items.map((it) => (
          <li key={it.slug}>
            <Link
              href={`/${lang}/p/${it.slug}`}
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-1.5 pr-4 transition-colors hover:border-[#c9a468]/60 hover:bg-white/[0.1]"
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
        ))}
      </ul>
    </div>
  );
}
