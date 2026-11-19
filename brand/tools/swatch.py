"""
Мазок мерцающих теней (свотч) для фона первого экрана.

  python brand/tools/swatch.py      (из корня проекта)

Рисует процедурно: форма мазка с неровным краем, продольные штрихи от аппликатора,
валик пигмента по краю, мелкие блёстки и мягкий свет сверху слева.
-> shop/public/brand/swatch.webp (прозрачный фон)
"""
import cv2
import numpy as np

W, H = 1300, 1600
rng = np.random.default_rng(12)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)


def fbm(scale, octaves=5, seed=0):
    r = np.random.default_rng(seed)
    out = np.zeros((H, W), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        s = max(2, int(scale / (2**o)))
        small = r.standard_normal((H // s + 2, W // s + 2)).astype(np.float32)
        out += amp * cv2.resize(small, (W, H), interpolation=cv2.INTER_CUBIC)
        total += amp
        amp *= 0.5
    return out / total


# ——— форма: широкий, слегка изогнутый вертикальный мазок ———
t = yy / H
center = W * (0.5 + 0.07 * np.sin(t * 2.6 + 0.4))
half = W * (0.30 + 0.035 * np.sin(t * 5.1)) * np.clip(np.sin(np.clip(t, 0, 1) * np.pi) ** 0.35, 0, 1)
edge_noise = fbm(60, 5, 1) * W * 0.035 + fbm(14, 3, 2) * W * 0.012
dist = half + edge_noise - np.abs(xx - center)  # >0 внутри мазка
# верх — округлый «старт» мазка, низ — рваный хвост
tail = np.clip((t - 0.78) / 0.22, 0, 1)
dist -= tail * (fbm(30, 4, 3) * 0.5 + 0.5) * W * 0.25
mask = np.clip(dist / 6.0, 0, 1)

# ——— фактура: продольные штрихи вдоль мазка ———
streak = rng.standard_normal((H, W)).astype(np.float32)
streak = cv2.GaussianBlur(streak, (0, 0), sigmaX=1.8, sigmaY=60)
streak = (streak - streak.mean()) / (streak.std() + 1e-6)
grain = cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), 0.7)

# валик пигмента вдоль левого края (как на свотче помады/теней)
left_d = (xx - (center - half - edge_noise)) / (W * 0.03)
ridge = np.exp(-((left_d - 1.2) ** 2) / 0.9) * mask

height = streak * 0.18 + grain * 0.1 + ridge * 1.4 + fbm(90, 4, 4) * 0.5
gy, gx = np.gradient(cv2.GaussianBlur(height, (0, 0), 1.0))
nx, ny, nz = -gx * 2.4, -gy * 2.4, np.ones_like(gx)
n = np.sqrt(nx**2 + ny**2 + nz**2)
light = np.array([-0.45, -0.55, 0.7])
light /= np.linalg.norm(light)
shade = np.clip((nx * light[0] + ny * light[1] + nz * light[2]) / n, 0, 1)

# ——— цвет: лилово-нюдовый, светлее по центру, плотнее по краю ———
base = np.array([0x63, 0x6c, 0x9e], np.float32)  # BGR #9e6c63
hi = np.array([0xa8, 0xb4, 0xdc], np.float32)  # BGR #dcb4a8
deep = np.array([0x4a, 0x50, 0x78], np.float32)  # BGR #78504a
body = (dist / (W * 0.25)).clip(0, 1)[..., None]
col = deep * (1 - body) * 0.45 + base * (0.55 + body * 0.45)
col = col * (0.55 + shade[..., None] * 0.75) + hi * np.clip(shade - 0.78, 0, 1)[..., None] * 1.6

# блёстки
spark = (rng.random((H, W)) > 0.988).astype(np.float32)
spark = cv2.GaussianBlur(spark, (0, 0), 0.7) * 3.6
spark *= np.clip(shade * 1.4, 0, 1)
col += spark[..., None] * np.array([235, 240, 255], np.float32) * 0.55

col = np.clip(col, 0, 255)
alpha = (mask * 255).astype(np.uint8)
alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)
rgba = np.dstack([col.astype(np.uint8), alpha])
ok, buf = cv2.imencode(".webp", rgba, [cv2.IMWRITE_WEBP_QUALITY, 88])
assert ok
buf.tofile("shop/public/brand/swatch.webp")
ok, buf = cv2.imencode(".png", rgba)
buf.tofile("brand/png/swatch.png")
print("ok", W, H)
