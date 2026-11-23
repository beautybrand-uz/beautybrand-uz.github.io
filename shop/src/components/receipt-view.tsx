"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { RECEIPT_T, receiptItems, receiptWhere } from "./order-receipt";
import { getDict, type Locale } from "@/lib/i18n";
import { decodeReceipt, loadReceipts, receiptDate, receiptUrl, type ReceiptData } from "@/lib/receipt";
import { TELEGRAM, formatPrice, telegramLink } from "@/lib/site";

const T = {
  ru: {
    title: "Чек",
    mine: "Мои чеки",
    none: "Чеков пока нет. Чек появится здесь после заказа на сайте.",
    bad: "Не получилось прочитать чек. Откройте ссылку из QR-кода ещё раз или напишите менеджеру.",
    exchange: "Обменять",
    refund: "Вернуть",
    note: "Сохраните чек: по нему менеджер найдёт заказ. Условия обмена и возврата менеджер уточнит в Telegram.",
    msg: (kind: "exchange" | "refund", code: string, list: string) =>
      `Здравствуйте! Хочу ${kind === "exchange" ? "обменять" : "вернуть"} товар по чеку ${code}:\n${list}`,
    catalog: "В каталог",
  },
  uz: {
    title: "Chek",
    mine: "Mening cheklarim",
    none: "Hozircha cheklar yo‘q. Saytda buyurtma bergandan keyin chek shu yerda paydo bo‘ladi.",
    bad: "Chekni o‘qib bo‘lmadi. QR-kod havolasini qayta oching yoki menejerga yozing.",
    exchange: "Almashtirish",
    refund: "Qaytarish",
    note: "Chekni saqlang: menejer buyurtmani u orqali topadi. Almashtirish va qaytarish shartlarini menejer Telegramda aytadi.",
    msg: (kind: "exchange" | "refund", code: string, list: string) =>
      `Assalomu alaykum! ${code} chek bo‘yicha mahsulotni ${kind === "exchange" ? "almashtirmoqchiman" : "qaytarmoqchiman"}:\n${list}`,
    catalog: "Katalogga",
  },
} as const;

/** Страница чека: что куплено, QR-код, кнопки «Обменять» и «Вернуть» (сообщение менеджеру в Telegram) */
export function ReceiptView({ lang }: { lang: Locale }) {
  const t = T[lang];
  const cur = getDict(lang).currency;
  const [state, setState] = useState<{ r: ReceiptData | null; bad: boolean; list: ReceiptData[] } | null>(null);

  useEffect(() => {
    const read = () => {
      const h = location.hash;
      const r = h.length > 1 ? decodeReceipt(h) : null;
      setState({ r, bad: h.length > 1 && !r, list: loadReceipts() });
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  if (!state) return <div className="min-h-[50vh]" aria-busy="true" />;
  const { r, bad, list } = state;

  if (!r)
    return (
      <div className="mx-auto max-w-xl">
        {bad ? <p className="rounded-2xl border border-line bg-white/60 p-4 text-cocoa">{t.bad}</p> : null}
        <h2 className="mt-6 font-display text-2xl font-medium">{t.mine}</h2>
        {list.length ? (
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white/60">
            {list.map((x) => (
              <li key={x.c}>
                <a href={`#${receiptUrl(x).split("#")[1]}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-well/60">
                  <span>
                    <span className="block font-mono text-sm font-semibold">{x.c}</span>
                    <span className="text-xs text-cocoa">{receiptDate(x.d, lang)}</span>
                  </span>
                  <span className="font-semibold text-rose-deep">{formatPrice(x.t, cur)}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-cocoa">{t.none}</p>
        )}
        <Link href={`/${lang}/catalog`} className="btn btn-primary mt-6">
          {t.catalog}
        </Link>
      </div>
    );

  const items = receiptItems(r);
  const list2 = items.map((x, k) => `${k + 1}. ${x.name}${x.variant ? ` (${x.variant})` : ""} × ${x.qty}`).join("\n");
  const ask = (kind: "exchange" | "refund") => telegramLink(TELEGRAM.manager, t.msg(kind, r.c, list2));
  const RT = RECEIPT_T[lang];

  return (
    <div className="mx-auto grid max-w-3xl items-start gap-8 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      {/* бумажный чек */}
      <div className="receipt-paper relative mx-auto w-full max-w-[22rem] bg-[#fdfdfa] px-6 pb-8 pt-6 font-mono text-[0.82rem] leading-relaxed text-[#262624] shadow-[0_24px_40px_-24px_rgba(40,35,25,0.45)]">
        <p className="text-center text-base font-bold uppercase tracking-[0.08em]">BeautyBrand Uz</p>
        <p className="text-center text-[0.7rem]">{RT.address}</p>
        <hr className="my-3 border-dashed border-[#2a2a2a]/40" />
        <p>
          {RT.order} #{r.c}
        </p>
        <p>{receiptDate(r.d, lang)}</p>
        <p>{receiptWhere(r)}</p>
        <hr className="my-3 border-dashed border-[#2a2a2a]/40" />
        <ul className="space-y-1">
          {items.map((x, k) => (
            <li key={k} className="flex justify-between gap-3">
              <span className="min-w-0">
                {x.qty} x {x.name}
                {x.variant ? ` (${x.variant})` : ""}
              </span>
              <span className="shrink-0 tabular-nums">{formatPrice(x.qty * x.price, cur)}</span>
            </li>
          ))}
        </ul>
        <hr className="my-3 border-dashed border-[#2a2a2a]/40" />
        <p className="flex justify-between text-[0.95rem] font-bold">
          <span>{RT.total}</span>
          <span className="tabular-nums">{formatPrice(r.t, cur)}</span>
        </p>
        <hr className="my-3 border-dashed border-[#2a2a2a]/40" />
        <div className="flex flex-col items-center gap-2">
          <QRCodeSVG value={receiptUrl(r)} level="M" marginSize={0} bgColor="transparent" fgColor="#262624" size={132} />
          <p className="text-center text-[0.68rem]">{RT.scan}</p>
          <p className="tracking-[0.25em]">{r.c}</p>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl font-medium">
          {t.title} {r.c}
        </h2>
        <p className="mt-3 leading-relaxed text-cocoa">{t.note}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={ask("exchange")} target="_blank" rel="noopener" className="btn btn-primary">
            {t.exchange}
          </a>
          <a href={ask("refund")} target="_blank" rel="noopener" className="btn btn-ghost">
            {t.refund}
          </a>
        </div>
        {list.length > 1 ? (
          <>
            <h3 className="mt-10 text-sm font-semibold uppercase tracking-[0.12em] text-cocoa">{t.mine}</h3>
            <ul className="mt-3 space-y-1.5 text-sm">
              {list
                .filter((x) => x.c !== r.c)
                .map((x) => (
                  <li key={x.c}>
                    <a href={`#${receiptUrl(x).split("#")[1]}`} className="font-mono underline underline-offset-4 hover:text-rose-deep">
                      {x.c}
                    </a>{" "}
                    <span className="text-cocoa">· {formatPrice(x.t, cur)}</span>
                  </li>
                ))}
            </ul>
          </>
        ) : null}
      </div>
    </div>
  );
}
