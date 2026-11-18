"use client";

import { useEffect, useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";
import { PHONE, hoursFor } from "@/lib/site";

/** Текущее время в Ташкенте (UTC+5) — независимо от часового пояса посетителя */
function tashkentNow() {
  const d = new Date(Date.now() + 5 * 3600_000);
  return { day: d.getUTCDay(), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() };
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function useNow() {
  const [now, setNow] = useState<ReturnType<typeof tashkentNow> | null>(null);
  useEffect(() => {
    setNow(tashkentNow());
    const id = setInterval(() => setNow(tashkentNow()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function OpenBadge({ lang }: { lang: Locale }) {
  const t = getDict(lang).contact;
  const now = useNow();
  if (!now) return <span className="inline-block h-7" aria-hidden />;
  const today = hoursFor(now.day);
  const isOpen = now.minutes >= toMin(today.open) && now.minutes < toMin(today.close);
  const next = now.minutes < toMin(today.open) ? today.open : hoursFor((now.day + 1) % 7).open;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
        isOpen ? "bg-[#e3efe2] text-[#2f6b3a]" : "bg-well text-cocoa"
      }`}
    >
      <span className={`size-2 rounded-full ${isOpen ? "bg-[#3f8f4d]" : "bg-cocoa/60"}`} aria-hidden />
      {isOpen ? `${t.open} · ${today.open}–${today.close}` : `${t.closed} · ${t.opensAt(next)}`}
    </span>
  );
}

export function HoursCard({ lang }: { lang: Locale }) {
  const t = getDict(lang).contact;
  const now = useNow();
  // неделя с понедельника
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-lg font-medium">{t.hours}</p>
        <OpenBadge lang={lang} />
      </div>
      <ul className="mt-4 space-y-1.5 text-[0.95rem]">
        {order.map((d) => {
          const h = hoursFor(d);
          const today = now?.day === d;
          return (
            <li key={d} className={`flex justify-between ${today ? "font-semibold text-ink" : "text-cocoa"}`}>
              <span>{t.days[d]}</span>
              <span className="tabular-nums">{t.daily(h.open, h.close)}</span>
            </li>
          );
        })}
      </ul>
      <a href={`tel:${PHONE.tel}`} className="btn btn-primary mt-5 w-full">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        {t.call}: {PHONE.display}
      </a>
    </div>
  );
}
