"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { channelReviews, type ChannelReview } from "@/data/channel-reviews";
import { getProduct } from "@/data/products";
import { getDict, type Locale } from "@/lib/i18n";
import { fetchReviews, reviewsEnabled, submitReview, type Review } from "@/lib/reviews";
import { TELEGRAM, telegramLink } from "@/lib/site";

const STAR = "M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8L12 2.8z";

/** Звёзды для показа оценки (дробная — частично закрашена) */
export function Stars({ value, size = 16, label }: { value: number; size?: number; label?: string }) {
  const id = useId();
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label ?? `${value.toFixed(1)} / 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <defs>
              <linearGradient id={`${id}-${i}`}>
                <stop offset={`${fill * 100}%`} stopColor="var(--gold-deep)" />
                <stop offset={`${fill * 100}%`} stopColor="var(--line)" />
              </linearGradient>
            </defs>
            <path d={STAR} fill={`url(#${id}-${i})`} />
          </svg>
        );
      })}
    </span>
  );
}

/** Выбор оценки 1–5: радиокнопки, работает с клавиатуры */
function StarInput({ value, onChange, lang }: { value: number; onChange: (n: number) => void; lang: Locale }) {
  const t = getDict(lang).reviews;
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const name = useId();
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{t.rating}</legend>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="cursor-pointer rounded-md p-0.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-rose"
            onMouseEnter={() => setHover(n)}
          >
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="sr-only"
              aria-label={t.ratingLabel(n)}
            />
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              aria-hidden
              className={`transition-transform duration-150 ${shown >= n ? "scale-110" : ""}`}
            >
              <path d={STAR} fill={shown >= n ? "var(--gold-deep)" : "var(--line)"} />
            </svg>
          </label>
        ))}
        {value ? <span className="ml-2 text-sm text-cocoa">{t.ratingLabel(value)}</span> : null}
      </div>
    </fieldset>
  );
}

function ReviewForm({ slug, productName, lang, onSent }: { slug: string; productName: string; lang: Locale; onSent: () => void }) {
  const t = getDict(lang).reviews;
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [trap, setTrap] = useState(""); // поле-ловушка для ботов, человеку не видно
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "sentTg" | "error">("idle");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!rating) err.rating = t.errRating;
    if (!name.trim()) err.name = t.errName;
    if (text.trim().length < 3) err.text = t.errText;
    setErrors(err);
    if (Object.keys(err).length || trap) return;

    if (!reviewsEnabled) {
      // базы ещё нет — отзыв уходит менеджеру
      const msg = `Отзыв с сайта beautybrand.uz\n${productName}\nОценка: ${"★".repeat(rating)}${"☆".repeat(5 - rating)} (${rating}/5)\nИмя: ${name.trim()}\n\n${text.trim()}`;
      window.open(telegramLink(TELEGRAM.manager, msg), "_blank", "noopener");
      setState("sentTg");
      return;
    }
    setState("sending");
    try {
      await submitReview({ product: slug, name: name.trim(), rating, text: text.trim(), lang });
      setState("sent");
      onSent();
    } catch {
      setState("error");
    }
  }

  if (state === "sent" || state === "sentTg") {
    return (
      <div className="rounded-2xl bg-well p-5" role="status">
        <Stars value={rating} size={18} />
        <p className="mt-2 font-medium">{state === "sent" ? t.thanks : t.thanksTg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={send} noValidate className="space-y-4 rounded-2xl border border-line bg-white/70 p-5">
      <p className="font-display text-xl font-medium">{t.write}</p>
      <div>
        <StarInput value={rating} onChange={setRating} lang={lang} />
        {errors.rating ? <p className="mt-1 text-xs text-rose" role="alert">{errors.rating}</p> : null}
      </div>
      <div>
        <label htmlFor={`rv-name-${slug}`} className="mb-1.5 block text-sm font-medium">
          {t.name}
        </label>
        <input
          id={`rv-name-${slug}`}
          className="field"
          autoComplete="given-name"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
        />
        {errors.name ? <p className="mt-1 text-xs text-rose" role="alert">{errors.name}</p> : null}
      </div>
      <div>
        <label htmlFor={`rv-text-${slug}`} className="mb-1.5 block text-sm font-medium">
          {t.text}
        </label>
        <textarea
          id={`rv-text-${slug}`}
          className="field min-h-28 resize-y"
          maxLength={1500}
          placeholder={t.textHint}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-invalid={!!errors.text}
        />
        {errors.text ? <p className="mt-1 text-xs text-rose" role="alert">{errors.text}</p> : null}
      </div>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
      />
      {state === "error" ? <p className="text-sm text-rose" role="alert">{t.errSend}</p> : null}
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={state === "sending"}>
        {state === "sending" ? t.sending : t.submit}
      </button>
    </form>
  );
}

function ReviewCard({ r, lang }: { r: Review; lang: Locale }) {
  const date = new Date(r.created_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <li className="rounded-2xl border border-line bg-white/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Stars value={r.rating} />
        <span className="text-xs text-cocoa">{date}</span>
      </div>
      <p className="mt-3 whitespace-pre-line leading-relaxed">{r.text}</p>
      <p className="mt-3 text-sm font-semibold">{r.name}</p>
    </li>
  );
}

function ChannelCard({ c, lang }: { c: ChannelReview; lang: Locale }) {
  const t = getDict(lang).reviews;
  const product = c.slug ? getProduct(c.slug) : undefined;
  return (
    <li className="flex flex-col rounded-2xl border border-line bg-white/70 p-5">
      {c.rating ? <Stars value={c.rating} /> : null}
      <p className={`${c.rating ? "mt-3" : ""} flex-1 leading-relaxed`}>«{c.text}»</p>
      <p className="mt-4 text-sm font-semibold">
        {product ? (
          <Link href={`/${lang}/p/${product.slug}`} className="hover:text-rose-deep">
            {c.fragrance}
          </Link>
        ) : (
          c.fragrance
        )}
      </p>
      <a
        href={telegramLink(`Maisondemari/${c.post}`)}
        target="_blank"
        rel="noopener"
        className="mt-0.5 text-xs text-cocoa underline-offset-4 hover:underline"
      >
        {t.fromChannel}
      </a>
    </li>
  );
}

/** Отзывы на странице товара: средняя оценка, список и форма */
export function ProductReviews({ slug, productName, lang }: { slug: string; productName: string; lang: Locale }) {
  const t = getDict(lang).reviews;
  const [list, setList] = useState<Review[] | null>(reviewsEnabled ? null : []);
  const [failed, setFailed] = useState(false);
  const quotes = channelReviews.filter((c) => c.slug === slug);

  useEffect(() => {
    if (!reviewsEnabled) return;
    fetchReviews(slug)
      .then(setList)
      .catch(() => {
        setFailed(true);
        setList([]);
      });
  }, [slug]);

  const avg = list && list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

  return (
    <section className="mt-16 border-t border-line pt-10" aria-labelledby="reviews-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-title" className="font-display text-3xl font-medium">
          {t.product}
        </h2>
        {list && list.length ? (
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl">{avg.toFixed(1)}</span>
            <span>
              <Stars value={avg} size={18} />
              <span className="block text-xs text-cocoa">{t.count(list.length)}</span>
            </span>
          </div>
        ) : null}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-start">
        <div>
          {list === null ? (
            <div className="h-28 animate-pulse rounded-2xl bg-well" aria-hidden />
          ) : list.length || quotes.length ? (
            <ul className="space-y-3">
              {list.map((r) => (
                <ReviewCard key={r.id} r={r} lang={lang} />
              ))}
              {quotes.map((c) => (
                <ChannelCard key={c.id} c={c} lang={lang} />
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl bg-well p-5 text-cocoa">{failed ? t.loadError : t.empty}</p>
          )}
        </div>
        <ReviewForm slug={slug} productName={productName} lang={lang} onSent={() => {}} />
      </div>
    </section>
  );
}

/** Лента отзывов для главной и бутика */
export function ReviewsFeed({ lang }: { lang: Locale }) {
  const t = getDict(lang).reviews;
  const [live, setLive] = useState<Review[]>([]);
  useEffect(() => {
    fetchReviews(undefined, 12).then(setLive).catch(() => setLive([]));
  }, []);

  return (
    <section className="pt-20" aria-labelledby="feed-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="feed-title" className="font-display text-3xl font-medium sm:text-4xl">
          {t.title}
        </h2>
        <p className="mt-2 max-w-[60ch] text-cocoa">{t.lead}</p>
      </div>
      {/* горизонтальная лента с прокруткой пальцем, карточки «прилипают» */}
      <ul className="mx-auto mt-6 flex max-w-6xl snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:thin] sm:px-6">
        {live.map((r) => {
          const p = getProduct(r.product);
          return (
            <li key={r.id} className="w-[min(20rem,82vw)] shrink-0 snap-start rounded-2xl border border-line bg-white/70 p-5">
              <Stars value={r.rating} />
              <p className="mt-3 line-clamp-5 leading-relaxed">{r.text}</p>
              <p className="mt-4 text-sm font-semibold">{r.name}</p>
              {p ? (
                <Link href={`/${lang}/p/${p.slug}`} className="text-xs text-cocoa hover:text-ink">
                  {p.brand} {p.name}
                </Link>
              ) : null}
            </li>
          );
        })}
        {channelReviews.map((c) => (
          <li key={c.id} className="w-[min(20rem,82vw)] shrink-0 snap-start list-none">
            <ul className="h-full">
              <ChannelCard c={c} lang={lang} />
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
