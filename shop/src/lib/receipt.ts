"use client";

import type { Locale } from "./i18n";

/**
 * Чек заказа. Хранится в самой ссылке (#…) — QR-код на чеке открывает страницу /receipt,
 * где видно, что куплено, и можно попросить обмен или возврат. Копия — в браузере покупателя.
 */
export type ReceiptData = {
  /** номер чека, BB-251123-4821 */
  c: string;
  /** дата ISO */
  d: string;
  /** способ получения: c5, c1, delivery */
  m: string;
  /** товары: [slug, вариант, штук, цена за штуку] */
  i: [string, string | null, number, number][];
  /** итог */
  t: number;
  l: Locale;
};

const KEY = "bb-receipts-v1";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function newReceiptCode(now = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  const day = `${String(now.getFullYear()).slice(2)}${p(now.getMonth() + 1)}${p(now.getDate())}`;
  return `BB-${day}-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

const toB64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64 = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

export const encodeReceipt = (r: ReceiptData) => toB64(JSON.stringify(r));

export function decodeReceipt(hash: string): ReceiptData | null {
  try {
    const r = JSON.parse(fromB64(hash.replace(/^#/, ""))) as ReceiptData;
    return r && typeof r.c === "string" && Array.isArray(r.i) ? r : null;
  } catch {
    return null;
  }
}

/** Ссылка в QR-коде: работает и на GitHub Pages, и на своём домене */
export function receiptUrl(r: ReceiptData) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}${BASE}/${r.l}/receipt#${encodeReceipt(r)}`;
}

export function saveReceipt(r: ReceiptData) {
  try {
    const list = loadReceipts().filter((x) => x.c !== r.c);
    localStorage.setItem(KEY, JSON.stringify([r, ...list].slice(0, 20)));
  } catch {
    /* хранилище недоступно — чек всё равно в QR */
  }
}

export function loadReceipts(): ReceiptData[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function receiptDate(iso: string, lang: Locale) {
  return new Date(iso).toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
