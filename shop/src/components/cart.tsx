"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct } from "@/data/products";
import { track } from "@/lib/track";
import { loadExtraProducts } from "@/lib/extra-products";

export type CartLine = { slug: string; variant?: string; qty: number };

type CartCtx = {
  lines: CartLine[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, variant?: string) => void;
  setQty: (slug: string, variant: string | undefined, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "bb-cart-v1";

export function lineProduct(line: CartLine) {
  const product = getProduct(line.slug);
  if (!product) return null;
  const variant = product.variants?.find((v) => v.label === line.variant);
  return { product, price: variant?.price ?? product.price };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    loadExtraProducts().finally(() => {
      if (!alive) return;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CartLine[];
          setLines(parsed.filter((l) => getProduct(l.slug) && l.qty > 0));
        }
      } catch {
        /* хранилище недоступно — корзина просто пустая */
      }
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, loaded]);

  const add = useCallback((slug: string, variant?: string) => {
    track("add", slug);
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === slug && l.variant === variant);
      if (i === -1) return [...prev, { slug, variant, qty: 1 }];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + 1 };
      return next;
    });
  }, []);

  const setQty = useCallback((slug: string, variant: string | undefined, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.slug === slug && l.variant === variant))
        : prev.map((l) => (l.slug === slug && l.variant === variant ? { ...l, qty } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(() => {
    let count = 0;
    let total = 0;
    for (const l of lines) {
      const info = lineProduct(l);
      if (!info) continue;
      count += l.qty;
      total += info.price * l.qty;
    }
    return { lines, count, total, open, setOpen, add, setQty, clear };
  }, [lines, open, add, setQty, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
