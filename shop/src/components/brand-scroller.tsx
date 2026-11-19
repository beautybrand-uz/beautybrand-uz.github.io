"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Горизонтальная лента: листается пальцем (с «прилипанием» к карточкам),
 * колесом/тачпадом и стрелками на компьютере. Стрелки гаснут у краёв.
 */
export function BrandScroller({ children, prevLabel, nextLabel }: { children: React.ReactNode; prevLabel: string; nextLabel: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  const Arrow = ({ dir, disabled, label }: { dir: 1 | -1; disabled: boolean; label: string }) => (
    <button
      type="button"
      onClick={() => go(dir)}
      disabled={disabled}
      aria-label={label}
      className="hidden size-10 place-items-center rounded-full border border-line bg-white/80 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-30 sm:grid"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className={dir < 0 ? "rotate-180" : ""}>
        <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  return (
    <div className="mt-6">
      <div className="relative">
        <ul
          ref={ref}
          className="brand-rail -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:scroll-px-0 sm:gap-3 sm:px-0"
        >
          {children}
        </ul>
        {/* мягкое затухание у края, где ещё есть карточки */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-paper to-transparent transition-opacity ${
            edge.end ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
      <div className="mt-4 hidden justify-end gap-2 sm:flex">
        <Arrow dir={-1} disabled={edge.start} label={prevLabel} />
        <Arrow dir={1} disabled={edge.end} label={nextLabel} />
      </div>
    </div>
  );
}
