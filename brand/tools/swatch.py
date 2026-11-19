"""
Мазки мерцающих теней (свотчи) — декор для всего сайта.

  python brand/tools/swatch.py      (из корня проекта)

Каждый мазок рисуется процедурно: форма с неровным краем, продольные штрихи
от аппликатора, валик пигмента по краю, блёстки и мягкий свет сверху слева.
-> shop/public/brand/swatches/<name>.webp (прозрачный фон)
   shop/public/brand/swatch.webp — розово-лиловый мазок первого экрана
"""
import os

import cv2
import numpy as np


def hex_bgr(h):
    h = h.lstrip("#")
    return np.array([int(h[4:6], 16), int(h[2:4], 16), int(h[0:2], 16)], np.float32)


def make(base_hex, seed=12, W=1300, H=1600, width=0.30, sparkle=0.988, horizontal=False, tail_len=0.22):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

    def fbm(scale, octaves=5, s=0):
        r = np.random.default_rng(seed * 31 + s)
        out = np.zeros((H, W), np.float32)
        amp, total = 1.0, 0.0
        for o in range(octaves):
            k = max(2, int(scale / (2**o)))
            small = r.standard_normal((H // k + 2, W // k + 2)).astype(np.float32)
            out += amp * cv2.resize(small, (W, H), interpolation=cv2.INTER_CUBIC)
            total += amp
            amp *= 0.5
        return out / total

    t = yy / H
    center = W * (0.5 + 0.07 * np.sin(t * 2.6 + 0.4 + seed))
    half = W * (width + 0.035 * np.sin(t * 5.1 + seed)) * np.clip(np.sin(np.clip(t, 0, 1) * np.pi) ** 0.35, 0, 1)
    edge_noise = fbm(60, 5, 1) * W * 0.035 + fbm(14, 3, 2) * W * 0.012
    dist = half + edge_noise - np.abs(xx - center)
    tail = np.clip((t - (1 - tail_len)) / tail_len, 0, 1)
    dist -= tail * (fbm(30, 4, 3) * 0.5 + 0.5) * W * 0.25
    mask = np.clip(dist / 6.0, 0, 1)

    streak = rng.standard_normal((H, W)).astype(np.float32)
    streak = cv2.GaussianBlur(streak, (0, 0), sigmaX=1.8, sigmaY=60)
    streak = (streak - streak.mean()) / (streak.std() + 1e-6)
    grain = cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), 0.7)
    left_d = (xx - (center - half - edge_noise)) / (W * 0.03)
    ridge = np.exp(-((left_d - 1.2) ** 2) / 0.9) * mask

    height = streak * 0.18 + grain * 0.1 + ridge * 1.4 + fbm(90, 4, 4) * 0.5
    gy, gx = np.gradient(cv2.GaussianBlur(height, (0, 0), 1.0))
    nx, ny, nz = -gx * 2.4, -gy * 2.4, np.ones_like(gx)
    n = np.sqrt(nx**2 + ny**2 + nz**2)
    light = np.array([-0.45, -0.55, 0.7])
    light /= np.linalg.norm(light)
    shade = np.clip((nx * light[0] + ny * light[1] + nz * light[2]) / n, 0, 1)

    base = hex_bgr(base_hex)
    hi = base + (255 - base) * 0.45
    deep = base * 0.72
    body = (dist / (W * 0.25)).clip(0, 1)[..., None]
    col = deep * (1 - body) * 0.45 + base * (0.55 + body * 0.45)
    col = col * (0.55 + shade[..., None] * 0.75) + hi * np.clip(shade - 0.78, 0, 1)[..., None] * 1.6

    spark = (rng.random((H, W)) > sparkle).astype(np.float32)
    spark = cv2.GaussianBlur(spark, (0, 0), 0.7) * 3.6
    spark *= np.clip(shade * 1.4, 0, 1)
    col += spark[..., None] * np.array([235, 240, 255], np.float32) * 0.55

    col = np.clip(col, 0, 255)
    alpha = cv2.GaussianBlur((mask * 255).astype(np.uint8), (0, 0), 0.8)
    rgba = np.dstack([col.astype(np.uint8), alpha])
    ys, xs = np.where(alpha > 4)
    rgba = rgba[max(ys.min() - 8, 0) : ys.max() + 8, max(xs.min() - 8, 0) : xs.max() + 8]
    if horizontal:
        rgba = cv2.rotate(rgba, cv2.ROTATE_90_COUNTERCLOCKWISE)
    return rgba


def save(rgba, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    ok, buf = cv2.imencode(".webp", rgba, [cv2.IMWRITE_WEBP_QUALITY, 86])
    assert ok
    buf.tofile(path)


# name: (цвет, seed, вертикальный/горизонтальный, ширина, размер)
SWATCHES = {
    "rose": ("#9e6c63", 12, False, 0.30, (1300, 1600)),
    "gold": ("#c6a065", 5, True, 0.26, (1000, 1700)),
    "bronze": ("#8c5a3f", 21, False, 0.28, (1000, 1300)),
    "pink": ("#c7808d", 33, True, 0.24, (900, 1600)),
    "plum": ("#6f3e55", 44, False, 0.30, (1100, 1400)),
    "peach": ("#d29f86", 57, True, 0.25, (900, 1500)),
}

if __name__ == "__main__":
    for name, (hexc, seed, horiz, width, (w, h)) in SWATCHES.items():
        img = make(hexc, seed=seed, W=w, H=h, width=width, horizontal=horiz)
        save(img, f"shop/public/brand/swatches/{name}.webp")
        if name == "rose":
            save(img, "shop/public/brand/swatch.webp")
        print("ok", name, img.shape[1], "x", img.shape[0])
