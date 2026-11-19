/**
 * Минимальный клиент Supabase на fetch (REST + вход по паролю), без SDK.
 * Ключи при сборке: NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * anon-ключ публичный по замыслу Supabase: доступ ограничивают правила RLS (supabase/*.sql).
 */
export const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseEnabled = Boolean(SB_URL && SB_KEY);

export type Session = { access_token: string; refresh_token: string; expires_at: number; email: string };

const SESSION_KEY = "bb-admin-session";

export function headers(token?: string): Record<string, string> {
  return { apikey: SB_KEY, Authorization: `Bearer ${token ?? SB_KEY}`, "Content-Type": "application/json" };
}

export async function rest<T = unknown>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = init;
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, { ...rest, headers: { ...headers(token), ...(rest.headers ?? {}) } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => "")}`);
  return res.status === 204 || res.headers.get("content-length") === "0" ? (undefined as T) : res.json();
}

function toSession(j: { access_token: string; refresh_token: string; expires_in: number; user?: { email?: string } }, email?: string): Session {
  return {
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: Date.now() + j.expires_in * 1000,
    email: j.user?.email ?? email ?? "",
  };
}

export async function signIn(email: string, password: string): Promise<Session> {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(res.status === 400 ? "wrong" : String(res.status));
  const s = toSession(await res.json(), email);
  save(s);
  return s;
}

async function refresh(s: Session): Promise<Session | null> {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ refresh_token: s.refresh_token }),
  });
  if (!res.ok) return null;
  const n = toSession(await res.json(), s.email);
  save(n);
  return n;
}

function save(s: Session | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* хранилище недоступно — сессия живёт до перезагрузки */
  }
}

/** Сохранённая сессия; за минуту до истечения обновляется */
export async function currentSession(): Promise<Session | null> {
  let s: Session | null = null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    s = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    s = null;
  }
  if (!s) return null;
  if (s.expires_at - Date.now() < 60_000) s = await refresh(s);
  if (!s) save(null);
  return s;
}

export function signOut() {
  save(null);
}

export async function isAdmin(token: string): Promise<boolean> {
  return rest<boolean>("rpc/is_admin", { method: "POST", token, body: "{}" });
}
