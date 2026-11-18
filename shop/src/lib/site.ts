import type { Locale } from "./i18n";

export const SITE_URL = "https://beautybrand.uz";

export const TELEGRAM = {
  channel: "beauty_branduz",
  /** Менеджер, которому уходит заказ */
  manager: "beautybrandcosmetics",
  managers: ["beautybrandcosmetics", "beautybranduzz"],
};

export const STORES: { id: string; name: Record<Locale, string>; address: Record<Locale, string>; map: string }[] = [
  {
    id: "c5",
    name: { ru: "Ц5", uz: "Ts5" },
    address: { ru: "Ц5, улица Киёт, 60", uz: "Ts5, Kiyot ko‘chasi, 60" },
    map: "https://yandex.uz/maps/?text=" + encodeURIComponent("Ташкент, Ц-5, улица Киёт, 60"),
  },
  {
    id: "c1",
    name: { ru: "Ц1", uz: "Ts1" },
    address: { ru: "Ц1, улица Буюк Ипак Йули, 26", uz: "Ts1, Buyuk Ipak Yo‘li ko‘chasi, 26" },
    map: "https://yandex.uz/maps/?text=" + encodeURIComponent("Ташкент, Ц-1, улица Буюк Ипак Йули, 26"),
  },
];

export function formatPrice(sum: number, currency: string) {
  // 1 279 000 сум — пробелы неразрывные
  return `${Math.round(sum).toLocaleString("ru-RU").replace(/\s/g, " ")} ${currency}`;
}

export function telegramLink(username: string, text?: string) {
  return `https://t.me/${username}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
