/**
 * Отзывы через Supabase (REST, без SDK).
 * Ключи задаются при сборке: NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY
 * (в GitHub — Settings → Secrets → Actions: SUPABASE_URL и SUPABASE_ANON_KEY).
 * Пока ключей нет, отзыв отправляется менеджеру в Telegram.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const reviewsEnabled = Boolean(URL && KEY);

export type Review = {
  id: string;
  created_at: string;
  product: string;
  name: string;
  rating: number;
  text: string;
  lang: "ru" | "uz";
};

const headers = () => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" });

export async function fetchReviews(product?: string, limit = 50): Promise<Review[]> {
  if (!reviewsEnabled) return [];
  const q = new URLSearchParams({
    select: "id,created_at,product,name,rating,text,lang",
    status: "eq.approved",
    order: "created_at.desc",
    limit: String(limit),
  });
  if (product) q.set("product", `eq.${product}`);
  const res = await fetch(`${URL}/rest/v1/reviews?${q}`, { headers: headers() });
  if (!res.ok) throw new Error(`reviews ${res.status}`);
  return res.json();
}

export async function submitReview(r: Pick<Review, "product" | "name" | "rating" | "text" | "lang">) {
  const res = await fetch(`${URL}/rest/v1/reviews`, {
    method: "POST",
    // отзыв «на проверке» прочитать нельзя, поэтому ответ без тела
    headers: { ...headers(), Prefer: "return=minimal" },
    body: JSON.stringify({ ...r, status: "pending" }),
  });
  if (!res.ok) throw new Error(`submit ${res.status}`);
}
