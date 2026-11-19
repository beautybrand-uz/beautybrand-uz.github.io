"use client";

import { useEffect, useRef } from "react";

/**
 * След от мышки по мазкам теней: при движении над мазком тянется мерцающая полоска его цвета
 * и плавно растворяется; по нажатию — облачко пудры. Один холст на всю страницу, клики не перехватывает.
 * Выключается при «уменьшить движение».
 */
type Dab = { x: number; y: number; px: number; py: number; r: number; color: string; born: number; life: number };
type Dust = { x: number; y: number; vx: number; vy: number; r: number; color: string; born: number; life: number; spark: boolean };

export function SwatchTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
    };
    resize();

    const dabs: Dab[] = [];
    const dust: Dust[] = [];
    let last: { x: number; y: number; color: string } | null = null;
    let raf = 0;

    // мазок под курсором: точка внутри эллипса, вписанного в картинку
    const swatchAt = (x: number, y: number) => {
      for (const el of document.querySelectorAll<HTMLElement>(".swatch-deco")) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const nx = (x - (r.left + r.width / 2)) / (r.width * 0.46);
        const ny = (y - (r.top + r.height / 2)) / (r.height * 0.46);
        if (nx * nx + ny * ny <= 1) return el.dataset.swatch ?? null;
      }
      return null;
    };

    const tick = () => {
      const now = performance.now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.lineCap = "round";

      for (let i = dabs.length - 1; i >= 0; i--) {
        const d = dabs[i];
        const k = 1 - (now - d.born) / d.life;
        if (k <= 0) {
          dabs.splice(i, 1);
          continue;
        }
        const ease = k * k;
        ctx.globalAlpha = 0.5 * ease;
        ctx.strokeStyle = d.color;
        ctx.lineWidth = d.r * 2 * (0.7 + 0.3 * k);
        ctx.beginPath();
        ctx.moveTo(d.px, d.py);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
        // светлая сердцевина — эффект перламутра
        ctx.globalAlpha = 0.28 * ease;
        ctx.strokeStyle = "#fff5ee";
        ctx.lineWidth = d.r * 0.55;
        ctx.stroke();
      }

      for (let i = dust.length - 1; i >= 0; i--) {
        const p = dust[i];
        const age = now - p.born;
        const k = 1 - age / p.life;
        if (k <= 0) {
          dust.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy = p.vy * 0.94 + 0.03;
        ctx.globalAlpha = (p.spark ? 0.95 : 0.6) * k;
        ctx.fillStyle = p.spark ? "#fffaf2" : p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (p.spark ? 1 : 0.6 + 0.4 * k), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = dabs.length || dust.length ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const sparkle = (x: number, y: number, color: string, n: number, speed: number) => {
      const now = performance.now();
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = speed * (0.3 + Math.random());
        dust.push({
          x, y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - speed * 0.2,
          r: 1 + Math.random() * 2.6,
          color,
          born: now,
          life: 700 + Math.random() * 700,
          spark: Math.random() < 0.35,
        });
      }
      if (dust.length > 500) dust.splice(0, dust.length - 500);
      kick();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const color = swatchAt(e.clientX, e.clientY);
      if (!color) {
        last = null;
        return;
      }
      const { clientX: x, clientY: y } = e;
      if (last && last.color === color && Math.hypot(x - last.x, y - last.y) < 140) {
        dabs.push({ x, y, px: last.x, py: last.y, r: 9 + Math.random() * 5, color, born: performance.now(), life: 1300 });
        if (dabs.length > 260) dabs.splice(0, dabs.length - 260);
        if (Math.random() < 0.35) sparkle(x, y, color, 2, 0.8);
        kick();
      }
      last = { x, y, color };
    };
    const onDown = (e: PointerEvent) => {
      const color = swatchAt(e.clientX, e.clientY);
      if (color) sparkle(e.clientX, e.clientY, color, 34, 3.2);
    };

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("resize", resize);
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[5] h-dvh w-screen" />;
}
