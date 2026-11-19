"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Лента брендов в два ряда: листается пальцем (с «прилипанием» к колонкам),
 * колесом/тачпадом и стрелками по бокам. Стрелки гаснут у краёв
 * и прячутся совсем, если всё и так помещается.
 */
export function BrandScroller({ children, prevLabel, nextLabel }: { children: React.ReactNode; prevLabel: string; nextLabel: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  const scrollable = !(edge.start && edge.end);

  const Arrow = ({ dir, disabled, label }: { dir: 1 | -1; disabled: boolean; label: string }) => (
    <button
      type="button"
      onClick={() => go(dir)}
      disabled={disabled}
      aria-label={label}
      className={`absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper text-ink shadow-[0_8px_20px_-10px_rgba(42,26,21,0.45)] transition-[opacity,background-color,color] hover:border-ink hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-0 sm:grid ${
        dir < 0 ? "-left-5" : "-right-5"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className={dir < 0 ? "rotate-180" : ""}>
        <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  return (
    <div className="relative mt-6">
      <ul
        ref={ref}
        className="brand-rail -mx-4 grid snap-x snap-mandatory scroll-px-4 auto-cols-[calc((100%-1rem)/2.4)] grid-flow-col grid-rows-2 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:auto-cols-[calc((100%-3rem)/4.4)] sm:scroll-px-0 sm:gap-3 sm:px-0"
      >
        {children}
      </ul>
      {/* мягкое затухание у края, за которым ещё есть логотипы */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 -left-4 w-8 bg-gradient-to-r from-paper to-transparent transition-opacity sm:left-0 ${
          edge.start ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 -right-4 w-8 bg-gradient-to-l from-paper to-transparent transition-opacity sm:right-0 ${
          edge.end ? "opacity-0" : "opacity-100"
        }`}
      />
      {scrollable ? (
        <>
          <Arrow dir={-1} disabled={edge.start} label={prevLabel} />
          <Arrow dir={1} disabled={edge.end} label={nextLabel} />
        </>
      ) : null}
    </div>
  );
}
