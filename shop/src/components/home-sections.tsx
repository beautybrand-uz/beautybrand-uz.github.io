import Link from "next/link";
import { TelegramIcon } from "./cart-drawer";
import { BRANDS } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { TELEGRAM, telegramLink } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** «Новинки недели»: вертикальный ролик из video/ (NewArrivals) в рамке-телефоне */
export function NewArrivalsReel({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-ink p-6 text-paper sm:p-10 md:grid-cols-[1fr_auto] md:gap-14 md:p-14">
        <div className="order-2 md:order-1">
          <h2 className="font-display text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-4xl">{t.home.newTitle}</h2>
          <p className="mt-4 max-w-[46ch] leading-relaxed text-paper/75">{t.home.newText}</p>
          <a
            href={telegramLink(TELEGRAM.channel)}
            target="_blank"
            rel="noopener"
            className="btn mt-8 bg-paper text-ink hover:bg-rose hover:text-white"
          >
            <TelegramIcon />
            {t.home.newCta}
          </a>
        </div>
        <div className="order-1 mx-auto w-[min(17rem,70vw)] md:order-2">
          <div className="rounded-[2.2rem] bg-[#3b2721] p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
            <video
              className="aspect-[9/16] w-full rounded-[1.8rem] bg-paper object-cover"
              src={`${BASE}/videos/new-arrivals.mp4`}
              poster={`${BASE}/brand/girl-glam-1200.webp`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={t.home.newTitle}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Бренды — компактная бегущая строка; клик открывает каталог с этим брендом */
export function BrandWall({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const Row = ({ hidden }: { hidden?: boolean }) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {BRANDS.map((b) => (
        <li key={b} className="flex items-center">
          <Link
            href={`/${lang}/catalog?brand=${encodeURIComponent(b)}`}
            tabIndex={hidden ? -1 : undefined}
            className="whitespace-nowrap px-5 font-display text-xl uppercase tracking-[0.12em] text-ink/70 transition-colors hover:text-rose sm:px-7 sm:text-2xl"
          >
            {b}
          </Link>
          <span className="text-[0.6rem] text-gold" aria-hidden>
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <section className="pt-20">
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-4 sm:px-6">
        <h2 className="font-display text-3xl font-medium sm:text-4xl">{t.home.brandsTitle}</h2>
        <Link href={`/${lang}/catalog`} className="shrink-0 text-sm text-cocoa underline underline-offset-4 hover:text-ink">
          {t.home.brandsAll}
        </Link>
      </div>
      <div className="marquee marquee-mask mt-6 border-y border-line py-5">
        <div className="marquee-track flex w-max">
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  );
}

/** Как заказать — три шага по порядку */
export function HowToOrder({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <h2 className="font-display text-2xl font-medium tracking-[-0.01em] sm:text-3xl">{t.home.howTitle}</h2>
      <ol className="mt-6 grid gap-3 md:grid-cols-3 md:gap-4">
        {t.home.how.map(([title, text], i) => (
          <li key={title} className="rounded-2xl border border-line bg-white/60 p-6">
            <span className="tag">{i + 1}</span>
            <p className="mt-4 font-display text-xl font-medium">{title}</p>
            <p className="mt-1.5 leading-relaxed text-cocoa">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
