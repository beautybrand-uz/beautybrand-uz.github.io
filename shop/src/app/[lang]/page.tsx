import { Swatch } from "@/components/swatch";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CategoryPromos } from "@/components/category-promos";
import { BrandWall, HowToOrder, NewArrivalsReel } from "@/components/home-sections";
import { TelegramIcon } from "@/components/cart-drawer";
import { HoursCard } from "@/components/contact";
import { MaisonBanner } from "@/components/maison";
import { Reveal } from "@/components/reveal";
import { ReviewsFeed } from "@/components/reviews";
import { getDict, isLocale } from "@/lib/i18n";
import { HOURS, PHONE, SITE_URL, STORES, TELEGRAM, telegramLink } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Данные магазина для Google и Яндекса: адрес, телефон, часы работы
const localBusiness = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "BeautyBrand Uz",
  url: SITE_URL,
  telephone: PHONE.tel,
  image: `${SITE_URL}/brand/girl-glam-1200.webp`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Sharaf Rashidov Avenue 60",
    postalCode: "100017",
    addressLocality: "Tashkent",
    addressCountry: "UZ",
  },
  openingHoursSpecification: HOURS.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days.map((d) => DAY[d]),
    opens: h.open,
    closes: h.close,
  })),
  sameAs: [telegramLink(TELEGRAM.channel)],
};

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <>
      {/* Первый экран внутри контейнера: текст слева, панель с героиней справа — с теми же полями, что и блоки ниже */}
      <section className="shell grid gap-6 pt-4 lg:min-h-[min(calc(100svh-5rem),54rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 lg:pt-6">
        <div className="order-2 flex min-w-0 flex-col justify-center pb-4 lg:order-1 lg:py-12">
          <h1 className="hero-title rise font-display font-medium leading-[1.02] text-balance">
            {t.hero.title}
          </h1>
          <p className="rise mt-6 max-w-[42ch] text-[1.05rem] leading-relaxed text-cocoa lg:text-lg" style={{ animationDelay: "90ms" }}>
            {t.hero.lead}
          </p>
          <div className="rise mt-9 flex flex-col flex-wrap gap-2.5 sm:flex-row" style={{ animationDelay: "180ms" }}>
            <a href="#promo-title" className="btn btn-primary">
              {t.hero.toCatalog}
            </a>
            <a href={telegramLink(TELEGRAM.channel)} target="_blank" rel="noopener" className="btn btn-ghost">
              <TelegramIcon />
              {t.hero.toChannel}
            </a>
          </div>
          <ul className="rise mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-cocoa" style={{ animationDelay: "270ms" }}>
            {t.hero.facts.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-[0.6rem] text-gold" aria-hidden>
                  ✦
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        {/* Героиня на фоне мазка мерцающих теней (brand/tools/swatch.py) */}
        <div className="rise-image relative isolate order-1 flex min-h-[min(110vw,32rem)] items-end justify-center lg:order-2 lg:min-h-0">
          <Swatch name="rose" priority className="left-1/2 top-[2%] h-[84%] w-auto max-w-none -translate-x-[46%] -rotate-[4deg] opacity-95" />
          <Image
            src={`${BASE}/brand/girl-glam-cutout.webp`}
            alt="BeautyBrand"
            width={986}
            height={1161}
            priority
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="relative h-auto max-h-[min(calc(100svh-10rem),44rem)] w-auto max-w-[88%] object-contain [filter:drop-shadow(0_2px_3px_rgba(42,26,21,0.2))_drop-shadow(0_16px_18px_rgba(42,26,21,0.2))]"
          />
        </div>
      </section>

      <CategoryPromos lang={lang} />
      <MaisonBanner lang={lang} />
      <Reveal>
        <NewArrivalsReel lang={lang} />
      </Reveal>
      <BrandWall lang={lang} />
      <ReviewsFeed lang={lang} />
      <Reveal>
        <HowToOrder lang={lang} />
      </Reveal>

      <section
        id="stores"
        className="shell relative isolate grid items-center gap-8 pt-24 md:grid-cols-[0.8fr_1fr] md:gap-14"
      >
        {/* 3D-логотип из brand/png: тень и кромка уже в картинке */}
        <div className="relative mx-auto aspect-square w-full max-w-sm md:max-w-none">
          <Swatch name="plum" className="-left-[8%] top-[4%] h-[92%] w-auto max-w-none -rotate-[14deg] opacity-85" />
          <Image
            src={`${BASE}/brand/beautybrand-34-3d.webp`}
            alt=""
            fill
            sizes="(min-width: 768px) 40vw, 384px"
            className="object-contain"
          />
        </div>
        <div>
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
        <div className="mt-3">
          <HoursCard lang={lang} />
        </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
    </>
  );
}
