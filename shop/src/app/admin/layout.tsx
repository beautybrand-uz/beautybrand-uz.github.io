import type { Metadata, Viewport } from "next";
import { Great_Vibes, Jost } from "next/font/google";
import "../globals.css";
import "./admin.css";

const jost = Jost({ variable: "--font-jost", subsets: ["latin", "latin-ext", "cyrillic"], weight: ["300", "400", "500", "600", "700"] });
const script = Great_Vibes({ variable: "--font-script", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Админка — BeautyBrand Uz",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#15100d" };

/** Отдельный корневой макет: у админки своя тема (тёмная или светлая) и нет шапки магазина */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${jost.variable} ${script.variable} antialiased`}>
      <body className="admin min-h-dvh" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("admin-theme")==="light")document.body.dataset.theme="light"}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
