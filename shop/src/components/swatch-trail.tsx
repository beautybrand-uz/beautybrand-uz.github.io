"use client";

import { useEffect, useRef } from "react";

/**
 * След по нарисованной косметике.
 * - Мышкой по мазку — остаётся размазанный след его цвета (как пальцем по помаде), он не исчезает
 *   до перезагрузки страницы и двигается вместе с мазком при прокрутке.
 * - Нажатие (и касание на телефоне) — отпечаток пальца и облачко блёсток.
 * След рисуется на отдельном холсте поверх каждого мазка (под контентом), блёстки — на общем холсте.
 */
type Dust = { x: number; y: number; vx: number; vy: number; r: number; color: string; born: number; life: number; spark: boolean };
type Layer = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; dpr: number };

const layers = new WeakMap<HTMLElement, Layer>();

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k)));
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
}

/** Холст поверх мазка: те же классы позиционирования и поворота, тот же размер */
function layerFor(img: HTMLElement): Layer | null {
  const existing = layers.get(img);
  if (existing && existing.canvas.isConnected) return existing;
  const w = img.offsetWidth;
  const h = img.offsetHeight;
  if (!w || !h) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.className = img.className.replace("swatch-deco", "swatch-paint");
  canvas.setAttribute("aria-hidden", "true");
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  img.insertAdjacentElement("afterend", canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const layer = { canvas, ctx, dpr };
  layers.set(img, layer);
  return layer;
}

/** Точка экрана → координаты внутри мазка с учётом его поворота */
function toLocal(img: HTMLElement, x: number, y: number) {
  const parent = (img.offsetParent as HTMLElement | null) ?? document.body;
  const pr = parent.getBoundingClientRect();
  const qx = x - (pr.left + parent.clientLeft + img.offsetLeft);
  const qy = y - (pr.top + parent.clientTop + img.offsetTop);
  const cs = getComputedStyle(img);
  if (!cs.transform || cs.transform === "none") return { x: qx, y: qy };
  const [ox, oy] = cs.transformOrigin.split(" ").map(parseFloat);
  const p = new DOMMatrix(cs.transform).inverse().transformPoint(new DOMPoint(qx - ox, qy - oy));
  return { x: p.x + ox, y: p.y + oy };
}

/** Мазок под курсором: точка внутри эллипса, вписанного в картинку */
function swatchAt(x: number, y: number) {
  for (const el of document.querySelectorAll<HTMLElement>(".swatch-deco[data-swatch]")) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    const nx = (x - (r.left + r.width / 2)) / (r.width * 0.48);
    const ny = (y - (r.top + r.height / 2)) / (r.height * 0.48);
    if (nx * nx + ny * ny <= 1) return el;
  }
  return null;
}

function smear(layer: Layer, color: string, a: { x: number; y: number }, b: { x: number; y: number }, width: number) {
  const { ctx } = layer;
  // валик продукта по краям следа — темнее
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = shade(color, -0.25);
  ctx.lineWidth = width * 1.25;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  // сам след — продукт размазан тонким слоем, светлее
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = shade(color, 0.18);
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** След остаётся только внутри формы мазка (по прозрачности самой картинки) */
function clipToShape(layer: Layer, img: HTMLElement) {
  const { ctx } = layer;
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(img as HTMLImageElement, 0, 0, img.offsetWidth, img.offsetHeight);
  ctx.globalCompositeOperation = "source-over";
}

function fingerprint(layer: Layer, color: string, p: { x: number; y: number }, r: number) {
  const { ctx } = layer;
  const g = ctx.createRadialGradient(p.x - r * 0.25, p.y - r * 0.3, r * 0.1, p.x, p.y, r);
  g.addColorStop(0, shade(color, 0.35));
  g.addColorStop(0.7, shade(color, 0.12));
  g.addColorStop(1, shade(color, -0.3));
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, r, r * 0.82, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function SwatchTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      // размеры мазков могли поменяться — слои пересоздадутся при следующем касании
      document.querySelectorAll(".swatch-paint").forEach((c) => c.remove());
    };
    resize();

    const dust: Dust[] = [];
    let last: { el: HTMLElement; local: { x: number; y: number } } | null = null;
    let raf = 0;

    const tick = () => {
      const now = performance.now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = dust.length - 1; i >= 0; i--) {
        const p = dust[i];
        const k = 1 - (now - p.born) / p.life;
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
      raf = dust.length ? requestAnimationFrame(tick) : 0;
    };

    const sparkle = (x: number, y: number, color: string, n: number, speed: number) => {
      if (reduce) return;
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
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = swatchAt(e.clientX, e.clientY);
      if (!el) {
        last = null;
        return;
      }
      const layer = layerFor(el);
      if (!layer) return;
      const local = toLocal(el, e.clientX, e.clientY);
      const color = el.dataset.swatch ?? "#a87268";
      if (last && last.el === el && Math.hypot(local.x - last.local.x, local.y - last.local.y) < 160) {
        // ширина следа — как подушечка пальца, но не больше трети мазка
        const width = Math.min(26, Math.max(8, Math.min(el.offsetWidth, el.offsetHeight) * 0.3));
        smear(layer, color, last.local, local, width);
        clipToShape(layer, el);
        if (Math.random() < 0.25) sparkle(e.clientX, e.clientY, color, 2, 0.8);
      }
      last = { el, local };
    };

    const onDown = (e: PointerEvent) => {
      const el = swatchAt(e.clientX, e.clientY);
      if (!el) return;
      const layer = layerFor(el);
      const color = el.dataset.swatch ?? "#a87268";
      if (layer) {
        const r = Math.min(18, Math.max(7, Math.min(el.offsetWidth, el.offsetHeight) * 0.22));
        fingerprint(layer, color, toLocal(el, e.clientX, e.clientY), r);
        clipToShape(layer, el);
      }
      sparkle(e.clientX, e.clientY, color, 34, 3.2);
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
