"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "./cart";
import { TelegramIcon } from "./cart-drawer";
import { getProduct } from "@/data/products";
import { track } from "@/lib/track";
import { getDict, type Locale } from "@/lib/i18n";
import { TELEGRAM, formatPrice, telegramLink } from "@/lib/site";

type Slide = { kind: "image"; src: string } | { kind: "video"; src: string; poster: string };

export function Gallery({ images, video, alt }: { images: string[]; video?: string; alt: string }) {
  const slides: Slide[] = [
    ...images.map((src) => ({ kind: "image" as const, src })),
    ...(video ? [{ kind: "video" as const, src: video, poster: images[0] ?? "" }] : []),
  ];
  const [active, setActive] = useState(0);
  const current = slides[active];
  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-well">
        {current?.kind === "image" ? (
          <Image src={current.src} alt={alt} fill priority sizes="(min-width: 768px) 21rem, 90vw" className="object-cover" />
        ) : current?.kind === "video" ? (
          <video
            key={current.src}
            src={current.src}
            poster={current.poster}
            className="absolute inset-0 size-full bg-paper object-contain"
            controls
            autoPlay
            muted
            playsInline
          />
        ) : null}
      </div>
      {slides.length > 1 ? (
        <div className="mt-2.5 flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={s.kind === "video" ? `${alt}, видео` : `${alt}, ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              className={`relative size-12 overflow-hidden rounded-lg bg-well ring-offset-2 ring-offset-paper transition ${
                i === active ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={s.kind === "video" ? s.poster : s.src} alt="" fill sizes="64px" className="object-cover" />
              {s.kind === "video" ? (
                <span className="absolute inset-0 grid place-items-center bg-ink/35 text-paper">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                  </svg>
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function BuyBox({ slug, lang }: { slug: string; lang: Locale }) {
  const t = getDict(lang);
  const p = getProduct(slug)!;
  const { add, setOpen } = useCart();
  useEffect(() => track("view", slug), [slug]);
  // флаконы под заказ (цена в $) заказываются через Telegram, а не через корзину
  const isUsd = !!p.usd;
  const options = p.variants ?? p.usd?.map((u) => ({ label: u.label, price: u.usd }));
  const [variant, setVariant] = useState(options?.[0]?.label);
  const [added, setAdded] = useState(false);
  const price = options?.find((v) => v.label === variant)?.price ?? p.price;
  const priceText = isUsd ? `${price} $` : formatPrice(price, t.currency);
  const fullName = `${p.brand} ${p.name}${variant ? ` (${variant})` : ""}`;

  return (
    <div>
      {options ? (
        <fieldset className="mt-7">
          <legend className="mb-2.5 text-sm font-medium">{t.product.variant}</legend>
          <div className="flex flex-wrap gap-2">
            {options.map((v) => (
              <label
                key={v.label}
                className={`cursor-pointer rounded-full border px-4 py-2.5 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-rose ${
                  variant === v.label ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-cocoa"
                }`}
              >
                <input
                  type="radio"
                  name="variant"
                  className="sr-only"
                  checked={variant === v.label}
                  onChange={() => {
                    setVariant(v.label);
                    setAdded(false);
                  }}
                />
                {v.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-7 flex items-end gap-3">
        <span className="tag tag-lg">{priceText}</span>
        {p.oldPrice ? <s className="pb-1 text-sm text-cocoa">{formatPrice(p.oldPrice, t.currency)}</s> : null}
      </div>

      {p.bottle ? (
        <p className="mt-4 text-sm text-cocoa">
          {t.product.bottle}: {p.bottle}
        </p>
      ) : null}

      <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
        {isUsd ? (
          <a
            href={telegramLink(TELEGRAM.manager, t.product.orderText(fullName, priceText))}
            target="_blank"
            rel="noopener"
            className="btn btn-primary flex-1"
          >
            <TelegramIcon />
            {t.product.order}
          </a>
        ) : added ? (
          <button type="button" className="btn btn-primary flex-1 bg-rose" onClick={() => setOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {t.product.added}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary flex-1"
            onClick={() => {
              add(p.slug, variant);
              setAdded(true);
            }}
          >
            {t.product.add}
          </button>
        )}
        {isUsd ? null : (
        <a
          href={telegramLink(TELEGRAM.manager, t.product.askText(fullName))}
          target="_blank"
          rel="noopener"
          className="btn btn-ghost flex-1"
        >
          <TelegramIcon />
          {t.product.ask}
        </a>
        )}
      </div>
    </div>
  );
}
