import { notFound } from "next/navigation";
import { ItemView } from "@/components/item-view";
import { isLocale } from "@/lib/i18n";

/** Страница товара, добавленного через админку: /ru/item/?p=slug (данные из базы, в браузере) */
export default async function ItemPage({ params }: PageProps<"/[lang]/item">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <ItemView lang={lang} />;
}
