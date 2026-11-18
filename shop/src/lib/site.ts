import type { Locale } from "./i18n";

export const SITE_URL = "https://beautybrand.uz";

export const TELEGRAM = {
  channel: "beauty_branduz",
  /** Менеджер, которому уходит заказ */
  manager: "beautybrandcosmetics",
  managers: ["beautybrandcosmetics", "beautybranduzz"],
};

export const PHONE = { display: "+998 90 901 28 88", tel: "+998909012888" };

/** Часы работы по времени Ташкента (UTC+5). day: 0 — воскресенье … 6 — суббота */
export const HOURS: { days: number[]; open: string; close: string }[] = [
  { days: [1, 2, 3, 4, 5, 6], open: "08:00", close: "18:00" },
  { days: [0], open: "10:00", close: "17:00" },
];

export function hoursFor(day: number) {
  return HOURS.find((h) => h.days.includes(day))!;
}

export const STORES: { id: string; name: Record<Locale, string>; address: Record<Locale, string>; map: string }[] = [
  {
    id: "c5",
    name: { ru: "Ц5", uz: "Ts5" },
    address: { ru: "Ц5, проспект Шарафа Рашидова, 60", uz: "Ts5, Sharof Rashidov shoh ko‘chasi, 60" },
    map: "https://yandex.uz/maps/?text=" + encodeURIComponent("Sharaf Rashidov Avenue 60, 100017, Tashkent"),
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
