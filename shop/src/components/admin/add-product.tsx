"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BRANDS, CATEGORIES, products, type Category } from "@/data/products";
import type { ShopProductRow } from "@/lib/extra-products";
import { formatPrice } from "@/lib/site";
import { SB_KEY, SB_URL, rest } from "@/lib/supabase";
import { StaffBadge, useMe } from "./staff";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const CATEGORY_RU: Record<Category, string> = {
  makeup: "Макияж", skin: "Уход за лицом", hair: "Волосы", fragrance: "Парфюм", body: "Тело", tools: "Кисти", sets: "Наборы",
};

/* ——— адрес товара из бренда и названия (латиница) ——— */
const TR: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  ў: "o", қ: "q", ғ: "g", ҳ: "h",
};
export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split("")
    .map((c) => TR[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Сжимаем фото в браузере: длинная сторона до 1400 px, формат WebP */
async function toWebp(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("webp"))), "image/webp", 0.86));
}

type Photo = { file?: File; url: string };

/** Что редактируем: товар каталога (правка поверх него) или товар, добавленный через админку */
export type EditTarget = {
  slug: string;
  isCatalog: boolean;
  hasEdit: boolean;
  product: {
    brand: string;
    name: string;
    category: Category;
    boutique?: boolean;
    price: number;
    oldPrice?: number;
    variants?: { label: string; price: number }[];
    usd?: { label: string; usd: number }[];
    bottle?: string;
    description: { ru: string; uz: string };
    images: string[];
  };
  onDone: () => void;
};
type Row = { label: string; price: string };

const num = (s: string) => Number(String(s).replace(/[^\d]/g, "")) || 0;

function Step({ n, title, hint, children }: { n: number; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="a-panel p-5 sm:p-6">
      <div className="flex gap-4">
        <span className="a-num grid size-8 shrink-0 place-items-center rounded-full border border-[var(--a-line-strong)] text-sm text-[var(--a-gold)]">{n}</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl">{title}</h2>
          <p className="mt-1 max-w-[70ch] text-sm leading-relaxed text-[var(--a-muted)]">{hint}</p>
          <div className="mt-5 space-y-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, hint, error, children, id }: { label: string; hint?: string; error?: string; children: React.ReactNode; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-[var(--a-rose)]" role="alert">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-[var(--a-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function AddProduct({ token, demo, edit }: { token?: string; demo: boolean; edit?: EditTarget }) {
  const e0 = edit?.product;
  const me = useMe();
  const [brand, setBrand] = useState(e0?.brand ?? "");
  const [name, setName] = useState(e0?.name ?? "");
  const [category, setCategory] = useState<Category>(e0?.category ?? "makeup");
  const [boutique, setBoutique] = useState(!!e0?.boutique);
  const [mode, setMode] = useState<"sum" | "usd">(e0?.usd?.length ? "usd" : "sum");
  const [price, setPrice] = useState(e0 && !e0.usd?.length && e0.price ? String(e0.price) : "");
  const [oldPrice, setOldPrice] = useState(e0?.oldPrice ? String(e0.oldPrice) : "");
  const [variants, setVariants] = useState<Row[]>(e0?.variants?.map((v) => ({ label: v.label, price: String(v.price) })) ?? []);
  const [usd, setUsd] = useState<Row[]>(e0?.usd?.length ? e0.usd.map((u) => ({ label: u.label, price: String(u.usd) })) : [{ label: "100 ml", price: "" }]);
  const [bottle, setBottle] = useState(e0?.bottle ?? "");
  const [descRu, setDescRu] = useState(e0?.description.ru ?? "");
  const [descUz, setDescUz] = useState(e0?.description.uz ?? "");
  const [photos, setPhotos] = useState<Photo[]>(e0?.images.map((url) => ({ url })) ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [mine, setMine] = useState<ShopProductRow[]>([]);

  const slug = edit ? edit.slug : slugify(`${brand} ${name}`);
  const taken = !edit && (products.some((p) => p.slug === slug) || mine.some((p) => p.slug === slug));

  const loadMine = useCallback(async () => {
    if (demo || !token) return;
    try {
      setMine(await rest<ShopProductRow[]>("shop_products?select=*&order=created_at.desc", { token }));
    } catch {
      /* таблицы ещё нет — список пустой */
    }
  }, [demo, token]);
  useEffect(() => {
    loadMine();
  }, [loadMine]);

  useEffect(() => () => photos.forEach((p) => p.file && URL.revokeObjectURL(p.url)), [photos]);

  const variantRows = variants.filter((v) => v.label.trim());
  const shownPrice = useMemo(() => {
    if (mode === "usd") {
      const list = usd.filter((u) => num(u.price)).map((u) => num(u.price));
      return list.length ? `${list.length > 1 ? "от " : ""}${Math.min(...list)} $` : "— $";
    }
    const list = variantRows.map((v) => num(v.price)).filter(Boolean);
    const base = list.length ? Math.min(...list) : num(price);
    return base ? `${list.length > 1 && new Set(list).size > 1 ? "от " : ""}${formatPrice(base, "сум")}` : "— сум";
  }, [mode, usd, variantRows, price]);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const list = [...files].filter((f) => f.type.startsWith("image/")).slice(0, 6 - photos.length);
    setPhotos((p) => [...p, ...list.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  }
  const movePhoto = (i: number, d: -1 | 1) =>
    setPhotos((p) => {
      const n = [...p];
      const j = i + d;
      if (j < 0 || j >= n.length) return p;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  function validate() {
    const e: Record<string, string> = {};
    if (!brand.trim()) e.brand = "Укажите бренд, например «Dior».";
    if (!name.trim()) e.name = "Укажите название товара.";
    if (taken) e.name = "Такой товар уже есть. Добавьте оттенок или объём в название.";
    if (mode === "sum" && !num(price) && !variantRows.some((v) => num(v.price))) e.price = "Укажите цену в сумах.";
    if (mode === "sum" && num(oldPrice) && num(oldPrice) <= num(price)) e.oldPrice = "Старая цена должна быть больше новой.";
    if (mode === "usd" && !usd.some((u) => u.label.trim() && num(u.price))) e.usd = "Укажите хотя бы один объём и цену в долларах.";
    if (!descRu.trim()) e.descRu = "Напишите описание хотя бы на русском.";
    if (!photos.length) e.photos = "Добавьте хотя бы одно фото.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    setMessage("");
    if (!validate()) {
      setMessage("Исправьте поля, отмеченные выше.");
      return;
    }
    if (demo || !token) {
      setState("error");
      setMessage(
        edit
          ? "Это демо: сохранять некуда. Подключите базу (supabase/products.sql), войдите в админку — и правки появятся на сайте сразу после сохранения."
          : "Это демо: сохранять некуда. Подключите базу (supabase/products.sql), войдите в админку — и товар появится на сайте сразу после сохранения.",
      );
      return;
    }
    setState("saving");
    try {
      const urls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const p = photos[i];
        if (!p.file) {
          urls.push(p.url);
          continue;
        }
        const blob = await toWebp(p.file);
        const path = `${slug}/${Date.now()}-${i}.webp`;
        // фото товаров каталога лежат на сайте: в правке они остаются ссылками, новые — грузятся в хранилище
        const res = await fetch(`${SB_URL}/storage/v1/object/product-images/${path}`, {
          method: "POST",
          headers: { apikey: SB_KEY, Authorization: `Bearer ${token}`, "Content-Type": "image/webp", "x-upsert": "true" },
          body: blob,
        });
        if (!res.ok) throw new Error(`photo ${res.status}`);
        urls.push(`${SB_URL}/storage/v1/object/public/product-images/${path}`);
      }
      const vs = variantRows.map((v) => ({ label: v.label.trim(), price: num(v.price) || num(price) }));
      const row = {
        slug,
        brand: brand.trim(),
        name: name.trim(),
        category,
        boutique,
        price: mode === "usd" ? 0 : vs.length ? Math.min(...vs.map((v) => v.price)) : num(price),
        old_price: mode === "sum" && num(oldPrice) ? num(oldPrice) : null,
        variants: mode === "sum" && vs.length ? vs : null,
        usd: mode === "usd" ? usd.filter((u) => u.label.trim() && num(u.price)).map((u) => ({ label: u.label.trim(), usd: num(u.price) })) : null,
        bottle: mode === "sum" && bottle.trim() ? bottle.trim() : null,
        description_ru: descRu.trim(),
        description_uz: descUz.trim(),
        images: urls,
        published: true,
      };
      if (edit) {
        // правка: запись с этим адресом создаётся или обновляется (у товара каталога — поверх него)
        await rest("shop_products?on_conflict=slug", {
          method: "POST",
          token,
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify(row),
        });
        setState("saved");
        setMessage(`Изменения «${brand.trim()} ${name.trim()}» сохранены${me ? ` — ${me}` : ""} и уже видны на сайте.`);
        return;
      }
      await rest("shop_products", { method: "POST", token, headers: { Prefer: "return=minimal" }, body: JSON.stringify(row) });
      setState("saved");
      setMessage(`Товар «${brand.trim()} ${name.trim()}» добавлен${me ? ` — ${me}` : ""} и уже виден на сайте.`);
      setBrand(""); setName(""); setPrice(""); setOldPrice(""); setVariants([]); setBottle(""); setDescRu(""); setDescUz(""); setPhotos([]);
      loadMine();
    } catch (e) {
      setState("error");
      setMessage(`Не удалось сохранить (${e instanceof Error ? e.message : "ошибка"}). Проверьте интернет и что выполнен файл supabase/products.sql, затем нажмите «Опубликовать» ещё раз.`);
    }
  }

  async function patch(row: ShopProductRow, change: Partial<ShopProductRow> | "delete") {
    if (!token) return;
    if (change === "delete") {
      setMine((m) => m.filter((r) => r.slug !== row.slug));
      await rest(`shop_products?slug=eq.${row.slug}`, { method: "DELETE", token, headers: { Prefer: "return=minimal" } }).catch(() => loadMine());
    } else {
      setMine((m) => m.map((r) => (r.slug === row.slug ? { ...r, ...change } : r)));
      await rest(`shop_products?slug=eq.${row.slug}`, { method: "PATCH", token, headers: { Prefer: "return=minimal" }, body: JSON.stringify(change) }).catch(() => loadMine());
    }
  }

  const rowEditor = (rows: Row[], set: (r: Row[]) => void, unit: string, labelPh: string) => (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input className="a-input" placeholder={labelPh} value={r.label} aria-label="Вариант" onChange={(e) => set(rows.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
          <input className="a-input a-num max-w-44" inputMode="numeric" placeholder={`Цена, ${unit}`} value={r.price} aria-label={`Цена, ${unit}`} onChange={(e) => set(rows.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
          <button type="button" className="a-btn a-btn-quiet shrink-0" onClick={() => set(rows.filter((_, j) => j !== i))} aria-label="Убрать вариант">
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="a-btn a-btn-line" onClick={() => set([...rows, { label: "", price: "" }])}>
        + Добавить вариант
      </button>
    </div>
  );

  async function resetEdit() {
    if (!edit || demo || !token) return;
    setState("saving");
    try {
      await rest(`shop_products?slug=eq.${edit.slug}`, { method: "DELETE", token, headers: { Prefer: "return=minimal" } });
      edit.onDone();
    } catch {
      setState("error");
      setMessage("Не удалось вернуть исходный вид. Проверьте интернет и попробуйте ещё раз.");
    }
  }

  return (
    <>
      <div className="mb-6">
        {edit ? (
          <>
            <button type="button" onClick={edit.onDone} className="a-btn a-btn-quiet -ml-3 mb-2">
              ← К товарам
            </button>
            <h1 className="font-display text-3xl font-medium sm:text-4xl">Редактировать товар</h1>
            <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-[var(--a-muted)]">
              {edit.isCatalog
                ? "Это товар из каталога. Ваши правки сохранятся поверх него и сразу появятся на сайте — в карточке, на странице товара и в корзине. Вернуть исходный вид можно кнопкой внизу."
                : "Товар, добавленный через админку. Измените что нужно и нажмите «Сохранить изменения» — сайт обновится сразу."}
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-medium sm:text-4xl">Добавить товар</h1>
            <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-[var(--a-muted)]">
              Заполните пять шагов — справа сразу видно, как карточка будет выглядеть на сайте. После «Опубликовать» товар появляется в каталоге, в своём
              разделе и в поиске без пересборки сайта.
            </p>
          </>
        )}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <form className="space-y-4" noValidate onSubmit={(e) => { e.preventDefault(); save(); }}>
          <Step n={1} title="Основное" hint="Бренд и название пишите латиницей, как на упаковке. Если у товара есть оттенок или объём, который нельзя выбрать, добавьте его в название: «Glow Stick 012 Rosewood».">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="ap-brand" label="Бренд" hint="Начните вводить — появятся бренды, которые уже есть на сайте." error={errors.brand}>
                <input id="ap-brand" className="a-input" list="ap-brands" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Dior" aria-invalid={!!errors.brand} />
                <datalist id="ap-brands">{BRANDS.map((b) => <option key={b} value={b} />)}</datalist>
              </Field>
              <Field id="ap-name" label="Название" error={errors.name} hint={edit ? "Адрес страницы при правке не меняется." : slug ? `Адрес страницы: /item/?p=${slug}` : undefined}>
                <input id="ap-name" className="a-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Glow Stick 012 Rosewood" aria-invalid={!!errors.name} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="ap-cat" label="Раздел" hint="Где товар будет на сайте: «Макияж», «Уход за лицом» и т. д.">
                <select id="ap-cat" className="a-input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_RU[c]}</option>)}
                </select>
              </Field>
              <label className="flex items-start gap-3 rounded-xl border border-[var(--a-line)] p-3.5 text-sm">
                <input type="checkbox" className="mt-0.5 size-4 accent-[var(--a-gold)]" checked={boutique} onChange={(e) => { setBoutique(e.target.checked); if (e.target.checked) setCategory("fragrance"); }} />
                <span>
                  <span className="font-medium">Парфюм-бутик Maison De Mari</span>
                  <span className="block text-xs text-[var(--a-muted)]">Отметьте для ароматов бутика — товар попадёт в раздел «Парфюм».</span>
                </span>
              </label>
            </div>
          </Step>

          <Step n={2} title="Цена и варианты" hint="Цены — в сумах, только цифры (пробелы можно). Варианты — это то, что покупатель выбирает: оттенок, объём распива. Если у вариантов разная цена, на карточке будет «от …». Флаконы под заказ продаются в долларах и заказываются через Telegram.">
            <div className="flex gap-1.5" role="group" aria-label="Как продаётся">
              <button type="button" aria-pressed={mode === "sum"} onClick={() => setMode("sum")} className="a-tab rounded-full border border-[var(--a-line)] px-3.5 py-1.5 text-sm text-[var(--a-muted)]">В наличии, в сумах</button>
              <button type="button" aria-pressed={mode === "usd"} onClick={() => setMode("usd")} className="a-tab rounded-full border border-[var(--a-line)] px-3.5 py-1.5 text-sm text-[var(--a-muted)]">Флакон под заказ, в $</button>
            </div>
            {mode === "sum" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="ap-price" label="Цена, сум" error={errors.price} hint="Например: 715 000">
                    <input id="ap-price" className="a-input a-num" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="715 000" aria-invalid={!!errors.price} />
                  </Field>
                  <Field id="ap-old" label="Старая цена, сум (для скидки)" error={errors.oldPrice} hint="Оставьте пустым, если скидки нет. Скидка в % посчитается сама.">
                    <input id="ap-old" className="a-input a-num" inputMode="numeric" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="—" aria-invalid={!!errors.oldPrice} />
                  </Field>
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium">Варианты (необязательно)</p>
                  <p className="mb-2 text-xs text-[var(--a-muted)]">Оттенки: «Bare Rose», «Bare Peach». Распив: «5 ml» 235 000, «10 ml» 470 000. Пустая цена = основная цена.</p>
                  {rowEditor(variants, setVariants, "сум", "5 ml или название оттенка")}
                </div>
                <Field id="ap-bottle" label="Полный флакон под заказ (необязательно)" hint="Только для распива: «100 ml — 250 $». Покажется строкой под ценой.">
                  <input id="ap-bottle" className="a-input" value={bottle} onChange={(e) => setBottle(e.target.value)} placeholder="100 ml — 250 $" />
                </Field>
              </>
            ) : (
              <div>
                {errors.usd ? <p className="mb-2 text-xs text-[var(--a-rose)]" role="alert">{errors.usd}</p> : null}
                {rowEditor(usd, setUsd, "$", "100 ml")}
              </div>
            )}
          </Step>

          <Step n={3} title="Описание" hint="2–3 предложения: что это, какой эффект, кому подходит. Для ароматов — ноты и характер шлейфа. Без эмодзи и номеров Telegram — кнопки заказа уже есть на странице.">
            <Field id="ap-ru" label="По-русски" error={errors.descRu}>
              <textarea id="ap-ru" className="a-input min-h-28 resize-y" maxLength={2000} value={descRu} onChange={(e) => setDescRu(e.target.value)} placeholder="Кремовые румяна-стик. Подстраиваются под pH кожи и дают естественный розово-древесный оттенок." aria-invalid={!!errors.descRu} />
            </Field>
            <Field id="ap-uz" label="O‘zbekcha (необязательно)" hint="Если оставить пустым, узбекская версия сайта покажет русское описание.">
              <textarea id="ap-uz" className="a-input min-h-28 resize-y" maxLength={2000} value={descUz} onChange={(e) => setDescUz(e.target.value)} />
            </Field>
          </Step>

          <Step n={4} title="Фото" hint="До 6 фото. Первое — главное, оно на карточке в каталоге. Лучше всего: вертикальное 4:5 или квадрат, от 1000 px, светлый фон, без надписей и цен поверх фото. Фото сжимаются автоматически.">
            <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-center text-sm ${errors.photos ? "border-[var(--a-rose)]" : "border-[var(--a-line-strong)]"} hover:border-[var(--a-gold)]`}>
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
              <span className="font-medium">Выбрать фото</span>
              <span className="text-xs text-[var(--a-muted)]">JPG, PNG или WebP · можно несколько сразу</span>
            </label>
            {errors.photos ? <p className="text-xs text-[var(--a-rose)]" role="alert">{errors.photos}</p> : null}
            {photos.length ? (
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {photos.map((p, i) => (
                  <li key={p.url} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-[var(--a-raised)]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- локальное превью */}
                    <img src={p.url} alt="" className="size-full object-cover" />
                    {i === 0 ? <span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--a-gold)] px-2 py-0.5 text-[0.65rem] font-bold text-[var(--a-on-gold)]">Главное</span> : null}
                    <span className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                      <button type="button" className="rounded-full bg-black/60 px-2 text-xs text-white" onClick={() => movePhoto(i, -1)} aria-label="Левее">←</button>
                      <button type="button" className="rounded-full bg-black/60 px-2 text-xs text-white" onClick={() => setPhotos((ph) => ph.filter((_, j) => j !== i))} aria-label="Убрать фото">✕</button>
                      <button type="button" className="rounded-full bg-black/60 px-2 text-xs text-white" onClick={() => movePhoto(i, 1)} aria-label="Правее">→</button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Step>

          <Step n={5} title={edit ? "Проверка и сохранение" : "Проверка и публикация"} hint={edit ? "Проверьте превью справа и сохраните — изменения сразу появятся на сайте." : "Проверьте превью справа: бренд, название, цену и главное фото. После публикации товар можно скрыть или удалить в списке ниже."}>
            {message ? (
              <p className={`rounded-xl px-4 py-3 text-sm ${state === "saved" ? "bg-[rgba(143,193,154,0.12)] text-[var(--a-green)]" : "bg-[rgba(210,122,143,0.1)] text-[var(--a-rose)]"}`} role="status">
                {message}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="a-btn a-btn-gold" disabled={state === "saving"}>
                {state === "saving" ? (edit ? "Сохраняем…" : "Публикуем…") : edit ? "Сохранить изменения" : "Опубликовать товар"}
              </button>
              {edit ? (
                <button type="button" className="a-btn a-btn-line" onClick={edit.onDone}>
                  {state === "saved" ? "Готово" : "Отмена"}
                </button>
              ) : null}
              {edit?.isCatalog && edit.hasEdit ? (
                <button type="button" className="a-btn a-btn-quiet hover:!text-[var(--a-rose)]" onClick={resetEdit} disabled={state === "saving"}>
                  Вернуть как в каталоге
                </button>
              ) : null}
            </div>
          </Step>
        </form>

        {/* превью карточки — как на сайте */}
        <aside className="xl:sticky xl:top-6">
          <p className="mb-2 text-sm text-[var(--a-muted)]">Так карточка будет выглядеть в каталоге</p>
          <div className="rounded-2xl bg-[#f9f7f0] p-4 text-[#2a1a15]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#f1ebe2]">
              {photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element -- превью
                <img src={photos[0].url} alt="" className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center text-sm text-[#6e5045]">Главное фото</span>
              )}
              {mode === "sum" && num(oldPrice) > num(price) && num(price) ? (
                <span className="absolute left-2.5 top-2.5 rounded-full bg-[#f9f7f0] px-2 py-0.5 text-xs font-semibold text-[#a3425a]">
                  −{Math.round((1 - num(price) / num(oldPrice)) * 100)}%
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#6e5045]">{brand || "Бренд"}</p>
            <p className="mt-1 font-semibold leading-snug tracking-[-0.015em]">{name || "Название товара"}</p>
            <p className="mt-3 flex flex-wrap items-center gap-2">
              <span className="tag">{shownPrice}</span>
              {mode === "sum" && num(oldPrice) ? <s className="text-xs text-[#6e5045]">{formatPrice(num(oldPrice), "сум")}</s> : null}
            </p>
            <p className="mt-3 text-xs text-[#6e5045]">
              {boutique ? "Maison De Mari · " : ""}
              {CATEGORY_RU[category]}
              {variantRows.length ? ` · вариантов: ${variantRows.length}` : ""}
            </p>
          </div>
        </aside>
      </div>

      {edit ? null : (
      <section className="mt-10">
        <h2 className="mb-3 font-display text-xl">Добавленные через админку</h2>
        {demo ? (
          <p className="a-panel px-5 py-6 text-sm text-[var(--a-muted)]">В демо список пуст. Здесь будут товары, которые вы опубликуете.</p>
        ) : mine.length ? (
          <ul className="a-panel divide-y divide-[var(--a-line)]">
            {mine.filter((r) => !products.some((p) => p.slug === r.slug)).map((r) => (
              <li key={r.slug} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                {r.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- превью
                  <img src={r.images[0]} alt="" className="size-11 rounded-lg object-cover" />
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-[var(--a-muted)]">{r.brand}</span>
                  <span className="block truncate">{r.name}</span>
                </span>
                <StaffBadge name={r.created_by} action="добавила" />
                {r.updated_by && r.updated_by !== r.created_by ? <StaffBadge name={r.updated_by} action="правила" /> : null}
                <span className={r.published ? "a-chip text-[var(--a-green)]" : "a-chip text-[var(--a-muted)]"}>{r.published ? "На сайте" : "Скрыт"}</span>
                <a className="a-btn a-btn-quiet" href={`${BASE}/ru/item/?p=${r.slug}`} target="_blank" rel="noopener">Открыть</a>
                <button type="button" className="a-btn a-btn-line" onClick={() => patch(r, { published: !r.published })}>{r.published ? "Скрыть" : "Показать"}</button>
                <button type="button" className="a-btn a-btn-quiet hover:!text-[var(--a-rose)]" onClick={() => patch(r, "delete")}>Удалить</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="a-panel px-5 py-6 text-sm text-[var(--a-muted)]">Пока ничего не добавлено.</p>
        )}
      </section>
      )}
    </>
  );
}
