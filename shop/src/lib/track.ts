import { rest, supabaseEnabled } from "./supabase";

/**
 * Анонимные события для аналитики спроса в админке: просмотр товара и добавление в корзину.
 * Просмотр одного товара считается один раз за сессию. Ошибки молча игнорируются.
 */
export function track(type: "view" | "add", product: string) {
  if (!supabaseEnabled || typeof window === "undefined") return;
  if (type === "view") {
    try {
      const key = `bb-viewed-${product}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* хранилище недоступно — считаем как есть */
    }
  }
  const lang = location.pathname.includes("/uz/") ? "uz" : "ru";
  rest("events", {
    method: "POST",
    keepalive: true,
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ type, product, lang }),
  }).catch(() => {});
}
