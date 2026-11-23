"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SwatchName } from "./swatch";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Item = { href: string; label: string; swatch: SwatchName; external?: boolean; match?: string };

/**
 * Меню-палетка: у каждого пункта свой свотч. При наведении он «прокрашивается» под словом
 * слева направо, у текущей страницы остаётся.
 */
export function NavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname() ?? "";
  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label="Разделы">
      {items.map((it) => {
        const active = it.match ? pathname.replace(/\/$/, "").endsWith(it.match) : false;
        const cls = "nav-swatch group relative isolate whitespace-nowrap px-2.5 py-2 text-[0.92rem] text-cocoa transition-colors hover:text-ink xl:px-3";
        const inner = (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- декоративный мазок */}
            <img
              src={`${BASE}/brand/swatches/${it.swatch}.webp`}
              alt=""
              aria-hidden
              data-active={active ? "" : undefined}
              className="nav-swatch-paint pointer-events-none absolute left-1 right-1 top-1/2 -z-10 h-[1.35rem] w-[calc(100%-0.5rem)] -translate-y-[35%] object-fill opacity-70"
            />
            <span className={active ? "font-semibold text-ink" : ""}>{it.label}</span>
          </>
        );
        return it.external ? (
          <a key={it.href} href={it.href} target="_blank" rel="noopener" className={`${cls} hidden xl:block`}>
            {inner}
          </a>
        ) : (
          <Link key={it.href} href={it.href} className={cls} aria-current={active ? "page" : undefined}>
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
