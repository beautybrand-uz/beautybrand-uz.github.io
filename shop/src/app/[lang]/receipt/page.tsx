import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReceiptView } from "@/components/receipt-view";
import { isLocale } from "@/lib/i18n";

export const metadata: Metadata = { title: "Чек", robots: { index: false, follow: false } };

/** Чек заказа: данные в ссылке из QR-кода (#…), страница одна для всех чеков */
export default async function ReceiptPage({ params }: PageProps<"/[lang]/receipt">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <div className="shell pt-10">
      <ReceiptView lang={lang} />
    </div>
  );
}
