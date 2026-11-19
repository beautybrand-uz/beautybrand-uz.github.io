import type { Metadata, Viewport } from "next";
import { Golos_Text, Great_Vibes, Playfair_Display } from "next/font/google";
import "../globals.css";
import "./admin.css";

const golos = Golos_Text({ variable: "--font-golos", subsets: ["latin", "cyrillic"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"] });
const script = Great_Vibes({ variable: "--font-script", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Админка — BeautyBrand Uz",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#15100d" };

/** Отдельный корневой макет: у админки своя тёмная тема и нет шапки магазина */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${golos.variable} ${playfair.variable} ${script.variable} antialiased`}>
      <body className="admin min-h-dvh">{children}</body>
    </html>
  );
}
