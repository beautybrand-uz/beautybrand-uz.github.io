"use client";

import { createContext, useContext } from "react";
import { rest } from "@/lib/supabase";

/**
 * Сотрудницы магазина. У каждой свой логин (почта) и пароль в Supabase.
 * Имя попадает в базу само (триггеры в supabase/admin.sql) — подделать его из браузера нельзя.
 * Чтобы добавить сотрудницу: строка здесь + аккаунт в Supabase + запись в таблице admins (см. admin.sql).
 */
export type Staff = { name: string; login: string; role: string; color: string };

export const STAFF: Staff[] = [
  { name: "Малика", login: "malika@beautybrand.uz", role: "Администратор", color: "#c9a468" },
  { name: "Дилноза", login: "dilnoza@beautybrand.uz", role: "Менеджер заказов", color: "#c9828f" },
  { name: "Севара", login: "sevara@beautybrand.uz", role: "Контент и товары", color: "#8fb8c9" },
];

export const staffByName = (name?: string | null) => STAFF.find((s) => s.name === name);

/** Кто сейчас работает в админке */
export const MeContext = createContext<string>("");
export const useMe = () => useContext(MeContext);

/** Имя из базы для вошедшего аккаунта (таблица admins.name) */
export async function myName(token: string): Promise<string | null> {
  try {
    const n = await rest<string | null>("rpc/my_name", { method: "POST", token, body: "{}" });
    return n || null;
  } catch {
    return null;
  }
}

export function Avatar({ name, size = 20 }: { name: string; size?: number }) {
  const s = staffByName(name);
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-bold text-[#1b120f]"
      style={{ width: size, height: size, fontSize: size * 0.48, background: s?.color ?? "var(--a-muted)" }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

/** Маленький значок «кто сделал»: кружок с буквой + имя (+ что сделала) */
export function StaffBadge({ name, action, title }: { name?: string | null; action?: string; title?: string }) {
  if (!name) return null;
  return (
    <span
      title={title ?? (action ? `${action}: ${name}` : name)}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--a-line)] bg-[var(--a-raised)]/60 py-0.5 pl-0.5 pr-2 text-[0.7rem] font-medium text-[var(--a-text)]"
    >
      <Avatar name={name} size={16} />
      {action ? <span className="text-[var(--a-muted)]">{action}</span> : null}
      {name}
    </span>
  );
}
