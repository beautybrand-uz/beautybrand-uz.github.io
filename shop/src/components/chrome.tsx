import Link from "next/link";
import { CartButton, LangSwitch } from "./header-client";
import { SocialLinks } from "./social";
import { getDict, type Locale } from "@/lib/i18n";
import { HOURS, PHONE, STORES, TELEGRAM, telegramLink } from "@/lib/site";

export function Wordmark({ lang }: { lang: Locale }) {
  return (
    <Link href={`/${lang}`} className="flex items-baseline gap-1 text-ink" aria-label="BeautyBrand Uz">
      <span className="font-script text-[2rem] leading-none sm:text-[2.3rem]">Beautybrand</span>
      <span className="font-sans text-[0.7rem] font-bold tracking-wide text-rose">uz</span>
    </Link>
  );
}

export function Header({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur-md">
      <div className="shell flex h-16 items-center gap-4">
        <Wordmark lang={lang} />
        <nav className="ml-6 hidden gap-6 text-sm text-cocoa md:flex">
          <Link href={`/${lang}/catalog`} className="hover:text-ink">
            {t.nav.catalog}
          </Link>
          <Link href={`/${lang}/maison`} className="hover:text-ink">
            {t.nav.boutique}
          </Link>
          <Link href={`/${lang}#stores`} className="hover:text-ink">
            {t.nav.stores}
          </Link>
          <a href={telegramLink(TELEGRAM.channel)} target="_blank" rel="noopener" className="hover:text-ink">
            {t.nav.telegram}
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <LangSwitch lang={lang} />
          <CartButton label={t.nav.cart} />
        </div>
      </div>
    </header>
  );
}

export function Footer({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <footer className="mt-24 bg-ink text-paper">
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
