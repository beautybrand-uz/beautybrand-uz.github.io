import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox, Gallery, LiveText } from "@/components/product-client";
import { ProductDetails } from "@/components/product-details";
import { SalesNote } from "@/components/sales-note";
import { ProductReviews } from "@/components/reviews";
import { getProduct, products } from "@/data/products";
import { LOCALES, getDict, isLocale } from "@/lib/i18n";
import { SITE_URL, TELEGRAM, telegramLink } from "@/lib/site";

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/p/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = getProduct(slug);
  if (!p || !isLocale(lang)) return {};
  return {
    metadataBase: new URL(SITE_URL),
    title: `${p.brand} ${p.name}`,
    description: p.description[lang],
    alternates: { canonical: `/${lang}/p/${slug}`, languages: { ru: `/ru/p/${slug}`, uz: `/uz/p/${slug}` } },
    openGraph: { images: p.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/p/[slug]">) {
  const { lang, slug } = await params;
  const p = getProduct(slug);
  if (!p || !isLocale(lang)) notFound();
  const t = getDict(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.brand} ${p.name}`,
    brand: { "@type": "Brand", name: p.brand },
    image: p.images.map((i) => SITE_URL + i),
    description: p.description[lang],
    offers: {
      "@type": "Offer",
      price: p.usd ? Math.min(...p.usd.map((u) => u.usd)) : p.price,
      priceCurrency: p.usd ? "USD" : "UZS",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/${lang}/p/${p.slug}`,
    },
  };

  return (
    <div className="shell pt-5">
      <Link
        href={`/${lang}/c/${p.category}`}
        className="inline-flex items-center gap-1.5 py-2 text-sm text-cocoa hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {`${t.product.back}: ${t.categories[p.category]}`}
      </Link>

      <div className="mt-3 grid gap-6 font-product md:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] md:gap-8 xl:grid-cols-[minmax(0,21rem)_minmax(0,1fr)_minmax(0,24rem)] xl:gap-10">
        <div className="mx-auto w-full max-w-[21rem] md:mx-0">
          <Gallery images={p.images} video={p.video} alt={`${p.brand} ${p.name}`} slug={p.slug} />
        </div>
        <div className="min-w-0 md:pt-1">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-cocoa">{p.brand}</p>
          <h1 className="mt-1.5 text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.03em] text-balance sm:text-[2rem]">
            <LiveText slug={p.slug} field="name" lang={lang} fallback={p.name} />
          </h1>
          <SalesNote slug={p.slug} lang={lang} />
          <p className="mt-3 max-w-[60ch] text-[0.95rem] leading-relaxed"><LiveText slug={p.slug} field="description" lang={lang} fallback={p.description[lang]} /></p>
          <BuyBox slug={p.slug} lang={lang} />
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line pt-4 text-[0.82rem] text-cocoa">
            <li>{t.product.original}</li>
            <li>{t.product.pickup}</li>
            <li>
              <a
                href={telegramLink(`${p.channel ?? TELEGRAM.channel}/${p.post}`)}
                target="_blank"
                rel="noopener"
                className="underline underline-offset-4 hover:text-ink"
              >
                {t.product.post}
              </a>
            </li>
          </ul>
        </div>
        <div className="min-w-0 md:col-span-2 xl:col-span-1">
          <ProductDetails slug={p.slug} lang={lang} />
        </div>
      </div>
      <ProductReviews slug={p.slug} productName={`${p.brand} ${p.name}`} lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
