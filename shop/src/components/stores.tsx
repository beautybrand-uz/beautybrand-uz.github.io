"use client";

import { useEffect, useState } from "react";
import { OpenBadge } from "./contact";
import { getDict, type Locale } from "@/lib/i18n";
import { hoursFor } from "@/lib/site";

/* ——— Магазины и часы работы в стиле палетки ——— */

const PIN = "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z";
// оттенки «палетки» по дням недели (с понедельника); воскресенье — золотистый, у него другие часы
const DAY_SHADES = ["#efdcd1", "#e8cfc2", "#e1c2b3", "#d9b5a4", "#d1a896", "#c99b88", "#e6c49a"];

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** Время Ташкента (UTC+5), обновляется раз в минуту */
function useOpenState() {
  const [now, setNow] = useState<{ day: number; minutes: number } | null>(null);
  useEffect(() => {
    const read = () => {
      const d = new Date(Date.now() + 5 * 3600_000);
      setNow({ day: d.getUTCDay(), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() });
    };
    read();
    const id = setInterval(read, 60_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  const today = hoursFor(now.day);
  const isOpen = now.minutes >= toMin(today.open) && now.minutes < toMin(today.close);
  const next = now.minutes < toMin(today.open) ? today.open : hoursFor((now.day + 1) % 7).open;
  return { isOpen, today, next, day: now.day };
}

type Store = { id: string; name: Record<Locale, string>; address: Record<Locale, string>; map: string; route: string };

export function StoreCompacts({ lang, stores }: { lang: Locale; stores: Store[] }) {
  const t = getDict(lang).contact;
  const st = useOpenState();
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {stores.map((s) => (
        <li key={s.id} className="compact relative flex flex-col gap-4 overflow-hidden rounded-[1.75rem] p-5">
          <div className="flex items-start gap-4">
            {/* код магазина — в золотой таблетке теней */}
            <span className="pan grid size-16 shrink-0 place-items-center rounded-full font-display text-xl font-semibold text-[#4a3214]">
              {s.name[lang]}
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-[0.95rem] font-medium leading-snug">{s.address[lang]}</p>
              {st ? (
                <p className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold ${st.isOpen ? "text-[#2f6b3a]" : "text-cocoa"}`}>
                  <span className={`size-1.5 rounded-full ${st.isOpen ? "bg-[#3f8f4d]" : "bg-cocoa/60"}`} aria-hidden />
                  {st.isOpen ? `${t.open} · ${st.today.open}–${st.today.close}` : `${t.closed} · ${t.opensAt(st.next)}`}
                </p>
              ) : (
                <span className="mt-1.5 block h-4" aria-hidden />
              )}
            </div>
          </div>
          <div className="mt-auto flex gap-2">
            <a
              href={s.map}
              target="_blank"
              rel="noopener"
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-line bg-white/70 text-sm font-semibold transition-colors hover:border-ink"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d={PIN} stroke="currentColor" strokeWidth="1.7" />
                <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.7" />
              </svg>
              {t.map}
            </a>
            <a
              href={s.route}
              target="_blank"
              rel="noopener"
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink text-sm font-semibold text-paper transition-colors hover:bg-rose-deep"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 19 19 5m0 0h-9m9 0v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t.route}
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Часы работы — ряд из семи «оттенков» палетки; сегодняшний день обведён золотом */
export function WeekPalette({ lang }: { lang: Locale }) {
  const t = getDict(lang).contact;
  const st = useOpenState();
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div className="compact rounded-[1.75rem] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-lg">{t.hours}</p>
        <OpenBadge lang={lang} />
      </div>
      <ol className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
        {order.map((d, i) => {
          const h = hoursFor(d);
          const today = st?.day === d;
          return (
            <li
              key={d}
              aria-current={today ? "date" : undefined}
              className={`flex flex-col items-center gap-1 rounded-2xl px-0.5 pb-2.5 pt-2 text-center ${today ? "ring-2 ring-gold ring-offset-2 ring-offset-[#f6eee6]" : ""}`}
              style={{ background: DAY_SHADES[i] }}
            >
              <span className={`text-[0.72rem] ${today ? "font-bold text-ink" : "font-semibold text-ink/75"}`}>{t.days[d]}</span>
              <span className="text-[0.62rem] leading-tight text-ink/80 tabular-nums sm:text-[0.7rem]">
                {h.open}
                <br />
                {h.close}
              </span>
              {today ? <span className="text-[0.55rem] font-bold uppercase tracking-wide text-rose-deep">{t.today}</span> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
