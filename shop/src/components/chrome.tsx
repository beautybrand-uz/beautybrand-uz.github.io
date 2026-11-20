import { Swatch } from "@/components/swatch";
import Link from "next/link";
import { CartButton, LangSwitch } from "./header-client";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { CATEGORIES, products } from "@/data/products";
import { SocialLinks } from "./social";
import { getDict, type Locale } from "@/lib/i18n";
import { HOURS, PHONE, STORES, TELEGRAM, telegramLink } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function Wordmark({ lang }: { lang: Locale }) {
  return (
    <Link href={`/${lang}`} className="group flex shrink-0 items-center gap-1.5 text-ink sm:gap-2" aria-label="BeautyBrand Uz">
      <span className="font-script text-[1.6rem] leading-none transition-colors group-hover:text-rose-deep sm:text-[2.4rem]">Beautybrand</span>
      {/* «uz» — в золотой таблетке спрессованных теней */}
      <span className="pan grid size-5 shrink-0 place-items-center text-[0.55rem] sm:size-7 sm:text-[0.62rem] rounded-full font-sans text-[0.62rem] font-bold uppercase tracking-wider text-[#4a3214]">
        uz
      </span>
    </Link>
  );
}

const PALETTE = ["#a87268", "#c9a468", "#8f5d41", "#c9828f", "#7a4560", "#d6a48a"];

export function Header({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const navItems = [
    { href: `/${lang}/catalog`, label: t.nav.catalog, swatch: "gold" as const, match: "/catalog" },
    { href: `/${lang}/maison`, label: t.nav.boutique, swatch: "pink" as const, match: "/maison" },
    { href: `/${lang}#stores`, label: t.nav.stores, swatch: "peach" as const },
    { href: telegramLink(TELEGRAM.channel), label: t.nav.telegram, swatch: "lipstick-nude" as const, external: true },
  ];
  const sections = CATEGORIES.filter((c) => products.some((p) => p.category === c)).map((c) => ({
    href: c === "fragrance" ? `/${lang}/maison` : `/${lang}/c/${c}`,
    label: t.categories[c],
  }));
  return (
    <>
      {/* лента сверху — уезжает при прокрутке, шапка остаётся */}
      <div className="bg-ink text-[0.78rem] text-paper/80">
        <div className="shell flex h-9 items-center justify-between gap-4">
          <ul className="flex min-w-0 items-center gap-x-4 overflow-hidden whitespace-nowrap">
            {t.nav.ribbon.map((r, i) => (
              <li key={r} className={`items-center gap-4 ${i === 0 ? "flex" : "hidden sm:flex"}`}>
                {i > 0 ? <span className="text-[0.55rem] text-gold" aria-hidden>✦</span> : null}
                {r}
              </li>
            ))}
          </ul>
          <div className="flex shrink-0 items-center gap-3">
            <a href={`tel:${PHONE.tel}`} className="font-semibold tracking-wide text-gold hover:text-paper">
              {PHONE.display}
            </a>
            {/* на телефоне вход в админку — здесь, в шапке ему не хватает места */}
            <a href={`${BASE}/admin/`} className="grid size-7 place-items-center rounded-full text-paper/70 hover:text-gold sm:hidden" aria-label={t.nav.admin}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-30 bg-paper/88 backdrop-blur-md">
        <div className="shell flex h-[4.25rem] items-center gap-2 sm:gap-4">
          <MobileMenu
            lang={lang}
            items={navItems}
            sections={sections}
            labels={{ menu: t.nav.menu, close: t.nav.close, sections: t.nav.sections, admin: t.nav.admin, call: t.nav.call }}
            phone={PHONE}
          />
          <Wordmark lang={lang} />
          <div className="ml-6">
            <NavLinks
              items={navItems}
            />
          </div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:block">
              <LangSwitch lang={lang} />
            </div>
            <a
              href={`${BASE}/admin/`}
              className="hidden h-10 items-center gap-2 rounded-full border border-line bg-white/60 px-3 text-sm font-semibold text-ink transition-colors hover:border-ink sm:flex"
              title={t.nav.admin}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
                <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
              </svg>
              <span className="hidden xl:inline">{t.nav.admin}</span>
              <span className="sr-only xl:hidden">{t.nav.admin}</span>
            </a>
            <CartButton label={t.nav.cart} />
          </div>
        </div>
        {/* нижний край — полоса из цветов палетки */}
        <div className="flex h-[3px]" aria-hidden>
          {PALETTE.map((c) => (
            <span key={c} className="flex-1" style={{ background: c }} />
          ))}
        </div>
      </header>
    </>
  );
}

export function Footer({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <footer className="relative isolate mt-24 overflow-hidden bg-ink text-paper">
      <Swatch name="highlighter-gold" className="-right-16 -top-20 h-80 w-auto max-w-none opacity-40 mix-blend-screen" />
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-script text-4xl leading-none">Beautybrand</p>
          <p className="mt-3 max-w-xs text-sm text-paper/70">{t.footer.original}</p>
          <div className="mt-5">
            <SocialLinks tone="dark" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">{t.stores.title}</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/70">
            {STORES.map((s) => (
              <li key={s.id}>
                <a href={s.map} target="_blank" rel="noopener" className="hover:text-paper">
                  {s.address[lang]}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-semibold">{t.contact.hours}</p>
          <ul className="mt-3 space-y-1 text-sm text-paper/70">
            {HOURS.map((h) => (
              <li key={h.open + h.days.join()}>
                {h.days.length > 1
                  ? `${t.contact.days[h.days[0]]}–${t.contact.days[h.days[h.days.length - 1]]}`
                  : t.contact.days[h.days[0]]}
                : {t.contact.daily(h.open, h.close)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">{t.footer.order}</p>
          <ul className="mt-3 space-y-2 text-sm text-paper/70">
            <li>
              <a href={`tel:${PHONE.tel}`} className="font-semibold text-paper hover:text-nude">
                {PHONE.display}
              </a>
            </li>
            {TELEGRAM.managers.map((m) => (
              <li key={m}>
                <a href={telegramLink(m)} target="_blank" rel="noopener" className="hover:text-paper">
                  @{m}
                </a>
              </li>
            ))}
            <li>
              <a href={telegramLink(TELEGRAM.channel)} target="_blank" rel="noopener" className="hover:text-paper">
                t.me/{TELEGRAM.channel}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <p className="shell py-5 text-xs text-paper/50">© BeautyBrand Uz · beautybrand.uz</p>
      </div>
    </footer>
  );
}
