"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { lineProduct, useCart } from "./cart";
import { getDict, type Locale } from "@/lib/i18n";
import { STORES, TELEGRAM, formatPrice, telegramLink } from "@/lib/site";
import { rest, supabaseEnabled } from "@/lib/supabase";
import { productHref } from "@/lib/extra-products";

type Method = string; // id магазина или "delivery"

export function CartDrawer({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const { lines, total, open, setOpen, setQty, clear } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [method, setMethod] = useState<Method>(STORES[0].id);
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // Escape закрывает, фокус уходит в панель, прокрутка страницы блокируется
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) setSent(false);
  }, [open]);

  function buildMessage() {
    const rows = lines
      .map((l, i) => {
        const info = lineProduct(l);
        if (!info) return null;
        const { product, price } = info;
        const v = l.variant ? ` (${l.variant})` : "";
        return `${i + 1}. ${product.brand} — ${product.name}${v} × ${l.qty} = ${formatPrice(price * l.qty, t.currency)}`;
      })
      .filter(Boolean);
    const store = STORES.find((s) => s.id === method);
    const how = store
      ? `${t.cart.msgPickup}: ${store.address[lang]}`
      : `${t.cart.msgDelivery}: ${address.trim()}`;
    return [
      t.cart.msgHello,
      "",
      ...rows,
      "",
      `${t.cart.msgTotal}: ${formatPrice(total, t.currency)}`,
      "",
      `${t.cart.msgName}: ${name.trim()}`,
      `${t.cart.msgPhone}: ${phone.trim()}`,
      how,
      comment.trim() ? `${t.cart.msgComment}: ${comment.trim()}` : null,
    ]
      .filter((r) => r !== null)
      .join("\n");
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t.cart.errName;
    if (phone.replace(/\D/g, "").length < 9) e.phone = t.cart.errPhone;
    if (method === "delivery" && !address.trim()) e.address = t.cart.errAddress;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /** Копия заказа в базу для админки. Telegram остаётся основным каналом, поэтому ошибка здесь не мешает заказу. */
  function saveOrder() {
    if (!supabaseEnabled) return;
    const items = lines
      .map((l) => {
        const info = lineProduct(l);
        return info
          ? { slug: l.slug, name: `${info.product.brand} ${info.product.name}`, variant: l.variant ?? null, qty: l.qty, price: info.price }
          : null;
      })
      .filter(Boolean);
    rest("orders", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim(),
        method,
        address: method === "delivery" ? address.trim() : null,
        comment: comment.trim() || null,
        items,
        total,
        lang,
      }),
    }).catch(() => {});
  }

  function send() {
    if (!validate()) return;
    window.open(telegramLink(TELEGRAM.manager, buildMessage()), "_blank", "noopener");
    saveOrder();
    setSent(true);
  }

  async function copy() {
    if (!validate()) return;
    try {
      await navigator.clipboard.writeText(buildMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* буфер недоступен */
    }
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`drawer-backdrop absolute inset-0 bg-ink/40 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.cart.title}
        tabIndex={-1}
        inert={!open}
        className={`drawer absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl outline-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="font-display text-lg font-medium">{t.cart.title}</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="-mr-2 grid size-10 place-items-center rounded-full text-cocoa hover:bg-well hover:text-ink"
            aria-label={t.cart.close}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <p className="text-cocoa">{t.cart.empty}</p>
            <Link href={`/${lang}/catalog`} onClick={() => setOpen(false)} className="btn btn-primary">
              {t.cart.emptyAction}
            </Link>
          </div>
        ) : sent ? (
          <div className="flex flex-1 flex-col justify-center gap-4 px-6">
            <p className="font-display text-xl font-medium">{t.cart.sentTitle}</p>
            <p className="text-cocoa">{t.cart.sentText}</p>
            <div className="mt-2 flex flex-col gap-2.5">
              <button type="button" onClick={copy} className="btn btn-ghost">
                {copied ? t.cart.copied : t.cart.copy}
              </button>
              <button
                type="button"
                onClick={() => {
                  clear();
                  setOpen(false);
                }}
                className="btn btn-primary"
              >
                {t.cart.clear}
              </button>
              <button type="button" onClick={() => setSent(false)} className="py-2 text-sm text-cocoa underline underline-offset-4">
                {t.cart.keep}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <ul className="divide-y divide-line px-5">
              {lines.map((l) => {
                const info = lineProduct(l);
                if (!info) return null;
                const { product, price } = info;
                return (
                  <li key={`${l.slug}|${l.variant ?? ""}`} className="flex gap-3.5 py-4">
                    <Link
                      href={productHref(lang, product)}
                      onClick={() => setOpen(false)}
                      className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-well"
                    >
                      {product.images[0] ? (
                        <Image src={product.images[0]} alt="" fill sizes="80px" className="object-cover" />
                      ) : null}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="text-xs text-cocoa">{product.brand}</p>
                      <p className="text-sm font-medium leading-snug">
                        {product.name}
                        {l.variant ? <span className="text-cocoa">, {l.variant}</span> : null}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full border border-line">
                          <button
                            type="button"
                            className="grid size-8 place-items-center text-lg text-cocoa hover:text-ink"
                            onClick={() => setQty(l.slug, l.variant, l.qty - 1)}
                            aria-label={l.qty === 1 ? t.cart.remove : t.cart.less}
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums">{l.qty}</span>
                          <button
                            type="button"
                            className="grid size-8 place-items-center text-lg text-cocoa hover:text-ink"
                            onClick={() => setQty(l.slug, l.variant, l.qty + 1)}
                            aria-label={t.cart.more}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">{formatPrice(price * l.qty, t.currency)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between border-y border-line bg-well px-5 py-4">
              <span className="text-sm font-semibold">{t.cart.total}</span>
              <span className="tag tag-lg">{formatPrice(total, t.currency)}</span>
            </div>

            <form
              className="space-y-4 px-5 py-6"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <p className="font-display text-base font-medium">{t.cart.form}</p>
              <Field label={t.cart.name} error={errors.name} id="c-name">
                <input
                  id="c-name"
                  className="field"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                />
              </Field>
              <Field label={t.cart.phone} error={errors.phone} id="c-phone">
                <input
                  id="c-phone"
                  className="field"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t.cart.phoneHint}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={!!errors.phone}
                />
              </Field>

              <fieldset>
                <legend className="mb-2 text-sm font-medium">{t.cart.method}</legend>
                <div className="space-y-2">
                  {[...STORES.map((s) => ({ id: s.id, label: t.cart.pickupAt(s.address[lang]) })), { id: "delivery", label: t.cart.delivery }].map(
                    (o) => (
                      <label
                        key={o.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition-colors ${
                          method === o.id ? "border-ink bg-white" : "border-line hover:border-cocoa"
                        }`}
                      >
                        <input
                          type="radio"
                          name="method"
                          value={o.id}
                          checked={method === o.id}
                          onChange={() => setMethod(o.id)}
                          className="size-4 accent-[var(--rose)]"
                        />
                        {o.label}
                      </label>
                    ),
                  )}
                </div>
              </fieldset>

              {method === "delivery" ? (
                <Field label={t.cart.address} error={errors.address} id="c-address">
                  <input
                    id="c-address"
                    className="field"
                    autoComplete="street-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    aria-invalid={!!errors.address}
                  />
                </Field>
              ) : null}

              <Field label={t.cart.comment} id="c-comment">
                <textarea
                  id="c-comment"
                  className="field min-h-20 resize-y"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Field>

              <p className="text-xs leading-relaxed text-cocoa">{t.cart.note}</p>

              <button type="submit" className="btn btn-primary w-full">
                <TelegramIcon />
                {t.cart.send}
              </button>
              <button type="button" onClick={copy} className="w-full py-1 text-sm text-cocoa underline underline-offset-4 hover:text-ink">
                {copied ? t.cart.copied : t.cart.copy}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, id, children }: { label: string; error?: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-rose" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TelegramIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M21.4 4.2 2.9 11.3c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.8.8.4 0 .6-.2.9-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.4-1.5ZM9.7 14.3l-.4 4-1.5-4.8L18.4 7l-8.7 7.3Z" />
    </svg>
  );
}
