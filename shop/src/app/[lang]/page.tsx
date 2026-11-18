import Image from "next/image";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/catalog";
import { TelegramIcon } from "@/components/cart-drawer";
import { getDict, isLocale } from "@/lib/i18n";
import { STORES, TELEGRAM, telegramLink } from "@/lib/site";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-2 px-4 pt-4 sm:px-6 md:grid-cols-[1fr_1.05fr] md:gap-10 md:pt-6">
        <div className="order-2 pb-6 md:order-1 md:pb-0">
          <h1 className="max-w-[14ch] font-display text-[2rem] font-medium leading-[1.08] tracking-[-0.02em] sm:text-[2.6rem] lg:text-[3.3rem]">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-[42ch] text-[1.05rem] leading-relaxed text-cocoa">{t.hero.lead}</p>
          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
            <a href="#catalog" className="btn btn-primary">
              {t.hero.toCatalog}
            </a>
            <a href={telegramLink(TELEGRAM.channel)} target="_blank" rel="noopener" className="btn btn-ghost">
              <TelegramIcon />
              {t.hero.toChannel}
            </a>
          </div>
        </div>
        <div className="order-1 mx-auto w-full max-w-[26rem] md:order-2 md:max-w-none">
          <Image
            src="/brand/logo-1200.webp"
            alt="BeautyBrand"
            width={1200}
            height={1200}
            priority
            sizes="(min-width: 768px) 50vw, 90vw"
            className="h-auto w-full [mask-image:radial-gradient(closest-side,#000_78%,transparent)]"
          />
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <h2 className="mb-4 font-display text-2xl font-medium tracking-[-0.01em] sm:text-3xl">{t.catalog.title}</h2>
        <Catalog lang={lang} />
      </section>

      <section id="stores" className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
        <h2 className="font-display text-2xl font-medium tracking-[-0.01em] sm:text-3xl">{t.stores.title}</h2>
        <p className="mt-2 text-cocoa">{t.stores.lead}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {STORES.map((s) => (
            <a
              key={s.id}
              href={s.map}
              target="_blank"
              rel="noopener"
              className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-white/70 p-5 transition-colors hover:border-ink"
            >
              <span>
                <span className="block font-display text-3xl font-medium text-rose">{s.name[lang]}</span>
                <span className="mt-1 block text-[0.95rem]">{s.address[lang]}</span>
              </span>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="shrink-0 text-cocoa group-hover:text-ink">
                <path
                  d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.7" />
              </svg>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
