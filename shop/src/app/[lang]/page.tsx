import { Swatch } from "@/components/swatch";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CategoryPromos } from "@/components/category-promos";
import { BrandWall, HowToOrder, NewArrivalsReel } from "@/components/home-sections";
import { StoreCompacts, WeekPalette } from "@/components/stores";
import { SocialLinks } from "@/components/social";
import { MaisonBanner } from "@/components/maison";
import { Reveal } from "@/components/reveal";
import { ReviewsFeed } from "@/components/reviews";
import { BRANDS } from "@/data/products";
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
          {/* о компании — три факта вместо кнопок */}
          <dl className="rise relative isolate mt-9 grid max-w-[40rem] grid-cols-3 gap-4 pt-8 sm:gap-6" style={{ animationDelay: "180ms" }}>
            <Swatch name="brow-brown" priority className="-left-1 top-0 h-[1.1rem] w-[min(100%,34rem)] max-w-none opacity-75" />
            {t.hero.stats(BRANDS.length).map(([value, label], i) => (
              <div key={label} className={`min-w-0 ${i ? "border-l border-line pl-4 sm:pl-6" : ""}`}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-[1.7rem] font-medium leading-none tracking-[-0.02em] text-rose-deep sm:text-[2.3rem]">
                  {value}
                </dd>
                <dd className="mt-2 text-[0.8rem] leading-snug text-cocoa sm:text-sm">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        {/* Героиня на фоне мазка мерцающих теней (brand/tools/swatch.py) */}
        <div className="rise-image relative isolate order-1 flex min-h-[min(110vw,32rem)] items-end justify-center lg:order-2 lg:min-h-0">
          <Swatch name="rose" priority className="left-1/2 top-[2%] h-[84%] w-auto max-w-none -translate-x-[46%] -rotate-[4deg] opacity-95" />
          <Swatch name="highlighter-gold" priority className="left-[4%] top-[30%] h-[38%] w-auto max-w-none opacity-80" />
          <Swatch name="gloss-pink" priority className="right-[4%] top-[12%] h-auto w-[15%] max-w-none rotate-12 opacity-95" />
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
          <Swatch name="polish-red" className="-bottom-[2%] right-[2%] h-auto w-[22%] max-w-none -rotate-12" />
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
        <div className="mt-6 space-y-3">
          <StoreCompacts lang={lang} stores={STORES} />
          <WeekPalette lang={lang} />
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a href={`tel:${PHONE.tel}`} className="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
              {t.contact.call}: {PHONE.display}
            </a>
            <SocialLinks />
          </div>
        </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
    </>
  );
}
