"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type ReelItem = { slug: string; brand: string; name: string; image: string; price: string };

/** Где парит каждая карточка вокруг сторис, её наклон и «глубина» для параллакса */
const SPOTS = [
  { cls: "left-[2%] top-[6%]", rotate: -7, depth: 1.3 },
  { cls: "left-[9%] bottom-[8%]", rotate: 5, depth: 0.8 },
  { cls: "right-[4%] top-[12%]", rotate: 6, depth: 1 },
  { cls: "right-[1%] bottom-[4%]", rotate: -4, depth: 1.5 },
];

/**
 * Сцена «Новинки в движении»: большая сторис с роликом (полоски прогресса идут в такт видео,
 * по одной на товар) и парящие вокруг карточки свежих поступлений с параллаксом за мышкой.
 */
export function ReelStage({
  video,
  poster,
  items,
  lang,
  segments,
  channel,
  channelHref,
  watch,
  now,
}: {
  video: string;
  poster?: string;
  items: ReelItem[];
  lang: string;
  segments: number;
  channel: string;
  channelHref: string;
  watch: string;
  now: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [prog, setProg] = useState(0);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 18 });
  const sy = useSpring(my, { stiffness: 80, damping: 18 });

  // полоски сторис: плавно, по кадрам, пока ролик играет
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

  return (
    <div
      className="relative mx-auto mt-12 w-full max-w-[72rem] lg:h-[min(46rem,84vh)]"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {/* сторис */}
      <motion.div
        style={{ x: useTransform(sx, (v) => v * -14), y: useTransform(sy, (v) => v * -10) }}
        className="relative z-10 mx-auto aspect-[9/16] w-[min(23rem,82vw)] overflow-hidden rounded-[2rem] bg-black shadow-[0_60px_100px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08),0_0_80px_-20px_rgba(201,164,104,0.35)] lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:h-full lg:w-auto"
      >
        <video
          ref={ref}
          className="absolute inset-0 size-full object-cover"
          src={video}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={channel}
        />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/60 to-transparent" />

        {/* полоски прогресса */}
        <div className="absolute inset-x-3 top-3 flex gap-1" aria-hidden>
          {Array.from({ length: segments }, (_, i) => (
            <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
              <span className="block h-full origin-left bg-white" style={{ transform: `scaleX(${Math.min(1, Math.max(0, prog * segments - i))})` }} />
            </span>
          ))}
        </div>
        {/* шапка сторис */}
        <a href={channelHref} target="_blank" rel="noopener" className="absolute left-3 top-6 flex items-center gap-2 text-white">
          <span className="grid size-9 place-items-center rounded-full bg-[conic-gradient(from_200deg,#f3dfb2,#c9828f,#a84c5c,#c9a468,#f3dfb2)] p-[2px]">
            <span className="grid size-full place-items-center rounded-full bg-[#1b1310] font-script text-[0.95rem] text-[#f3dfb2]">B</span>
          </span>
          <span className="leading-tight">
            <span className="block text-[0.82rem] font-semibold">{channel}</span>
            <span className="block text-[0.7rem] text-white/70">{now}</span>
          </span>
        </a>
      </motion.div>

      {/* парящие карточки: вокруг сторис на компьютере, лентой под ней на телефоне */}
      <ul className="mt-8 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] lg:mt-0 lg:block lg:overflow-visible lg:pb-0">
        {items.slice(0, SPOTS.length).map((it, i) => (
          <FloatCard key={it.slug} it={it} lang={lang} spot={SPOTS[i]} sx={sx} sy={sy} delay={i * 0.8} />
        ))}
      </ul>
    </div>
  );
}

function FloatCard({
  it,
  lang,
  spot,
  sx,
  sy,
  delay,
}: {
  it: ReelItem;
  lang: string;
  spot: (typeof SPOTS)[number];
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  delay: number;
}) {
  const x = useTransform(sx, (v) => v * 60 * spot.depth);
  const y = useTransform(sy, (v) => v * 46 * spot.depth);
  return (
    <motion.li
      style={{ x, y, ["--r" as string]: `${spot.rotate}deg` }}
      className={`w-[11.5rem] shrink-0 snap-start lg:absolute lg:w-[13.5rem] lg:[rotate:var(--r)] ${spot.cls}`}
    >
      <Link
        href={`/${lang}/p/${it.slug}`}
        className="reel-float group block rounded-[1.4rem] border border-white/15 bg-white/[0.08] p-2 shadow-[0_30px_50px_-30px_rgba(0,0,0,0.9)] backdrop-blur-md transition-colors hover:border-[#c9a468]/70 hover:bg-white/[0.14]"
        style={{ animationDelay: `${delay}s` }}
      >
        <span className="relative block aspect-[4/5] overflow-hidden rounded-[1rem] bg-white">
          <Image src={it.image} alt="" fill sizes="14rem" className="object-cover transition-transform duration-700 group-hover:scale-110" />
          <span className="absolute bottom-2 left-2 rounded-full bg-[#1b1310]/85 px-2.5 py-1 text-[0.75rem] font-semibold text-[#f3dfb2] backdrop-blur">
            {it.price}
          </span>
        </span>
        <span className="block px-1.5 pb-1 pt-2.5">
          <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-paper/55">{it.brand}</span>
          <span className="block truncate text-[0.86rem] font-medium text-paper">{it.name}</span>
        </span>
      </Link>
    </motion.li>
  );
}
