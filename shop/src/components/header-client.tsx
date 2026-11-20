"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart";
import { LOCALES, type Locale } from "@/lib/i18n";

export function LangSwitch({ lang }: { lang: Locale }) {
  const pathname = usePathname() ?? `/${lang}`;
  return (
    <div className="flex rounded-full border border-line p-0.5 text-xs font-semibold" role="group" aria-label="Язык / Til">
      {LOCALES.map((l) => {
        const href = pathname.replace(/^\/(ru|uz)(?=\/|$)/, `/${l}`);
        const active = l === lang;
        return (
          <Link
            key={l}
            href={href}
            hrefLang={l}
            aria-current={active ? "true" : undefined}
            className={`rounded-full px-2 py-1.5 transition-colors sm:px-2.5 ${
              active ? "bg-ink text-paper" : "text-cocoa hover:text-ink"
            }`}
          >
            {l === "ru" ? "RU" : "O‘Z"}
          </Link>
        );
      })}
    </div>
  );
}

export function CartButton({ label }: { label: string }) {
  const { count, setOpen } = useCart();
  const [bump, setBump] = useState(false);
  const prev = useRef(count);

  useEffect(() => {
    if (count > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 340);
      prev.current = count;
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count]);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="relative flex h-10 items-center gap-2 rounded-full bg-ink pl-3 pr-3 sm:pl-3.5 sm:pr-4 text-sm font-semibold text-paper transition-colors hover:bg-rose-deep"
      aria-label={`${label}: ${count}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M9 10V6.5a3 3 0 0 1 6 0V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      <span className="hidden sm:inline">{label}</span>
      <span
        className={`min-w-5 rounded-full bg-paper px-1.5 text-center font-sans text-[0.75rem] font-bold leading-5 text-ink ${
          bump ? "bump" : ""
        }`}
      >
        {count}
      </span>
    </button>
  );
}
