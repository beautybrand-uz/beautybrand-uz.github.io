"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ReceiptPaper } from "@/components/receipt-view";
import { decodeReceipt, receiptUrl, type ReceiptData } from "@/lib/receipt";
import { STORES, formatPrice } from "@/lib/site";
import type { Order } from "./admin-app";
import { StaffBadge } from "./staff";

const sum = (n: number) => formatPrice(n, "сум");
const when = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
const methodLabel = (m: string) => STORES.find((s) => s.id === m)?.name.ru ?? (m === "delivery" ? "Доставка" : m);

const AFTER = {
  exchange: { label: "Обмен", color: "var(--a-blue)" },
  refund: { label: "Возврат", color: "var(--a-rose)" },
} as const;

type Filter = "all" | "exchange" | "refund" | "none";

/** Чек из заказа в базе — тот же, что получил покупатель (номер, товары, QR) */
function toReceipt(o: Order): ReceiptData | null {
  if (!o.code) return null;
  return {
    c: o.code,
    d: o.created_at,
    m: o.method,
    i: o.items.map((i) => [i.slug, i.variant, i.qty, i.price]),
    t: o.total,
    l: o.lang,
  };
}

/** Из поиска: ссылка из QR (…/receipt#…) — раскодировать; иначе искать по номеру чека или телефону */
function parseQuery(q: string): { receipt: ReceiptData | null; text: string } {
  const s = q.trim();
  const hash = s.includes("#") ? s.slice(s.indexOf("#")) : "";
  return { receipt: hash ? decodeReceipt(hash) : null, text: hash ? "" : s.toLowerCase().replace(/\s+/g, "") };
}

/**
 * Раздел «Чеки»: все чеки заказов с сайта, поиск по номеру/телефону/ссылке из QR,
 * сканер QR камерой (в магазине), бумажный чек и оформление обмена или возврата.
 */
export function Receipts({ orders, onPatch, demo }: { orders: Order[]; onPatch: (id: number, patch: Partial<Order>) => void; demo: boolean }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sel, setSel] = useState<number | null>(null);
  const [scan, setScan] = useState(false);

  const withCode = useMemo(() => orders.filter((o) => o.code), [orders]);
  const { receipt: scanned, text } = parseQuery(q);
  // отсканированный чек ищем в базе по номеру
  const scannedOrder = scanned ? withCode.find((o) => o.code === scanned.c) : undefined;

  const list = useMemo(
    () =>
      withCode.filter((o) => {
        if (filter === "none" ? o.after_sale : filter !== "all" && o.after_sale !== filter) return false;
        if (!text) return true;
        return `${o.code} ${o.phone} ${o.name}`.toLowerCase().replace(/\s+/g, "").includes(text);
      }),
    [withCode, filter, text],
  );

  const current = scannedOrder ?? (sel != null ? withCode.find((o) => o.id === sel) : undefined) ?? (text && list.length === 1 ? list[0] : undefined);
  const paper = current ? toReceipt(current) : scanned;

  const stats = {
    count: withCode.length,
    total: withCode.reduce((s, o) => s + (o.status === "cancelled" ? 0 : o.total), 0),
    exchange: withCode.filter((o) => o.after_sale === "exchange").length,
    refund: withCode.filter((o) => o.after_sale === "refund").length,
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-medium sm:text-4xl">Чеки</h1>
        <button type="button" className="a-btn a-btn-gold" onClick={() => setScan(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10" />
          </svg>
          Сканировать QR
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Чеков", String(stats.count)],
          ["На сумму", sum(stats.total)],
          ["Обменов", String(stats.exchange)],
          ["Возвратов", String(stats.refund)],
        ].map(([l, v]) => (
          <div key={l} className="a-panel px-5 py-4">
            <p className="text-xs text-[var(--a-muted)]">{l}</p>
            <p className="a-num mt-1 font-display text-2xl">{v}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className="a-input sm:max-w-md"
          type="search"
          placeholder="Номер чека, телефон или ссылка из QR"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(null);
          }}
          aria-label="Найти чек"
        />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Обращения">
          {(
            [
              ["all", "Все"],
              ["exchange", "Обмены"],
              ["refund", "Возвраты"],
              ["none", "Без обращений"],
            ] as [Filter, string][]
          ).map(([f, l]) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className="a-tab rounded-full border border-[var(--a-line)] px-3 py-1.5 text-sm text-[var(--a-muted)] hover:text-[var(--a-text)]">
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="a-panel overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="text-xs text-[var(--a-muted)]">
              <tr className="border-b border-[var(--a-line)]">
                <th className="px-4 py-3 font-medium">Чек</th>
                <th className="px-4 py-3 font-medium">Покупатель</th>
                <th className="px-4 py-3 font-medium">Получение</th>
                <th className="px-4 py-3 text-right font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Обращение</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--a-line)]">
              {list.map((o) => {
                const active = current?.id === o.id;
                return (
                  <tr
                    key={o.id}
                    onClick={() => setSel(o.id)}
                    className={`cursor-pointer hover:bg-[var(--a-raised)]/40 ${active ? "bg-[var(--a-raised)]/70" : ""}`}
                  >
                    <td className="px-4 py-2.5">
                      <button type="button" className={`font-mono text-[0.82rem] ${active ? "text-[var(--a-gold)]" : ""}`}>
                        {o.code}
                      </button>
                      <span className="block text-xs text-[var(--a-muted)]">{when(o.created_at)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="block">{o.name}</span>
                      <span className="a-num block text-xs text-[var(--a-muted)]">{o.phone}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-[var(--a-muted)]">{methodLabel(o.method)}</td>
                    <td className="a-num whitespace-nowrap px-4 py-2.5 text-right">{sum(o.total)}</td>
                    <td className="px-4 py-2.5">
                      {o.after_sale ? (
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="a-chip" style={{ color: AFTER[o.after_sale].color, background: "color-mix(in srgb, currentColor 13%, transparent)" }}>
                            {AFTER[o.after_sale].label}
                          </span>
                          <StaffBadge name={o.after_sale_by} />
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--a-muted)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {list.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--a-muted)]">
              {withCode.length ? "Ничего не нашлось." : "Чеков пока нет: они появляются, когда покупатели оформляют заказ на сайте."}
            </p>
          ) : null}
        </div>

        <aside className="xl:sticky xl:top-6">
          {paper ? (
            <ReceiptCard key={paper.c} paper={paper} order={current} onPatch={onPatch} demo={demo} />
          ) : (
            <p className="a-panel px-5 py-8 text-center text-sm text-[var(--a-muted)]">
              Выберите чек в списке, найдите по номеру или отсканируйте QR с чека покупателя.
            </p>
          )}
        </aside>
      </div>

      {scan ? (
        <Scanner
          onClose={() => setScan(false)}
          onResult={(v) => {
            setScan(false);
            setQ(v);
            setSel(null);
          }}
        />
      ) : null}
    </>
  );
}

/** Чек + обмен/возврат */
function ReceiptCard({ paper, order, onPatch, demo }: { paper: ReceiptData; order?: Order; onPatch: (id: number, patch: Partial<Order>) => void; demo: boolean }) {
  const [note, setNote] = useState(order?.after_sale_note ?? "");
  const url = receiptUrl(paper);
  const mark = (after_sale: "exchange" | "refund" | null) => {
    if (!order) return;
    onPatch(order.id, after_sale ? { after_sale, after_sale_note: note.trim() || null, after_sale_at: new Date().toISOString() } : { after_sale: null, after_sale_note: null, after_sale_at: null });
  };
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-[#e9e4dc] p-4">
        <ReceiptPaper r={paper} lang={paper.l} className="!max-w-none text-[0.78rem]" />
      </div>
      <div className="a-panel space-y-3 p-4 text-sm">
        {order ? (
          <>
            <p className="flex flex-wrap items-center justify-between gap-2">
              <span>
                {order.name} · <a className="a-num underline underline-offset-4" href={`tel:${order.phone.replace(/[^\d+]/g, "")}`}>{order.phone}</a>
              </span>
              {order.after_sale ? (
                <span className="a-chip" style={{ color: AFTER[order.after_sale].color, background: "color-mix(in srgb, currentColor 13%, transparent)" }}>
                  {AFTER[order.after_sale].label} · {when(order.after_sale_at ?? order.created_at)}
                </span>
              ) : null}
            </p>
            {order.after_sale_by ? (
              <p>
                <StaffBadge name={order.after_sale_by} action="оформила" />
              </p>
            ) : null}
            <label className="block">
              <span className="mb-1.5 block text-xs text-[var(--a-muted)]">Комментарий: что меняем или возвращаем, причина, сумма</span>
              <textarea className="a-input min-h-20" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Например: поменяли оттенок 012 на 001" />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="a-btn a-btn-gold" onClick={() => mark("exchange")}>
                Оформить обмен
              </button>
              <button type="button" className="a-btn a-btn-line" onClick={() => mark("refund")}>
                Оформить возврат
              </button>
              {order.after_sale ? (
                <button type="button" className="a-btn a-btn-quiet" onClick={() => mark(null)}>
                  Снять отметку
                </button>
              ) : null}
            </div>
            {demo ? <p className="text-xs text-[var(--a-muted)]">Демо: отметки видны, но не сохраняются.</p> : null}
          </>
        ) : (
          <p className="text-[var(--a-muted)]">Этого чека нет в базе: заказ мог быть оформлен до подключения базы. Данные выше — из самого QR-кода.</p>
        )}
        <a className="a-btn a-btn-quiet -ml-3" href={url} target="_blank" rel="noopener">
          Открыть чек как у покупателя ↗
        </a>
      </div>
    </div>
  );
}

/** Сканер QR камерой (Chrome/Android, Safari 17+); иначе — подсказка вставить ссылку */
function Scanner({ onClose, onResult }: { onClose: () => void; onResult: (v: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState("");
  const done = useRef(onResult);
  done.current = onResult;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stop = false;
    type Detector = { detect: (s: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
    const BD = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
    if (!BD) {
      setErr("Этот браузер не умеет читать QR камерой. Откройте админку в Chrome на телефоне или отсканируйте QR обычной камерой и вставьте ссылку в поиск.");
      return;
    }
    const detector = new BD({ formats: ["qr_code"] });
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(async (s) => {
        stream = s;
        if (!video.current) return;
        video.current.srcObject = s;
        await video.current.play();
        const tick = async () => {
          if (stop || !video.current) return;
          try {
            const codes = await detector.detect(video.current);
            if (codes[0]?.rawValue) return done.current(codes[0].rawValue);
          } catch {
            /* кадр не готов */
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      })
      .catch(() => setErr("Нет доступа к камере. Разрешите камеру в настройках браузера или вставьте ссылку из QR в поиск."));
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-label="Сканер QR" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="a-panel w-full max-w-sm p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-lg">Наведите камеру на QR чека</p>
          <button type="button" className="a-btn a-btn-quiet" onClick={onClose}>
            Закрыть
          </button>
        </div>
        {err ? (
          <p className="text-sm text-[var(--a-muted)]">{err}</p>
        ) : (
          <div className="relative aspect-square overflow-hidden rounded-xl bg-black">
            <video ref={video} className="size-full object-cover" muted playsInline />
            <span aria-hidden className="absolute inset-[18%] rounded-2xl border-2 border-[var(--a-gold)]" />
          </div>
        )}
      </div>
    </div>
  );
}
