"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LangSwitch } from "./header-client";
import type { SwatchName } from "./swatch";
import type { Locale } from "@/lib/i18n";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Item = { href: string; label: string; swatch: SwatchName; external?: boolean };

/** Меню для телефона и планшета: кнопка ☰ и панель, выезжающая сверху */
export function MobileMenu({
  lang,
  items,
  sections,
  labels,
  phone,
}: {
  lang: Locale;
  items: Item[];
  sections: { href: string; label: string }[];
  labels: { menu: string; close: string; sections: string; admin: string; call: string };
  phone: { display: string; tel: string };
}) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // переход по ссылке закрывает меню
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.menu}
        aria-expanded={open}
        className="-ml-1.5 grid size-10 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-well lg:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 7h16M4 12h11M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div className={`drawer-backdrop absolute inset-0 bg-ink/40 ${open ? "opacity-100" : "opacity-0"}`} onClick={close} />
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={labels.menu}
          inert={!open}
          data-state={open ? "open" : "closed"}
          className="mobile-menu absolute inset-x-0 top-0 max-h-dvh overflow-y-auto rounded-b-[2rem] bg-paper shadow-2xl"
        >
          <div className="shell flex h-16 items-center justify-between">
            <span className="font-script text-[1.8rem] leading-none text-ink">Beautybrand</span>
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="-mr-1.5 grid size-10 place-items-center rounded-full text-cocoa hover:bg-well hover:text-ink"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="flex h-[3px]" aria-hidden>
            {["#a87268", "#c9a468", "#8f5d41", "#c9828f", "#7a4560", "#d6a48a"].map((c) => (
              <span key={c} className="flex-1" style={{ background: c }} />
            ))}
          </div>

          <nav className="shell pt-5" aria-label={labels.menu}>
            <ul className="space-y-1">
              {items.map((it, i) => {
                const inner = (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element -- декоративный мазок */}
                    <img
                      src={`${BASE}/brand/swatches/${it.swatch}.webp`}
                      alt=""
                      aria-hidden
                      className="mobile-menu-paint pointer-events-none absolute -left-2 top-1/2 -z-10 h-[1.9rem] w-[min(100%,15rem)] -translate-y-[40%] object-fill opacity-75"
                      style={{ transitionDelay: open ? `${160 + i * 70}ms` : "0ms" }}
                    />
                    {it.label}
                  </>
                );
                const cls = "relative isolate inline-block py-2 font-display text-[2rem] leading-tight text-ink";
                return (
                  <li key={it.href} data-open={open ? "" : undefined}>
                    {it.external ? (
                      <a href={it.href} target="_blank" rel="noopener" className={cls} onClick={close}>
                        {inner}
                      </a>
                    ) : (
                      <Link href={it.href} className={cls} onClick={close}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <p className="mt-7 text-sm font-semibold text-cocoa">{labels.sections}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sections.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    onClick={close}
                    className="block rounded-full border border-line bg-white/60 px-3.5 py-2 text-sm transition-colors hover:border-ink"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="shell mt-8 flex flex-wrap items-center gap-2.5 border-t border-line pb-8 pt-6">
            <LangSwitch lang={lang} />
            <a href={`${BASE}/admin/`} className="flex h-10 items-center gap-2 rounded-full border border-line bg-white/60 px-3.5 text-sm font-semibold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              {labels.admin}
            </a>
            <a href={`tel:${phone.tel}`} className="btn btn-primary min-h-10 px-4 text-sm">
              {labels.call}: {phone.display}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
