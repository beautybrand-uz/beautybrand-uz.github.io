"""
Нарисованная косметика для декора сайта (в дополнение к мазкам теней из swatch.py).

  python brand/tools/cosmetics.py      (из корня проекта, после swatch.py)

Помада, карандаш/подводка, хайлайтер и румяна, блеск и лак, тушь — всё процедурно.
-> shop/public/brand/swatches/<name>.webp
-> shop/src/data/swatches.json  (размеры и цвет каждого — для компонента Swatch и следа мышки)
"""
import json
import os

import cv2
import numpy as np

OUT = "shop/public/brand/swatches"
os.makedirs(OUT, exist_ok=True)
LIGHT = np.array([-0.45, -0.6, 0.66])
LIGHT /= np.linalg.norm(LIGHT)
HALF = (LIGHT + np.array([0, 0, 1.0])) / np.linalg.norm(LIGHT + np.array([0, 0, 1.0]))


def bgr(h):
    h = h.lstrip("#")
    return np.array([int(h[4:6], 16), int(h[2:4], 16), int(h[0:2], 16)], np.float32)


def noise(shape, sigma, rng):
    n = cv2.GaussianBlur(rng.standard_normal(shape).astype(np.float32), (0, 0), sigma)
    return (n - n.mean()) / (n.std() + 1e-6)


def path(n, x0, x1, y, amp, waves, phase, rng):
    xs = np.linspace(x0, x1, n)
    ys = y + amp * np.sin(np.linspace(0, waves * np.pi, n) + phase) + noise((n, 1), 25, rng)[:, 0] * amp * 0.08
    return np.stack([xs, ys], 1)


def stroke_mask(shape, pts, radii):
    m = np.zeros(shape, np.uint8)
    for (x, y), r in zip(pts, radii):
        cv2.circle(m, (int(x * 4), int(y * 4)), max(1, int(r * 4)), 255, -1, cv2.LINE_AA, shift=2)
    return m.astype(np.float32) / 255


def shade(height, k=2.6):
    gy, gx = np.gradient(height)
    nx, ny, nz = -gx * k, -gy * k, np.ones_like(gx)
    n = np.sqrt(nx**2 + ny**2 + nz**2)
    nx, ny, nz = nx / n, ny / n, nz / n
    diff = np.clip(nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2], 0, 1)
    spec = np.clip(nx * HALF[0] + ny * HALF[1] + nz * HALF[2], 0, 1)
    return diff, spec


def finish(col, alpha, name):
    rgba = np.dstack([np.clip(col, 0, 255).astype(np.uint8), np.clip(alpha * 255, 0, 255).astype(np.uint8)])
    ys, xs = np.where(rgba[:, :, 3] > 4)
    rgba = rgba[max(ys.min() - 6, 0) : ys.max() + 6, max(xs.min() - 6, 0) : xs.max() + 6]
    ok, buf = cv2.imencode(".webp", rgba, [cv2.IMWRITE_WEBP_QUALITY, 86])
    assert ok
    buf.tofile(f"{OUT}/{name}.webp")
    return rgba.shape[1], rgba.shape[0]


# ——— помада: плотный кремовый мазок с глянцем и срезанным началом ———
def lipstick(name, hexc, seed):
    rng = np.random.default_rng(seed)
    H, W = 520, 1500
    n = 1400
    pts = path(n, 120, 1380, 260, 40, 1.2, seed * 0.7, rng)
    t = np.linspace(0, 1, n)
    r = 95 * (np.clip(t / 0.04, 0, 1) ** 0.5) * (1 - np.clip((t - 0.72) / 0.28, 0, 1) ** 1.6 * 0.75)
    m = stroke_mask((H, W), pts, r)
    # хвост мазка рвётся: пигмента не хватает
    tailmask = np.clip((np.mgrid[0:H, 0:W][1] / W - 0.7) / 0.3, 0, 1)
    breakup = (noise((H, W), 2.2, rng) + noise((H, W), 9, rng) * 0.8) > (-3.2 + tailmask**0.8 * 4.6)
    m = m * np.where(tailmask > 0, breakup, True)
    dist = cv2.distanceTransform((m > 0.5).astype(np.uint8), cv2.DIST_L2, 5)
    height = np.sqrt(np.clip(dist / 40, 0, 1)) * 3 + noise((H, W), 1.4, rng) * 0.05
    streaks = cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), sigmaX=40, sigmaY=1.6)
    height += streaks * 0.12
    diff, spec = shade(cv2.GaussianBlur(height, (0, 0), 1.2), 3.4)
    base = bgr(hexc)
    col = base * (0.42 + diff[..., None] * 0.7) + np.array([255, 255, 255]) * (spec[..., None] ** 60) * 0.85
    return finish(col, cv2.GaussianBlur(m, (0, 0), 0.7), name)


# ——— карандаш / подводка: тонкая линия с зерном бумаги ———
def pencil(name, hexc, seed, width=11, waves=2.2):
    rng = np.random.default_rng(seed)
    H, W = 360, 1500
    n = 1600
    pts = path(n, 60, 1440, 180, 70, waves, seed, rng)
    t = np.linspace(0, 1, n)
    r = width * np.clip(np.sin(t * np.pi) ** 0.5, 0.15, 1) * (1 + 0.15 * noise((n, 1), 30, rng)[:, 0])
    m = stroke_mask((H, W), pts, r)
    grain = noise((H, W), 0.8, rng) * 0.6 + noise((H, W), 3, rng) * 0.4
    pigment = np.clip((grain + 1.1) / 1.6, 0, 1)
    alpha = m * (0.55 + 0.45 * pigment) * (grain > -1.5)
    base = bgr(hexc)
    col = base * (0.85 + 0.25 * pigment[..., None])
    return finish(col, alpha, name)


# ——— хайлайтер / румяна: пудровое пятно, втёртое пальцем ———
def powder(name, hexc, seed, spark=0.985, glow=0.9):
    rng = np.random.default_rng(seed)
    H = W = 900
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    ang = np.arctan2(yy - H / 2, xx - W / 2)
    rad = np.hypot(xx - W / 2, yy - H / 2) / (W * 0.36)
    edge = 1 + 0.12 * np.sin(ang * 3 + seed) + 0.06 * noise((H, W), 18, rng)
    core = np.clip(1.15 - rad / edge, 0, 1)
    alpha = np.clip(core * 1.4, 0, 1) ** 1.3 * (0.75 + 0.25 * noise((H, W), 6, rng).clip(-1, 1))
    swirl = cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), sigmaX=30, sigmaY=2)
    M = cv2.getRotationMatrix2D((W / 2, H / 2), 25 + seed * 7, 1)
    swirl = cv2.warpAffine(swirl, M, (W, H), borderMode=cv2.BORDER_REFLECT)
    base = bgr(hexc)
    sheen = np.clip(0.5 + swirl * 0.25 + (1 - rad) * glow * 0.5, 0, 1.4)[..., None]
    col = base * (0.75 + sheen * 0.45)
    s = (rng.random((H, W)) > spark).astype(np.float32)
    s = cv2.GaussianBlur(s, (0, 0), 0.8) * 4
    col += s[..., None] * np.array([240, 245, 255], np.float32) * 0.6
    return finish(col, np.clip(alpha, 0, 1), name)


# ——— блеск / лак: глянцевая капля ———
def drop(name, hexc, seed, translucent=0.88):
    rng = np.random.default_rng(seed)
    H, W = 700, 900
    m = np.zeros((H, W), np.uint8)
    cv2.ellipse(m, (430, 380), (250, 210), -12, 0, 360, 255, -1, cv2.LINE_AA)
    cv2.ellipse(m, (680, 300), (95, 70), -25, 0, 360, 255, -1, cv2.LINE_AA)
    cv2.line(m, (430, 380), (700, 300), 255, 90, cv2.LINE_AA)
    cv2.circle(m, (190, 520), 38, 255, -1, cv2.LINE_AA)
    m = cv2.GaussianBlur(m, (0, 0), 14)
    m = (m > 120).astype(np.uint8)
    wob = noise((H, W), 25, rng) * 6
    dist = cv2.distanceTransform(m, cv2.DIST_L2, 5) + wob * (m > 0)
    height = (1 - np.exp(-np.clip(dist, 0, None) / 70)) * 7
    diff, spec = shade(cv2.GaussianBlur(height, (0, 0), 6), 2.6)
    base = bgr(hexc)
    rim = np.clip(1 - dist / 25, 0, 1)[..., None]
    col = base * (0.5 + diff[..., None] * 0.6) * (1 - rim * 0.25) + 255 * (spec[..., None] ** 50) * 1.2 + 255 * (spec[..., None] ** 8) * 0.18
    alpha = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1) * translucent + (spec ** 90) * 0.12
    return finish(col, alpha, name)


# ——— тушь: росчерк щёточки, тонкие штрихи-ресницы ———
def mascara(name, hexc, seed):
    rng = np.random.default_rng(seed)
    H, W = 520, 1300
    m = np.zeros((H, W), np.float32)
    for i in range(34):
        x0 = 80 + i * 32 + rng.normal(0, 10)
        y0 = 420 - 40 * np.sin(i / 34 * np.pi) + rng.normal(0, 6)
        length = 180 + 160 * np.sin(i / 34 * np.pi) + rng.normal(0, 40)
        bend = rng.normal(0.9, 0.15)
        t = np.linspace(0, 1, 120)
        xs = x0 + t * length * 0.35 * bend + t**2 * 60
        ys = y0 - t * length
        r = 6.5 * (1 - t) ** 1.2 + 0.8
        m = np.maximum(m, stroke_mask((H, W), np.stack([xs, ys], 1), r))
        if rng.random() < 0.35:  # комочки туши
            k = rng.uniform(0.2, 0.7)
            cv2.circle(m, (int(x0 + k * length * 0.35 * bend + k**2 * 60), int(y0 - k * length)), int(rng.uniform(4, 8)), 1.0, -1, cv2.LINE_AA)
    base = bgr(hexc)
    dist = cv2.distanceTransform((m > 0.5).astype(np.uint8), cv2.DIST_L2, 3)
    diff, spec = shade(np.sqrt(np.clip(dist / 5, 0, 1)) * 1.5, 2.0)
    col = base * (0.6 + diff[..., None] * 0.5) + 255 * (spec[..., None] ** 40) * 0.35
    return finish(col, cv2.GaussianBlur(m, (0, 0), 0.6), name)


ITEMS = {
    "lipstick-red": (lipstick, "#b3263a", 3),
    "lipstick-berry": (lipstick, "#7d2040", 7),
    "lipstick-nude": (lipstick, "#c98a78", 11),
    "liner-black": (pencil, "#1f1714", 5),
    "brow-brown": (pencil, "#6b4a35", 9),
    "lipliner-burgundy": (pencil, "#7a2a36", 13),
    "highlighter-gold": (powder, "#e6c68e", 4),
    "blush-pink": (powder, "#e59aa3", 8),
    "gloss-pink": (drop, "#e48aa0", 2),
    "polish-red": (drop, "#a4182c", 6),
    "mascara-black": (mascara, "#1b1513", 1),
}
TRAIL = {
    "lipstick-red": "#b3263a", "lipstick-berry": "#7d2040", "lipstick-nude": "#c98a78",
    "liner-black": "#3a2e2a", "brow-brown": "#6b4a35", "lipliner-burgundy": "#7a2a36",
    "highlighter-gold": "#e6c68e", "blush-pink": "#e59aa3", "gloss-pink": "#e48aa0",
    "polish-red": "#a4182c", "mascara-black": "#3a2e2a",
}
OLD = {"rose": "#a87268", "gold": "#c9a468", "bronze": "#8f5d41", "pink": "#c9828f", "plum": "#7a4560", "peach": "#d6a48a"}

if __name__ == "__main__":
    meta = {}
    for name, color in OLD.items():
        im = cv2.imdecode(np.fromfile(f"{OUT}/{name}.webp", np.uint8), cv2.IMREAD_UNCHANGED)
        meta[name] = {"color": color, "w": im.shape[1], "h": im.shape[0]}
    for name, (fn, hexc, seed) in ITEMS.items():
        w, h = fn(name, hexc, seed)
        meta[name] = {"color": TRAIL[name], "w": w, "h": h}
        print("ok", name, w, "x", h)
    json.dump(meta, open("shop/src/data/swatches.json", "w", encoding="utf-8"), indent=1)
