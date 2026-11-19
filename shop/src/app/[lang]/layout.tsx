import type { Metadata, Viewport } from "next";
import { Golos_Text, Great_Vibes, Onest, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { CartProvider } from "@/components/cart";
import { CartDrawer } from "@/components/cart-drawer";
import { SwatchTrail } from "@/components/swatch-trail";
import { Footer, Header } from "@/components/chrome";
import { LOCALES, getDict, isLocale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

const golos = Golos_Text({ variable: "--font-golos", subsets: ["latin", "cyrillic"] });
// Карточки товаров — современный гротеск (выбран из трёх вариантов типографики)
const onest = Onest({ variable: "--font-onest", subsets: ["latin", "latin-ext", "cyrillic"] });
// Заголовки — элегантная антиква с кириллицей; цены и интерфейс — Golos Text
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"], style: ["normal", "italic"] });
const script = Great_Vibes({ variable: "--font-script", subsets: ["latin"], weight: "400" });

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: "%s — BeautyBrand Uz" },
    description: t.meta.description,
    alternates: { canonical: `/${lang}`, languages: { ru: "/ru", uz: "/uz" } },
    openGraph: { siteName: "BeautyBrand Uz", locale: lang === "ru" ? "ru_RU" : "uz_UZ", type: "website" },
  };
}

export const viewport: Viewport = { themeColor: "#f9f7f0" };

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang} className={`${golos.variable} ${onest.variable} ${playfair.variable} ${script.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <CartProvider>
          {/* обрезка по горизонтали здесь, а не на body: мазки за краем не расширяют страницу, липкая шапка работает */}
          <div className="flex min-h-dvh flex-col [overflow-x:clip]">
            <Header lang={lang} />
            <main className="flex-1">{children}</main>
            <Footer lang={lang} />
          </div>
          <CartDrawer lang={lang} />
          <SwatchTrail />
        </CartProvider>
      </body>
    </html>
  );
}
