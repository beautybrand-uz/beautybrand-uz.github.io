"use client";

import { useEffect } from "react";
import { ReceiptPrinter, type ReceiptLabels } from "@/components/ui/receipt-printer";
import { getProduct } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { receiptDate, receiptUrl, type ReceiptData } from "@/lib/receipt";
import { STORES, formatPrice } from "@/lib/site";

export const RECEIPT_T = {
  ru: {
    order: "Чек",
    total: "Итого",
    thanks: "СПАСИБО ЗА ПОКУПКУ",
    scan: "Сканируйте для обмена или возврата",
    print: "ПЕЧАТЬ",
    printAria: "Напечатать чек ещё раз",
    hintIdle: "Нажмите «Печать»",
    hintPrinting: "Печатаем чек…",
    hintDone: "Потяните чек, чтобы оторвать, или напечатайте ещё",
    paperAria: "Чек. Потяните или нажмите Enter, чтобы оторвать.",
    soundOn: "Включить звук",
    soundOff: "Выключить звук",
    pickup: "Самовывоз",
    delivery: "Доставка",
    open: "Открыть чек",
    close: "Закрыть",
    address: "Ташкент · t.me/beauty_branduz",
  },
  uz: {
    order: "Chek",
    total: "Jami",
    thanks: "XARIDINGIZ UCHUN RAHMAT",
    scan: "Almashtirish yoki qaytarish uchun skanerlang",
    print: "CHOP",
    printAria: "Chekni qayta chop etish",
    hintIdle: "«Chop» tugmasini bosing",
    hintPrinting: "Chek chop etilmoqda…",
    hintDone: "Chekni yirtish uchun torting yoki yana chop eting",
    paperAria: "Chek. Yirtish uchun torting yoki Enter bosing.",
    soundOn: "Ovozni yoqish",
    soundOff: "Ovozni o‘chirish",
    pickup: "Olib ketish",
    delivery: "Yetkazib berish",
    open: "Chekni ochish",
    close: "Yopish",
    address: "Toshkent · t.me/beauty_branduz",
  },
} as const;

/** Строки чека из сохранённого заказа */
export function receiptItems(r: ReceiptData) {
  return r.i.map(([slug, variant, qty, price]) => {
    const p = getProduct(slug);
    return { name: p ? `${p.brand} ${p.name}` : slug, variant: variant ?? undefined, qty, price };
  });
}

export function receiptWhere(r: ReceiptData) {
  const t = RECEIPT_T[r.l];
  const store = STORES.find((s) => s.id === r.m);
  return store ? `${t.pickup} ${store.name[r.l]}` : t.delivery;
}

/** После заказа: принтер сам печатает чек с QR-кодом для обмена и возврата */
export function OrderReceipt({ receipt, lang, onClose }: { receipt: ReceiptData; lang: Locale; onClose: () => void }) {
  const t = RECEIPT_T[lang];
  const url = receiptUrl(receipt);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const labels: Partial<ReceiptLabels> = {
    order: t.order,
    total: t.total,
    thanks: t.thanks,
    scan: t.scan,
    print: t.print,
    printAria: t.printAria,
    hintIdle: t.hintIdle,
    hintPrinting: t.hintPrinting,
    hintDone: t.hintDone,
    paperAria: t.paperAria,
    soundOn: t.soundOn,
    soundOff: t.soundOff,
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={`${t.order} ${receipt.c}`} className="fixed inset-0 z-[80]">
      <ReceiptPrinter
        autoPrint
        store="BeautyBrand Uz"
        address={t.address}
        items={receiptItems(receipt)}
        formatMoney={(n) => formatPrice(n, getDict(lang).currency)}
        taxRate={0}
        orderCode={receipt.c}
        date={receiptDate(receipt.d, lang)}
        info={[[lang === "ru" ? "Получение" : "Olish", receiptWhere(receipt)]]}
        qrValue={url}
        mark="Beautybrand"
        labels={labels}
      />
      <div className="absolute left-4 top-4 z-50 flex gap-2">
        <a href={url} target="_blank" rel="noopener" className="rounded-full bg-white/80 px-4 py-2.5 text-sm font-semibold text-ink shadow ring-1 ring-black/5 backdrop-blur hover:bg-white">
          {t.open}
        </a>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={t.close}
        className="absolute right-4 top-4 z-50 grid size-11 place-items-center rounded-full bg-white/80 text-ink shadow ring-1 ring-black/5 backdrop-blur hover:bg-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
