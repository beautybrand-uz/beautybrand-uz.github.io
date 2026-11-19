"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, products, type Category } from "@/data/products";
import { STORES, formatPrice } from "@/lib/site";
import { currentSession, isAdmin, rest, signIn, signOut, supabaseEnabled, type Session } from "@/lib/supabase";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type OrderStatus = "new" | "confirmed" | "ready" | "done" | "cancelled";
type Order = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  method: string;
  address: string | null;
  comment: string | null;
  items: { slug: string; name: string; variant: string | null; qty: number; price: number }[];
  total: number;
  lang: "ru" | "uz";
  status: OrderStatus;
  note: string | null;
};
type ReviewStatus = "pending" | "approved" | "rejected";
type AdminReview = {
  id: string;
  created_at: string;
  product: string;
  name: string;
  rating: number;
  text: string;
  lang: "ru" | "uz";
  status: ReviewStatus;
};

const ORDER_STATUS: Record<OrderStatus, { label: string; color: string }> = {
  new: { label: "Новый", color: "var(--a-gold)" },
  confirmed: { label: "Подтверждён", color: "var(--a-amber)" },
  ready: { label: "Собран", color: "#9fb7d9" },
  done: { label: "Выдан", color: "var(--a-green)" },
  cancelled: { label: "Отменён", color: "#8a7d73" },
};
const REVIEW_STATUS: Record<ReviewStatus, { label: string; color: string }> = {
  pending: { label: "На проверке", color: "var(--a-gold)" },
  approved: { label: "Опубликован", color: "var(--a-green)" },
  rejected: { label: "Отклонён", color: "#8a7d73" },
};
const CATEGORY_RU: Record<Category, string> = {
  makeup: "Макияж",
  skin: "Уход за лицом",
  hair: "Волосы",
  fragrance: "Парфюм",
  body: "Тело",
  tools: "Кисти",
  sets: "Наборы",
};

const sum = (n: number) => formatPrice(n, "сум");
const when = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const methodLabel = (m: string) => STORES.find((s) => s.id === m)?.name.ru ?? (m === "delivery" ? "Доставка" : m);
const productName = (slug: string) => {
  const p = products.find((x) => x.slug === slug);
  return p ? `${p.brand} ${p.name}` : slug;
};

// ——— примеры для демо-режима (база ещё не подключена) ———
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const DEMO_ORDERS: Order[] = [
  {
    id: 1003, created_at: hoursAgo(1), name: "Пример: покупатель", phone: "+998 90 000 00 01", method: "c5", address: null,
    comment: "Позвоните перед выдачей", lang: "ru", status: "new", note: null, total: 1_430_000,
    items: [
      { slug: "dior-glow-stick-012-rosewood", name: "Dior Glow Stick 012 Rosewood", variant: null, qty: 2, price: 715_000 },
    ],
  },
  {
    id: 1002, created_at: hoursAgo(5), name: "Пример: покупатель", phone: "+998 90 000 00 02", method: "delivery",
    address: "Ташкент, Юнусабад", comment: null, lang: "uz", status: "confirmed", note: "Доставка завтра", total: 1_007_000,
    items: [
      { slug: "louis-vuitton-moon-tale", name: "Louis Vuitton Moon Tale", variant: "5 ml", qty: 1, price: 360_000 },
      { slug: "bobbi-brown-extra-plump-lip-serum", name: "Bobbi Brown Extra Plump Lip Serum", variant: "Bare Rose", qty: 1, price: 383_000 },
      { slug: "keune-rush-hour", name: "Keune Rush Hour 2-in-1 Spray", variant: null, qty: 1, price: 245_000 },
    ],
  },
  {
    id: 1001, created_at: hoursAgo(28), name: "Пример: покупатель", phone: "+998 90 000 00 03", method: "c1", address: null,
    comment: null, lang: "ru", status: "done", note: null, total: 1_280_000,
    items: [{ slug: "makeup-by-mario-brush-set", name: "Makeup by Mario Makeup Brush Set", variant: null, qty: 1, price: 1_280_000 }],
  },
];
const DEMO_REVIEWS: AdminReview[] = [
  { id: "d1", created_at: hoursAgo(2), product: "dior-glow-stick-012-rosewood", name: "Пример", rating: 5, text: "Пример отзыва: оттенок очень натуральный, держится весь день.", lang: "ru", status: "pending" },
  { id: "d2", created_at: hoursAgo(9), product: "creed-spring-flower", name: "Пример", rating: 4, text: "Пример отзыва: нежный аромат, взяла распив 10 мл.", lang: "ru", status: "pending" },
  { id: "d3", created_at: hoursAgo(40), product: "kerastase-genesis-cure", name: "Namuna", rating: 5, text: "Namuna sharh: sochim kamroq to‘kilyapti.", lang: "uz", status: "approved" },
];

type Tab = "overview" | "orders" | "reviews" | "products";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Обзор", icon: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" },
  { id: "orders", label: "Заказы", icon: "M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Zm4 2V6.5a3 3 0 0 1 6 0V10" },
  { id: "reviews", label: "Отзывы", icon: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" },
  { id: "products", label: "Товары", icon: "M4 7l8-4 8 4-8 4-8-4Zm0 0v10l8 4m-8-14 8 4m0 10V11m0 10 8-4V7" },
];

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[var(--a-gold)]" aria-label={`${n} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8L12 2.8z"
            fill={i <= n ? "currentColor" : "rgba(207,174,120,0.18)"}
          />
        </svg>
      ))}
    </span>
  );
}

/* ——————————————————— вход ——————————————————— */

function Login({ onDone, demo }: { onDone: (s: Session) => void; demo: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("Введите почту и пароль.");
    setBusy(true);
    try {
      const s = await signIn(email.trim(), password);
      if (!(await isAdmin(s.access_token))) {
        signOut();
        setError("У этого аккаунта нет доступа к админке. Добавьте его в таблицу admins (см. supabase/admin.sql).");
      } else onDone(s);
    } catch (err) {
      setError(err instanceof Error && err.message === "wrong" ? "Неверная почта или пароль." : "Не удалось подключиться к базе. Проверьте интернет и попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="a-in w-full max-w-sm">
        <p className="text-center font-script text-6xl leading-none text-[var(--a-gold)]">Beautybrand</p>
        <p className="mt-2 text-center text-sm text-[var(--a-muted)]">Админка магазина</p>
        {supabaseEnabled ? (
          <form onSubmit={submit} noValidate className="a-panel mt-8 space-y-4 p-6">
            <div>
              <label htmlFor="a-email" className="mb-1.5 block text-sm font-medium">Почта</label>
              <input id="a-email" type="email" autoComplete="username" className="a-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="a-pass" className="mb-1.5 block text-sm font-medium">Пароль</label>
              <input id="a-pass" type="password" autoComplete="current-password" className="a-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error ? <p className="text-sm text-[var(--a-rose)]" role="alert">{error}</p> : null}
            <button type="submit" className="a-btn a-btn-gold w-full" disabled={busy}>
              {busy ? "Входим…" : "Войти"}
            </button>
          </form>
        ) : (
          <div className="a-panel mt-8 space-y-4 p-6 text-sm leading-relaxed">
            <p className="font-medium">База данных ещё не подключена.</p>
            <p className="text-[var(--a-muted)]">
              Чтобы входить по почте и паролю, подключите Supabase: выполните файлы <code>supabase/reviews.sql</code> и{" "}
              <code>supabase/admin.sql</code> и добавьте ключи SUPABASE_URL и SUPABASE_ANON_KEY в секреты GitHub.
            </p>
            <button type="button" className="a-btn a-btn-gold w-full" onClick={demo}>
              Открыть демо с примерами
            </button>
          </div>
        )}
        <p className="mt-6 text-center text-sm">
          <a href={`${BASE}/ru/`} className="text-[var(--a-muted)] underline-offset-4 hover:text-[var(--a-text)] hover:underline">
            ← На сайт
          </a>
        </p>
      </div>
    </main>
  );
}

/* ——————————————————— приложение ——————————————————— */

export function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [demo, setDemo] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabaseEnabled) return setReady(true);
    currentSession()
      .then(async (s) => {
        if (s && (await isAdmin(s.access_token).catch(() => false))) setSession(s);
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <div className="min-h-dvh" aria-busy="true" />;
  if (!session && !demo) return <Login onDone={setSession} demo={() => setDemo(true)} />;
  return (
    <Dashboard
      session={session}
      demo={demo}
      onExit={() => {
        signOut();
        setSession(null);
        setDemo(false);
      }}
    />
  );
}

function Dashboard({ session, demo, onExit }: { session: Session | null; demo: boolean; onExit: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>(demo ? DEMO_ORDERS : []);
  const [reviews, setReviews] = useState<AdminReview[]>(demo ? DEMO_REVIEWS : []);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState("");
  const token = session?.access_token;

  // вкладка в адресе (#orders), чтобы можно было сохранить ссылку
  useEffect(() => {
    const read = () => {
      const h = location.hash.slice(1) as Tab;
      if (TABS.some((t) => t.id === h)) setTab(h);
    };
    read();
    addEventListener("hashchange", read);
    return () => removeEventListener("hashchange", read);
  }, []);
  const go = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", `#${t}`);
    window.scrollTo({ top: 0 });
  };

  const load = useCallback(async () => {
    if (demo || !token) return;
    setLoading(true);
    setError("");
    try {
      const [o, r] = await Promise.all([
        rest<Order[]>("orders?select=*&order=created_at.desc&limit=300", { token }),
        rest<AdminReview[]>("reviews?select=*&order=created_at.desc&limit=300", { token }),
      ]);
      setOrders(o);
      setReviews(r);
    } catch {
      setError("Не удалось загрузить данные. Проверьте интернет и нажмите «Обновить».");
    } finally {
      setLoading(false);
    }
  }, [demo, token]);
  useEffect(() => {
    load();
  }, [load]);

  async function patchOrder(id: number, patch: Partial<Order>) {
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    if (demo || !token) return;
    try {
      await rest(`orders?id=eq.${id}`, { method: "PATCH", token, headers: { Prefer: "return=minimal" }, body: JSON.stringify(patch) });
    } catch {
      setError("Изменение заказа не сохранилось. Нажмите «Обновить» и попробуйте ещё раз.");
    }
  }
  async function moderate(id: string, status: ReviewStatus | "delete") {
    setReviews((list) => (status === "delete" ? list.filter((r) => r.id !== id) : list.map((r) => (r.id === id ? { ...r, status } : r))));
    if (demo || !token) return;
    try {
      await rest(`reviews?id=eq.${id}`, {
        method: status === "delete" ? "DELETE" : "PATCH",
        token,
        headers: { Prefer: "return=minimal" },
        body: status === "delete" ? undefined : JSON.stringify({ status }),
      });
    } catch {
      setError("Изменение отзыва не сохранилось. Нажмите «Обновить» и попробуйте ещё раз.");
    }
  }

  const newOrders = orders.filter((o) => o.status === "new").length;
  const pending = reviews.filter((r) => r.status === "pending").length;
  const counts: Partial<Record<Tab, number>> = { orders: newOrders, reviews: pending };

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      {/* боковое меню (на телефоне — полоса сверху) */}
      <aside className="sticky top-0 z-20 border-b border-[var(--a-line)] bg-[var(--a-bg)]/95 backdrop-blur lg:h-dvh lg:border-b-0 lg:border-r lg:bg-transparent">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:block lg:px-5 lg:py-7">
          <div>
            <p className="font-script text-3xl leading-none text-[var(--a-gold)] lg:text-4xl">Beautybrand</p>
            <p className="mt-1 hidden text-xs text-[var(--a-muted)] lg:block">Админка магазина</p>
          </div>
          <button type="button" onClick={onExit} className="a-btn a-btn-quiet lg:hidden">
            Выйти
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:mt-4 lg:flex-col lg:px-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className="a-tab group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--a-muted)] transition-colors hover:text-[var(--a-text)]"
            >
              <span className="a-tab-mark hidden h-5 w-0.5 rounded-full bg-transparent lg:block" aria-hidden />
              <Icon d={t.icon} />
              {t.label}
              {counts[t.id] ? (
                <span className="a-num ml-auto rounded-full bg-[var(--a-gold)] px-1.5 text-[0.7rem] font-bold leading-5 text-[#1b120f]">{counts[t.id]}</span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 hidden space-y-2 border-t border-[var(--a-line)] p-5 text-sm lg:block">
          <p className="truncate text-xs text-[var(--a-muted)]">{demo ? "Демо-режим" : session?.email}</p>
          <div className="flex gap-2">
            <a href={`${BASE}/ru/`} className="a-btn a-btn-line flex-1" target="_blank" rel="noopener">
              Сайт
            </a>
            <button type="button" onClick={onExit} className="a-btn a-btn-quiet flex-1">
              Выйти
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 pb-16 pt-6 sm:px-8 lg:px-10 lg:pt-9">
        {demo ? (
          <p className="a-panel mb-6 border-[var(--a-line-strong)] px-4 py-3 text-sm text-[var(--a-muted)]">
            <span className="font-semibold text-[var(--a-gold)]">Демо-режим.</span> База не подключена: заказы и отзывы ниже —
            примеры, изменения не сохраняются.
          </p>
        ) : null}
        {error ? (
          <p className="a-panel mb-6 border-[var(--a-rose)]/40 px-4 py-3 text-sm text-[var(--a-rose)]" role="alert">
            {error}
          </p>
        ) : null}

        <div key={tab} className="a-in">
          {tab === "overview" ? (
            <Overview orders={orders} reviews={reviews} loading={loading} go={go} onReload={load} demo={demo} />
          ) : tab === "orders" ? (
            <Orders orders={orders} loading={loading} onPatch={patchOrder} onReload={load} demo={demo} />
          ) : tab === "reviews" ? (
            <Reviews reviews={reviews} loading={loading} onModerate={moderate} />
          ) : (
            <Products />
          )}
        </div>
      </main>
    </div>
  );
}

function Head({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <h1 className="font-display text-3xl font-medium sm:text-4xl">{title}</h1>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="a-panel px-5 py-10 text-center text-sm text-[var(--a-muted)]">{children}</p>;
}

/* ——————————————————— обзор ——————————————————— */

function Overview({ orders, reviews, loading, go, onReload, demo }: { orders: Order[]; reviews: AdminReview[]; loading: boolean; go: (t: Tab) => void; onReload: () => void; demo: boolean }) {
  const week = Date.now() - 7 * 86400_000;
  const weekOrders = orders.filter((o) => +new Date(o.created_at) > week && o.status !== "cancelled");
  const revenue = weekOrders.reduce((s, o) => s + o.total, 0);
  const approved = reviews.filter((r) => r.status === "approved");
  const avg = approved.length ? approved.reduce((s, r) => s + r.rating, 0) / approved.length : 0;
  const stats = [
    { label: "Новые заказы", value: String(orders.filter((o) => o.status === "new").length), tab: "orders" as Tab },
    { label: "Отзывы на проверке", value: String(reviews.filter((r) => r.status === "pending").length), tab: "reviews" as Tab },
    { label: "Сумма заказов за 7 дней", value: sum(revenue), tab: "orders" as Tab },
    { label: "Средняя оценка", value: avg ? avg.toFixed(1) : "—", tab: "reviews" as Tab },
  ];
  return (
    <>
      <Head title="Обзор">
        {!demo ? (
          <button type="button" className="a-btn a-btn-line" onClick={onReload} disabled={loading}>
            {loading ? "Загружаем…" : "Обновить"}
          </button>
        ) : null}
      </Head>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => (
          <button key={s.label} type="button" onClick={() => go(s.tab)} className="a-panel group p-5 text-left transition-colors hover:border-[var(--a-line-strong)]">
            <p className="text-xs text-[var(--a-muted)]">{s.label}</p>
            <p className="a-num mt-2 font-display text-2xl text-[var(--a-text)] sm:text-3xl">{s.value}</p>
          </button>
        ))}
      </div>
      <h2 className="mb-3 mt-10 font-display text-xl">Последние заказы</h2>
      {orders.length ? (
        <ul className="a-panel divide-y divide-[var(--a-line)]">
          {orders.slice(0, 5).map((o) => (
            <li key={o.id}>
              <button type="button" onClick={() => go("orders")} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 text-left text-sm hover:bg-[var(--a-raised)]/50">
                <span className="a-num font-semibold">№{o.id}</span>
                <span className="hidden text-[var(--a-muted)] sm:inline">{when(o.created_at)}</span>
                <span className="min-w-0 flex-1 truncate">{o.name}</span>
                <span className="a-num">{sum(o.total)}</span>
                <StatusChip s={ORDER_STATUS[o.status]} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>{loading ? "Загружаем…" : "Заказов пока нет. Они появятся здесь, как только покупатель отправит корзину."}</Empty>
      )}
    </>
  );
}

function StatusChip({ s }: { s: { label: string; color: string } }) {
  return (
    <span className="a-chip" style={{ color: s.color, background: "color-mix(in srgb, currentColor 13%, transparent)" }}>
      {s.label}
    </span>
  );
}

/* ——————————————————— заказы ——————————————————— */

function Orders({ orders, loading, onPatch, onReload, demo }: { orders: Order[]; loading: boolean; onPatch: (id: number, p: Partial<Order>) => void; onReload: () => void; demo: boolean }) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [open, setOpen] = useState<number | null>(null);
  const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  return (
    <>
      <Head title="Заказы">
        {!demo ? (
          <button type="button" className="a-btn a-btn-line" onClick={onReload} disabled={loading}>
            {loading ? "Загружаем…" : "Обновить"}
          </button>
        ) : null}
      </Head>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["all", ...Object.keys(ORDER_STATUS)] as (OrderStatus | "all")[]).map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className="a-tab rounded-full px-3.5 py-1.5 text-sm text-[var(--a-muted)] hover:text-[var(--a-text)]">
            {f === "all" ? "Все" : ORDER_STATUS[f].label}
            <span className="a-num ml-1.5 opacity-60">{f === "all" ? orders.length : orders.filter((o) => o.status === f).length}</span>
          </button>
        ))}
      </div>
      {list.length ? (
        <ul className="space-y-2.5">
          {list.map((o) => (
            <li key={o.id} className="a-panel overflow-hidden">
              <button type="button" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id} className="flex w-full flex-wrap items-center gap-x-5 gap-y-1.5 px-5 py-4 text-left">
                <span className="a-num font-semibold">№{o.id}</span>
                <span className="text-sm text-[var(--a-muted)]">{when(o.created_at)}</span>
                <span className="min-w-0 flex-1 truncate">{o.name}</span>
                <span className="text-sm text-[var(--a-muted)]">{methodLabel(o.method)}</span>
                <span className="a-num font-semibold">{sum(o.total)}</span>
                <StatusChip s={ORDER_STATUS[o.status]} />
              </button>
              {open === o.id ? (
                <div className="grid gap-6 border-t border-[var(--a-line)] px-5 py-5 md:grid-cols-[1.2fr_1fr]">
                  <div>
                    <ul className="space-y-2 text-sm">
                      {o.items.map((it, i) => (
                        <li key={i} className="flex justify-between gap-4">
                          <span>
                            {it.name}
                            {it.variant ? <span className="text-[var(--a-muted)]">, {it.variant}</span> : null}
                            <span className="text-[var(--a-muted)]"> × {it.qty}</span>
                          </span>
                          <span className="a-num shrink-0">{sum(it.price * it.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    <dl className="mt-5 space-y-1.5 border-t border-[var(--a-line)] pt-4 text-sm">
                      <div className="flex gap-2"><dt className="w-24 shrink-0 text-[var(--a-muted)]">Телефон</dt><dd className="a-num select-all">{o.phone}</dd></div>
                      <div className="flex gap-2"><dt className="w-24 shrink-0 text-[var(--a-muted)]">Получение</dt><dd>{methodLabel(o.method)}{o.address ? `, ${o.address}` : ""}</dd></div>
                      {o.comment ? <div className="flex gap-2"><dt className="w-24 shrink-0 text-[var(--a-muted)]">Комментарий</dt><dd>{o.comment}</dd></div> : null}
                      <div className="flex gap-2"><dt className="w-24 shrink-0 text-[var(--a-muted)]">Язык</dt><dd>{o.lang === "ru" ? "Русский" : "O‘zbekcha"}</dd></div>
                    </dl>
                  </div>
                  <div className="space-y-4">
                    <fieldset>
                      <legend className="mb-2 text-sm font-medium">Статус</legend>
                      <div className="flex flex-wrap gap-1.5">
                        {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((st) => (
                          <button key={st} type="button" aria-pressed={o.status === st} onClick={() => onPatch(o.id, { status: st })} className="a-tab rounded-full border border-[var(--a-line)] px-3 py-1.5 text-sm text-[var(--a-muted)] hover:text-[var(--a-text)]">
                            {ORDER_STATUS[st].label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <NoteField value={o.note ?? ""} onSave={(note) => onPatch(o.id, { note: note || null })} />
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <Empty>{loading ? "Загружаем…" : filter === "all" ? "Заказов пока нет." : "В этом статусе заказов нет."}</Empty>
      )}
    </>
  );
}

function NoteField({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  const [saved, setSaved] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium" htmlFor="a-note">Заметка менеджера</label>
      <textarea id="a-note" className="a-input min-h-20 resize-y" value={v} onChange={(e) => { setV(e.target.value); setSaved(false); }} placeholder="Например: клиент заберёт в субботу" maxLength={1000} />
      <button type="button" className="a-btn a-btn-line mt-2" disabled={saved || v.trim() === value} onClick={() => { onSave(v.trim()); setSaved(true); }}>
        {saved ? "Сохранено" : "Сохранить заметку"}
      </button>
    </div>
  );
}

/* ——————————————————— отзывы ——————————————————— */

function Reviews({ reviews, loading, onModerate }: { reviews: AdminReview[]; loading: boolean; onModerate: (id: string, s: ReviewStatus | "delete") => void }) {
  const [filter, setFilter] = useState<ReviewStatus>("pending");
  const list = reviews.filter((r) => r.status === filter);
  return (
    <>
      <Head title="Отзывы" />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(Object.keys(REVIEW_STATUS) as ReviewStatus[]).map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className="a-tab rounded-full px-3.5 py-1.5 text-sm text-[var(--a-muted)] hover:text-[var(--a-text)]">
            {REVIEW_STATUS[f].label}
            <span className="a-num ml-1.5 opacity-60">{reviews.filter((r) => r.status === f).length}</span>
          </button>
        ))}
      </div>
      {list.length ? (
        <ul className="grid gap-3 xl:grid-cols-2">
          {list.map((r) => (
            <li key={r.id} className="a-panel flex flex-col p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars n={r.rating} />
                <span className="text-xs text-[var(--a-muted)]">{when(r.created_at)}</span>
              </div>
              <p className="mt-3 flex-1 whitespace-pre-line leading-relaxed">{r.text}</p>
              <p className="mt-3 text-sm">
                <span className="font-semibold">{r.name}</span>
                <span className="text-[var(--a-muted)]"> · {productName(r.product)} · {r.lang === "ru" ? "RU" : "UZ"}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--a-line)] pt-4">
                {r.status !== "approved" ? (
                  <button type="button" className="a-btn a-btn-gold" onClick={() => onModerate(r.id, "approved")}>
                    Опубликовать
                  </button>
                ) : null}
                {r.status !== "rejected" ? (
                  <button type="button" className="a-btn a-btn-line" onClick={() => onModerate(r.id, "rejected")}>
                    {r.status === "approved" ? "Снять с сайта" : "Отклонить"}
                  </button>
                ) : null}
                <a className="a-btn a-btn-quiet" href={`${BASE}/ru/p/${r.product}/`} target="_blank" rel="noopener">
                  Товар на сайте
                </a>
                {r.status === "rejected" ? (
                  <button type="button" className="a-btn a-btn-quiet ml-auto hover:!text-[var(--a-rose)]" onClick={() => onModerate(r.id, "delete")}>
                    Удалить
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>{loading ? "Загружаем…" : filter === "pending" ? "Новых отзывов нет — всё проверено." : "Здесь пока пусто."}</Empty>
      )}
    </>
  );
}

/* ——————————————————— товары ——————————————————— */

function Products() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all" | "boutique">("all");
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter(
      (p) =>
        (cat === "all" || (cat === "boutique" ? p.boutique : p.category === cat)) &&
        (!query || `${p.brand} ${p.name}`.toLowerCase().includes(query)),
    );
  }, [q, cat]);
  const price = (p: (typeof products)[number]) =>
    p.usd ? p.usd.map((u) => `${u.label}: ${u.usd} $`).join(" · ") : p.variants && p.variants.length > 1 ? `от ${sum(Math.min(...p.variants.map((v) => v.price)))}` : sum(p.price);
  return (
    <>
      <Head title="Товары" />
      <p className="a-panel mb-5 px-4 py-3 text-sm text-[var(--a-muted)]">
        Здесь все {products.length} товаров сайта. Сейчас товары и цены меняются в файлах проекта — редактирование прямо в админке сделаем следующим шагом.
      </p>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input className="a-input sm:max-w-sm" type="search" placeholder="Поиск по названию или бренду" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Поиск товаров" />
        <select className="a-input sm:max-w-56" value={cat} onChange={(e) => setCat(e.target.value as typeof cat)} aria-label="Раздел">
          <option value="all">Все разделы</option>
          <option value="boutique">Maison De Mari</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_RU[c]}</option>
          ))}
        </select>
      </div>
      <div className="a-panel overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-xs text-[var(--a-muted)]">
            <tr className="border-b border-[var(--a-line)]">
              <th className="px-4 py-3 font-medium">Товар</th>
              <th className="px-4 py-3 font-medium">Раздел</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium"><span className="sr-only">Ссылка</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--a-line)]">
            {list.map((p) => (
              <tr key={p.slug} className="hover:bg-[var(--a-raised)]/40">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- маленькое превью
                      <img src={p.images[0]} alt="" loading="lazy" className="size-11 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="size-11 shrink-0 rounded-lg bg-[var(--a-raised)]" />
                    )}
                    <span className="min-w-0">
                      <span className="block text-xs text-[var(--a-muted)]">{p.brand}</span>
                      <span className="block truncate">{p.name}</span>
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[var(--a-muted)]">{p.boutique ? "Maison De Mari" : CATEGORY_RU[p.category]}</td>
                <td className="a-num whitespace-nowrap px-4 py-2.5">{price(p)}</td>
                <td className="px-4 py-2.5 text-right">
                  <a className="a-btn a-btn-quiet" href={`${BASE}/ru/p/${p.slug}/`} target="_blank" rel="noopener">
                    Открыть
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 ? <p className="px-4 py-8 text-center text-sm text-[var(--a-muted)]">Ничего не нашлось.</p> : null}
      </div>
    </>
  );
}
