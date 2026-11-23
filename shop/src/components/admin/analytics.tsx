"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, products, type Category } from "@/data/products";
import { formatPrice } from "@/lib/site";

/* ——— типы (совпадают с admin-app) ——— */
export type AOrder = {
  id: number;
  created_at: string;
  method: string;
  items: { slug: string; name: string; variant: string | null; qty: number; price: number }[];
  total: number;
  lang: "ru" | "uz";
  status: string;
};
export type AEvent = { created_at: string; type: "view" | "add"; product: string; lang: "ru" | "uz" };
export type AReview = { product: string; rating: number; status: string };

/* Цвета графиков на тёмной панели — проверены валидатором dataviz (тёмный режим, поверхность #1e1713) */
export const C1 = "#b98a35"; // золото — основной ряд
export const C2 = "#c85c7c"; // роза — второй ряд
const GRID = "rgba(207,174,120,0.12)";

const sum = (n: number) => formatPrice(n, "сум");
const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(".", ",")} млн` : n >= 1000 ? `${Math.round(n / 1000)} тыс` : String(n);
const CATEGORY_RU: Record<Category, string> = {
  makeup: "Макияж", skin: "Уход за лицом", hair: "Волосы", fragrance: "Парфюм", body: "Тело", tools: "Кисти", sets: "Наборы",
};
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const bySlug = new Map(products.map((p) => [p.slug, p]));
/** Время Ташкента (UTC+5) */
const tz = (iso: string) => new Date(+new Date(iso) + 5 * 3600_000);
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/* ——————————————— демо-данные (примеры, детерминированные) ——————————————— */

export function buildDemo(): { orders: AOrder[]; events: AEvent[] } {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pool = products.filter((p) => !p.usd);
  // «популярность» товара — чтобы спрос был неравномерным, как в жизни
  const weight = pool.map((p, i) => 0.3 + ((i * 37) % 11) / 4 + (p.oldPrice ? 2 : 0) + (p.boutique ? 0.8 : 0));
  const total = weight.reduce((a, b) => a + b, 0);
  const pick = () => {
    let r = rnd() * total;
    for (let i = 0; i < pool.length; i++) if ((r -= weight[i]) <= 0) return pool[i];
    return pool[0];
  };
  const now = Date.now();
  const orders: AOrder[] = [];
  const events: AEvent[] = [];
  for (let d = 89; d >= 0; d--) {
    const dayStart = now - d * 86400_000;
    const weekday = new Date(dayStart).getUTCDay();
    const n = Math.round((weekday === 0 || weekday === 6 ? 3.2 : 2.1) * (0.6 + rnd() * 0.9) * (1 + (89 - d) / 140));
    for (let k = 0; k < n; k++) {
      const hour = 9 + Math.floor(rnd() * 12);
      const t = new Date(Math.floor(dayStart / 86400_000) * 86400_000 + (hour - 5) * 3600_000 + rnd() * 3600_000);
      if (+t > now) continue;
      const items = Array.from({ length: 1 + Math.floor(rnd() * 2.2) }, () => {
        const p = pick();
        const v = p.variants?.[Math.floor(rnd() * p.variants.length)];
        return { slug: p.slug, name: `${p.brand} ${p.name}`, variant: v?.label ?? null, qty: rnd() < 0.15 ? 2 : 1, price: v?.price ?? p.price };
      });
      orders.push({
        id: 1000 + orders.length,
        created_at: t.toISOString(),
        method: rnd() < 0.62 ? (rnd() < 0.6 ? "c5" : "c1") : "delivery",
        items,
        total: items.reduce((s, i) => s + i.qty * i.price, 0),
        lang: rnd() < 0.72 ? "ru" : "uz",
        status: rnd() < 0.05 ? "cancelled" : "done",
      });
    }
    // просмотры и корзины — больше, чем заказов; у части товаров интерес без покупок
    for (let k = 0; k < 26 + rnd() * 18; k++) {
      const p = rnd() < 0.25 ? pool[Math.floor(rnd() * pool.length)] : pick();
      const t = new Date(dayStart - rnd() * 86400_000 * 0.9);
      events.push({ created_at: t.toISOString(), type: rnd() < 0.2 ? "add" : "view", product: p.slug, lang: rnd() < 0.72 ? "ru" : "uz" });
    }
  }
  return { orders: orders.reverse(), events };
}

/* ——————————————— расчёты ——————————————— */

type CatRow = { category: Category; label: string; qty: number; revenue: number; orders: number; views: number; adds: number; items: number };
type ProductRow = { slug: string; name: string; brand: string; category: Category; qty: number; revenue: number; orders: number; views: number; adds: number; rating: number | null };

function compute(orders: AOrder[], events: AEvent[], reviews: AReview[], days: number) {
  const from = Date.now() - days * 86400_000;
  const live = orders.filter((o) => o.status !== "cancelled" && +new Date(o.created_at) >= from);
  const ev = events.filter((e) => +new Date(e.created_at) >= from);
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const qty = live.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);

  // выручка по дням
  const daily = new Map<string, number>();
  for (let d = days - 1; d >= 0; d--) daily.set(dayKey(tz(new Date(Date.now() - d * 86400_000).toISOString())), 0);
  for (const o of live) {
    const k = dayKey(tz(o.created_at));
    if (daily.has(k)) daily.set(k, daily.get(k)! + o.total);
  }

  // по товарам
  const rows = new Map<string, ProductRow>();
  const row = (slug: string) => {
    let r = rows.get(slug);
    if (!r) {
      const p = bySlug.get(slug);
      r = { slug, name: p?.name ?? slug, brand: p?.brand ?? "", category: p?.category ?? "makeup", qty: 0, revenue: 0, orders: 0, views: 0, adds: 0, rating: null };
      rows.set(slug, r);
    }
    return r;
  };
  for (const o of live) {
    const seen = new Set<string>();
    for (const i of o.items) {
      const r = row(i.slug);
      r.qty += i.qty;
      r.revenue += i.qty * i.price;
      if (!seen.has(i.slug)) r.orders += 1;
      seen.add(i.slug);
    }
  }
  for (const e of ev) {
    if (!bySlug.has(e.product)) continue;
    const r = row(e.product);
    if (e.type === "view") r.views += 1;
    else r.adds += 1;
  }
  const ratings = new Map<string, number[]>();
  for (const r of reviews) if (r.status === "approved") ratings.set(r.product, [...(ratings.get(r.product) ?? []), r.rating]);
  for (const [slug, list] of ratings) row(slug).rating = list.reduce((a, b) => a + b, 0) / list.length;

  const productRows = [...rows.values()];

  // по разделам: заказ считается один раз на раздел, даже если в нём два товара оттуда
  const catRows = new Map<Category, CatRow>();
  const cat = (c: Category) => {
    let r = catRows.get(c);
    if (!r) catRows.set(c, (r = { category: c, label: CATEGORY_RU[c], qty: 0, revenue: 0, orders: 0, views: 0, adds: 0, items: 0 }));
    return r;
  };
  for (const o of live) {
    const seen = new Set<Category>();
    for (const i of o.items) {
      const c = bySlug.get(i.slug)?.category;
      if (c && !seen.has(c)) {
        cat(c).orders += 1;
        seen.add(c);
      }
    }
  }
  for (const r of productRows) {
    const c = cat(r.category);
    c.qty += r.qty;
    c.revenue += r.revenue;
    c.views += r.views;
    c.adds += r.adds;
    if (r.qty) c.items += 1;
  }

  const catRevenue = new Map<Category, number>();
  const brandRevenue = new Map<string, number>();
  for (const r of productRows) {
    catRevenue.set(r.category, (catRevenue.get(r.category) ?? 0) + r.revenue);
    if (r.brand) brandRevenue.set(r.brand, (brandRevenue.get(r.brand) ?? 0) + r.revenue);
  }

  const heat: number[][] = Array.from({ length: 7 }, () => Array(13).fill(0)); // 8:00–20:59
  for (const o of live) {
    const d = tz(o.created_at);
    const wd = (d.getUTCDay() + 6) % 7;
    const h = d.getUTCHours() - 8;
    if (h >= 0 && h < 13) heat[wd][h] += 1;
  }

  const pickup = live.filter((o) => o.method !== "delivery").length;
  const ru = live.filter((o) => o.lang === "ru").length;
  const views = ev.filter((e) => e.type === "view").length;
  const adds = ev.filter((e) => e.type === "add").length;

  return {
    revenue, orders: live.length, avg: live.length ? revenue / live.length : 0, qty, views, adds,
    daily: [...daily.entries()].map(([k, v]) => ({ key: k, value: v })),
    productRows,
    catRows: [...catRows.values()],
    categories: CATEGORIES.map((c) => ({ label: CATEGORY_RU[c], value: catRevenue.get(c) ?? 0 })).filter((c) => c.value > 0).sort((a, b) => b.value - a.value),
    brands: [...brandRevenue.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8),
    heat,
    pickup, delivery: live.length - pickup,
    c5: live.filter((o) => o.method === "c5").length, c1: live.filter((o) => o.method === "c1").length,
    ru, uz: live.length - ru,
    interest: productRows.filter((r) => r.views >= 5 && r.orders === 0).sort((a, b) => b.views - a.views).slice(0, 6),
  };
}

/* ——————————————— графики ——————————————— */

/** Столбцы по дням (один ряд): ось, сетка, подсказка при наведении */
export function DailyColumns({ data, height = 200 }: { data: { key: string; value: number }[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = niceStep(max / 3);
  const top = Math.ceil(max / step) * step;
  const ticks = [0, step, step * 2, step * 3].filter((v) => v <= top);
  const W = 100 / data.length;
  const fmtDay = (k: string) => `${k.slice(8, 10)}.${k.slice(5, 7)}`;
  const fmtLong = (k: string) => new Date(k + "T00:00:00Z").toLocaleDateString("ru-RU", { day: "numeric", month: "long", timeZone: "UTC" });
  const showEvery = Math.ceil(data.length / 8);
  return (
    <div className="relative select-none" style={{ height }}>
      <div className="absolute inset-y-0 left-0 w-14">
        {ticks.map((v) => (
          <span key={v} className="a-num absolute right-2 -translate-y-1/2 text-[0.7rem] text-[var(--a-muted)]" style={{ top: `${(1 - v / top) * (height - 24)}px` }}>
            {compact(v)}
          </span>
        ))}
      </div>
      <div className="absolute inset-y-0 left-14 right-0">
        {ticks.map((v) => (
          <span key={v} className="absolute inset-x-0 h-px" style={{ top: `${(1 - v / top) * (height - 24)}px`, background: GRID }} />
        ))}
        <div className="absolute inset-x-0 top-0 flex items-end" style={{ height: height - 24 }} onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => (
            <div key={d.key} className="flex h-full flex-1 items-end justify-center px-[1px]" onMouseEnter={() => setHover(i)} style={{ maxWidth: `${W}%` }}>
              <span
                className="block w-full max-w-6 rounded-t transition-opacity"
                style={{ height: `${(d.value / top) * 100}%`, background: C1, opacity: hover === null || hover === i ? 1 : 0.45, minHeight: d.value ? 2 : 0 }}
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-5">
          {data.map((d, i) => (
            <span key={d.key} className="a-num flex-1 overflow-visible whitespace-nowrap text-center text-[0.65rem] text-[var(--a-muted)]">
              {i % showEvery === 0 ? fmtDay(d.key) : ""}
            </span>
          ))}
        </div>
        {hover !== null ? (
          <div
            className="a-panel pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap px-3 py-2 text-xs"
            style={{ left: `${(hover + 0.5) * W}%` }}
          >
            <span className="text-[var(--a-muted)]">{fmtLong(data[hover].key)}</span>
            <span className="a-num ml-2 font-semibold">{sum(data[hover].value)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function niceStep(x: number) {
  if (x <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  const n = x / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

/** Горизонтальные полосы (один ряд), значение у конца полосы */
export function BarList({ data, format = sum, color = C1 }: { data: { label: string; value: number; sub?: string }[]; format?: (n: number) => string; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label} className="grid grid-cols-[minmax(0,11rem)_1fr] items-center gap-3 text-sm" title={`${d.label}: ${format(d.value)}`}>
          <span className="truncate text-[var(--a-text)]">
            {d.label}
            {d.sub ? <span className="block truncate text-xs text-[var(--a-muted)]">{d.sub}</span> : null}
          </span>
          <span className="flex min-w-0 items-center gap-2">
            <span className="block h-3.5 rounded-r" style={{ width: `${Math.max(1.5, (d.value / max) * 78)}%`, background: color }} />
            <span className="a-num shrink-0 text-xs text-[var(--a-muted)]">{format(d.value)}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Доля двух вариантов: полоса из двух частей + легенда с числами */
function Split({ a, b, la, lb }: { a: number; b: number; la: string; lb: string }) {
  const t = Math.max(1, a + b);
  return (
    <div>
      <div className="flex h-3.5 gap-[2px] overflow-hidden rounded">
        <span style={{ width: `${(a / t) * 100}%`, background: C1 }} />
        <span style={{ width: `${(b / t) * 100}%`, background: C2 }} />
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {[[la, a, C1], [lb, b, C2]].map(([l, v, c]) => (
          <li key={l as string} className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ background: c as string }} aria-hidden />
            {l}
            <span className="a-num text-[var(--a-muted)]">
              {v as number} · {Math.round(((v as number) / t) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Тепловая карта: день недели × час (один оттенок, ярче — больше заказов) */
function Heatmap({ heat }: { heat: number[][] }) {
  const max = Math.max(1, ...heat.flat());
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] border-separate border-spacing-[3px] text-[0.65rem] text-[var(--a-muted)]">
        <thead>
          <tr>
            <th />
            {heat[0].map((_, h) => (
              <th key={h} className="a-num font-normal">{h % 2 === 0 ? `${h + 8}:00` : ""}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {heat.map((row, d) => (
            <tr key={d}>
              <th className="pr-1 text-left font-normal">{WEEKDAYS[d]}</th>
              {row.map((v, h) => (
                <td
                  key={h}
                  title={`${WEEKDAYS[d]}, ${h + 8}:00–${h + 8}:59 — заказов: ${v}`}
                  className="h-6 rounded"
                  style={{ background: v ? C1 : "rgba(207,174,120,0.06)", opacity: v ? 0.18 + 0.82 * (v / max) : 1 }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, sub, children, className = "" }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`a-panel min-w-0 p-5 ${className}`}>
      <h2 className="font-display text-lg">{title}</h2>
      {sub ? <p className="mt-0.5 text-xs text-[var(--a-muted)]">{sub}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="a-panel p-5">
      <p className="text-xs text-[var(--a-muted)]">{label}</p>
      <p className="a-num mt-2 font-display text-2xl sm:text-[1.7rem]">{value}</p>
      {note ? <p className="mt-1 text-xs text-[var(--a-muted)]">{note}</p> : null}
    </div>
  );
}

/* ——————————————— раздел «Аналитика» ——————————————— */

type SortKey = "revenue" | "qty" | "orders" | "views" | "adds" | "conv" | "rating";
type CatSortKey = "label" | "revenue" | "qty" | "orders" | "views" | "adds" | "conv";
const CAT_COLS: { key: CatSortKey | "share"; label: string }[] = [
  { key: "label", label: "Раздел" },
  { key: "revenue", label: "Выручка" },
  { key: "share", label: "Доля" },
  { key: "qty", label: "Продано, шт" },
  { key: "orders", label: "Заказов" },
  { key: "views", label: "Просмотры" },
  { key: "adds", label: "В корзину" },
  { key: "conv", label: "Конверсия" },
];
const COLS: { key: SortKey; label: string }[] = [
  { key: "revenue", label: "Выручка" },
  { key: "qty", label: "Продано, шт" },
  { key: "orders", label: "Заказов" },
  { key: "views", label: "Просмотры" },
  { key: "adds", label: "В корзину" },
  { key: "conv", label: "Конверсия" },
  { key: "rating", label: "Оценка" },
];

export function Analytics({ orders, events, reviews, demo }: { orders: AOrder[]; events: AEvent[]; reviews: AReview[]; demo: boolean }) {
  const [days, setDays] = useState(30);
  const [sort, setSort] = useState<SortKey>("revenue");
  const [all, setAll] = useState(false);
  const [catSort, setCatSort] = useState<CatSortKey>("revenue");
  const [section, setSection] = useState<Category | "all">("all");
  const a = useMemo(() => compute(orders, events, reviews, days), [orders, events, reviews, days]);
  const conv = (r: ProductRow) => (r.views ? r.orders / r.views : 0);
  const rows = a.productRows
    .filter((r) => section === "all" || r.category === section)
    .sort((x, y) =>
      sort === "conv" ? conv(y) - conv(x) : sort === "rating" ? (y.rating ?? -1) - (x.rating ?? -1) : (y[sort] as number) - (x[sort] as number),
    );
  const catConv = (r: CatRow) => (r.views ? r.orders / r.views : 0);
  const catTotal = a.catRows.reduce((s, r) => s + r.revenue, 0);
  const catRows = [...a.catRows].sort((x, y) =>
    catSort === "conv" ? catConv(y) - catConv(x) : catSort === "label" ? x.label.localeCompare(y.label, "ru") : y[catSort] - x[catSort],
  );
  const pickSection = (c: Category | "all") => {
    setSection(c);
    setAll(false);
  };
  const shown = all ? rows : rows.slice(0, 12);
  const noEvents = !demo && events.length === 0;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-medium sm:text-4xl">Аналитика</h1>
        <div className="flex gap-1.5" role="group" aria-label="Период">
          {[7, 30, 90].map((d) => (
            <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)} className="a-tab rounded-full border border-[var(--a-line)] px-3.5 py-1.5 text-sm text-[var(--a-muted)] hover:text-[var(--a-text)]">
              {d} дней
            </button>
          ))}
        </div>
      </div>
      {noEvents ? (
        <p className="a-panel mb-5 px-4 py-3 text-sm text-[var(--a-muted)]">
          Просмотры и добавления в корзину начнут считаться после подключения базы (таблица events в supabase/admin.sql). Пока аналитика строится только по заказам.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Выручка" value={sum(a.revenue)} note={`${a.orders} заказов`} />
        <Stat label="Средний чек" value={sum(Math.round(a.avg))} />
        <Stat label="Продано товаров" value={`${a.qty} шт`} />
        <Stat label="Из просмотра в корзину" value={a.views ? `${Math.round((a.adds / a.views) * 100)}%` : "—"} note={`${a.views} просмотров · ${a.adds} в корзину`} />
      </div>

      <Card title="Выручка по дням" sub="Без отменённых заказов. Наведите на столбец, чтобы увидеть сумму." className="mt-3">
        <DailyColumns data={a.daily} height={220} />
      </Card>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        <Card title="Разделы" sub="Выручка по разделам каталога">
          <BarList data={a.categories} />
        </Card>
        <Card title="Бренды" sub="Топ-8 по выручке">
          <BarList data={a.brands} />
        </Card>
      </div>

      <Card title="Продажи по разделам" sub="Нажмите на заголовок столбца, чтобы отсортировать, или на раздел — чтобы увидеть его товары ниже." className="mt-3">
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="text-xs text-[var(--a-muted)]">
              <tr className="border-b border-[var(--a-line)]">
                {CAT_COLS.map((c, i) => {
                  const key: CatSortKey = c.key === "share" ? "revenue" : c.key;
                  const on = catSort === key && c.key !== "share";
                  return (
                    <th key={c.key} className={`py-2.5 font-medium ${i ? "px-3 text-right" : "px-5"}`}>
                      <button type="button" onClick={() => setCatSort(key)} aria-pressed={on} className={`whitespace-nowrap hover:text-[var(--a-text)] ${on ? "text-[var(--a-gold)]" : ""}`}>
                        {c.label}
                        {on ? (key === "label" ? " ↑" : " ↓") : ""}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--a-line)]">
              {catRows.map((r) => {
                const share = catTotal ? r.revenue / catTotal : 0;
                const active = section === r.category;
                return (
                  <tr key={r.category} className={`cursor-pointer hover:bg-[var(--a-raised)]/40 ${active ? "bg-[var(--a-raised)]/60" : ""}`} onClick={() => pickSection(active ? "all" : r.category)}>
                    <td className="px-5 py-3">
                      <button type="button" aria-pressed={active} className={`text-left ${active ? "text-[var(--a-gold)]" : ""}`}>
                        {r.label}
                      </button>
                      <span className="block text-xs text-[var(--a-muted)]">{r.items} товаров с продажами</span>
                    </td>
                    <td className="a-num whitespace-nowrap px-3 text-right">{r.revenue ? sum(r.revenue) : "—"}</td>
                    <td className="px-3">
                      <span className="flex items-center justify-end gap-2">
                        <span className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--a-line)]">
                          <span className="block h-full rounded-full" style={{ width: `${share * 100}%`, background: C1 }} />
                        </span>
                        <span className="a-num w-10 text-right">{Math.round(share * 100)}%</span>
                      </span>
                    </td>
                    <td className="a-num px-3 text-right">{r.qty || "—"}</td>
                    <td className="a-num px-3 text-right">{r.orders || "—"}</td>
                    <td className="a-num px-3 text-right">{r.views || "—"}</td>
                    <td className="a-num px-3 text-right">{r.adds || "—"}</td>
                    <td className="a-num px-3 text-right">{r.views ? `${Math.round(catConv(r) * 100)}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {catRows.length === 0 ? <p className="px-5 py-8 text-center text-sm text-[var(--a-muted)]">За этот период данных нет.</p> : null}
        </div>
      </Card>

      <Card title="Спрос по товарам" sub="Выберите раздел и нажмите на заголовок столбца, чтобы отсортировать. Конверсия — доля просмотров, закончившихся заказом." className="mt-3">
        <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="Раздел">
          {(["all", ...CATEGORIES.filter((c) => a.catRows.some((r) => r.category === c))] as const).map((c) => (
            <button key={c} type="button" aria-pressed={section === c} onClick={() => pickSection(c)} className="a-tab rounded-full border border-[var(--a-line)] px-3 py-1 text-sm text-[var(--a-muted)] hover:text-[var(--a-text)]">
              {c === "all" ? "Все разделы" : CATEGORY_RU[c]}
            </button>
          ))}
        </div>
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="text-xs text-[var(--a-muted)]">
              <tr className="border-b border-[var(--a-line)]">
                <th className="px-5 py-2.5 font-medium">Товар</th>
                {COLS.map((c) => (
                  <th key={c.key} className="px-3 py-2.5 text-right font-medium">
                    <button type="button" onClick={() => setSort(c.key)} aria-pressed={sort === c.key} className={`whitespace-nowrap hover:text-[var(--a-text)] ${sort === c.key ? "text-[var(--a-gold)]" : ""}`}>
                      {c.label}
                      {sort === c.key ? " ↓" : ""}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--a-line)]">
              {shown.map((r) => (
                <tr key={r.slug} className="hover:bg-[var(--a-raised)]/40">
                  <td className="max-w-[16rem] px-5 py-2.5">
                    <span className="block text-xs text-[var(--a-muted)]">
                      {r.brand}
                      {section === "all" ? ` · ${CATEGORY_RU[r.category]}` : ""}
                    </span>
                    <span className="block truncate">{r.name}</span>
                  </td>
                  <td className="a-num whitespace-nowrap px-3 text-right">{r.revenue ? sum(r.revenue) : "—"}</td>
                  <td className="a-num px-3 text-right">{r.qty || "—"}</td>
                  <td className="a-num px-3 text-right">{r.orders || "—"}</td>
                  <td className="a-num px-3 text-right">{r.views || "—"}</td>
                  <td className="a-num px-3 text-right">{r.adds || "—"}</td>
                  <td className="a-num px-3 text-right">{r.views ? `${Math.round(conv(r) * 100)}%` : "—"}</td>
                  <td className="a-num px-3 text-right">{r.rating ? r.rating.toFixed(1) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="px-5 py-8 text-center text-sm text-[var(--a-muted)]">За этот период данных нет.</p> : null}
        </div>
        {rows.length > 12 ? (
          <button type="button" className="a-btn a-btn-line mt-4" onClick={() => setAll(!all)}>
            {all ? "Свернуть" : `Показать все (${rows.length})`}
          </button>
        ) : null}
      </Card>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        <Card title="Смотрят, но не покупают" sub="Много просмотров и ни одного заказа — стоит проверить цену, фото или наличие">
          {a.interest.length ? (
            <BarList data={a.interest.map((r) => ({ label: r.name, sub: r.brand, value: r.views }))} format={(n) => `${n} просм.`} color={C2} />
          ) : (
            <p className="text-sm text-[var(--a-muted)]">Таких товаров нет.</p>
          )}
        </Card>
        <Card title="Когда заказывают" sub="Заказы по дням недели и часам, время Ташкента">
          <Heatmap heat={a.heat} />
        </Card>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Card title="Получение">
          <Split a={a.pickup} b={a.delivery} la="Самовывоз" lb="Доставка" />
        </Card>
        <Card title="Магазины" sub="Самовывоз по точкам">
          <Split a={a.c5} b={a.c1} la="Ц5" lb="Ц1" />
        </Card>
        <Card title="Язык сайта">
          <Split a={a.ru} b={a.uz} la="Русский" lb="O‘zbekcha" />
        </Card>
      </div>
    </>
  );
}

/* ——————————————— для дашборда ——————————————— */

export function dashboardData(orders: AOrder[]) {
  const live = orders.filter((o) => o.status !== "cancelled");
  const today = dayKey(tz(new Date().toISOString()));
  const weekFrom = Date.now() - 7 * 86400_000;
  const prevFrom = Date.now() - 14 * 86400_000;
  const todayOrders = live.filter((o) => dayKey(tz(o.created_at)) === today);
  const week = live.filter((o) => +new Date(o.created_at) >= weekFrom);
  const prev = live.filter((o) => +new Date(o.created_at) >= prevFrom && +new Date(o.created_at) < weekFrom);
  const weekRevenue = week.reduce((s, o) => s + o.total, 0);
  const prevRevenue = prev.reduce((s, o) => s + o.total, 0);
  const top = compute(orders, [], [], 7).productRows.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  return {
    todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
    todayCount: todayOrders.length,
    weekRevenue,
    weekChange: prevRevenue ? (weekRevenue - prevRevenue) / prevRevenue : null,
    daily: compute(orders, [], [], 14).daily,
    top: top.map((r) => ({ label: r.name, sub: r.brand, value: r.revenue })),
  };
}
