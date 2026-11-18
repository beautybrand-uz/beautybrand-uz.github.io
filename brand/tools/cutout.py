"""
Логотипы без надписи и без фона.

  python brand/tools/cutout.py      (из корня проекта)

1. Стирает рукописную надпись «Beautybrand» внизу (inpainting), картинка не обрезается
   -> brand/girl-<key>.png   (полный кадр 1254×1254, без надписи, фон-бумага сохранён)
2. Вырезает девушку с прозрачным фоном (GrabCut + мягкие края по цвету бумаги)
   -> brand/png/girl-<key>-cutout.png
"""
import cv2
import numpy as np

SOURCES = {
    "glam": "brand/Гламурный бьюти-портрет с футляром MAC.png",
    "classic": "brand/Гламурный портрет с ярким синим глазом.png",
    "34": "brand/Портрет женщины с тюбиком MAC.png",
}
TEXT_TOP = 1030  # надпись ниже этой линии (из 1254)


def read(path):
    return cv2.imdecode(np.fromfile(path, np.uint8), cv2.IMREAD_COLOR)


def write(path, img):
    ok, buf = cv2.imencode(".png", img)
    assert ok
    buf.tofile(path)


def erase_text(bgr):
    h, w = bgr.shape[:2]
    s = h / 1254
    b, g, r = [bgr[:, :, i].astype(int) for i in range(3)]
    mx = np.maximum(np.maximum(r, g), b)
    # буквы: очень тёмные и нейтральные; волосы — тёмные, но с коричневым оттенком (r заметно больше b)
    core = (mx < 120) & ((r - b) < 10) & ((r - g) < 10)
    core[: int(TEXT_TOP * s), :] = False
    mask = core.astype(np.uint8) * 255
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=2)  # захватываем сглаженные края букв
    return cv2.inpaint(bgr, mask, 7, cv2.INPAINT_TELEA), mask


def cutout(bgr):
    h, w = bgr.shape[:2]
    gc = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    # точно фон — поля по краям
    m = int(0.03 * w)
    gc[:m, :] = gc[:, :m] = gc[:, -m:] = cv2.GC_BGD
    # вероятно девушка — центральная область
    gc[int(0.04 * h) : int(0.92 * h), int(0.12 * w) : int(0.88 * w)] = cv2.GC_PR_FGD
    # точно девушка — тёмные волосы и кожа (сильно отличаются от бумаги)
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    paper = np.median(np.concatenate([lab[:m].reshape(-1, 3), lab[:, :m].reshape(-1, 3), lab[:, -m:].reshape(-1, 3)]), 0)
    dist = np.linalg.norm(lab - paper, axis=2)
    gc[dist > 45] = cv2.GC_FGD
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(bgr, gc, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    hard = np.where((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)

    # «Тело» (белый топ и кожа ниже плеч) по цвету похоже на бумагу — защищаем его отдельно:
    # в каждой строке ниже плеч заливаем всё между крайними тёмными пикселями (волосы/кожа)
    strong = dist > 45
    # границы тела ищем по крупным массам волос/кожи — тонкие отдельные пряди не учитываем
    strong = cv2.morphologyEx(strong.astype(np.uint8), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))) > 0
    body = np.zeros((h, w), bool)
    y_start = int(0.58 * h)
    rows = []
    for y in range(y_start, h):
        xs = np.where(strong[y] & (hard[y] > 0))[0]
        if len(xs) > 1 and xs[-1] - xs[0] > 0.2 * w:
            body[y, xs[0] : xs[-1] + 1] = True
            rows.append(y)
    body = cv2.morphologyEx(body.astype(np.uint8) * 255, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8)) > 0
    body_weight = np.ones((h, w), np.float32)
    if rows:
        # низ тела мягко растворяется, как в исходной иллюстрации
        y_end = max(rows)
        fade = 90
        for y in range(max(y_end - fade, 0), y_end + 1):
            body_weight[y] = (y_end - y) / fade

    # убираем из маски светлые «бумажные» пиксели по краям прядей (кроме тела)
    hard = np.where(((dist > 16) | body) & (hard > 0), 255, 0).astype(np.uint8)
    n, lbl, st, _ = cv2.connectedComponentsWithStats(hard)
    if n > 1:
        keep = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])
        hard = np.where(lbl == keep, 255, 0).astype(np.uint8)
    # мелкие дырки внутри закрываем, крупные просветы между прядями оставляем
    inv = cv2.bitwise_not(hard)
    n, lbl, st, _ = cv2.connectedComponentsWithStats(inv)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < 250:
            hard[lbl == i] = 255

    # мягкие края: прозрачность по отличию цвета от бумаги, тело — непрозрачное
    soft = np.clip((dist - 20) / 34, 0, 1)
    # середина фигуры — полностью непрозрачная (светлые блики на коже не должны «просвечивать»)
    inner = cv2.erode(hard, np.ones((3, 3), np.uint8), iterations=5) > 0
    outer = cv2.dilate(hard, np.ones((3, 3), np.uint8), iterations=1) > 0
    alpha = np.where(inner, 1.0, np.where(outer, soft, 0.0))
    alpha = np.where(body, np.maximum(alpha, body_weight), alpha)
    # подрезаем край на 1 px — убирает тонкую светлую кайму бумаги вокруг прядей
    alpha = np.minimum(alpha, cv2.erode(alpha.astype(np.float32), np.ones((3, 3), np.uint8)))
    alpha = cv2.GaussianBlur(alpha.astype(np.float32), (3, 3), 0)

    # убираем «ореол» бумаги на полупрозрачных краях
    paper_bgr = cv2.cvtColor(np.uint8([[paper]]), cv2.COLOR_LAB2BGR)[0, 0].astype(np.float32)
    a = np.clip(alpha, 1e-3, 1)[..., None]
    fg = np.clip((bgr.astype(np.float32) - (1 - a) * paper_bgr) / a, 0, 255)
    fg = np.where(alpha[..., None] > 0.98, bgr.astype(np.float32), fg)

    rgba = np.dstack([fg.astype(np.uint8), (alpha * 255).astype(np.uint8)])
    ys, xs = np.where(alpha > 0.02)
    pad = 12
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, h)
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, w)
    return rgba[y0:y1, x0:x1]


def paper_texture(bgr, size):
    """Чистая бумага без рисунка: полоса с левого края, отражённая и размноженная на весь кадр."""
    h, w = bgr.shape[:2]
    # цвет бумаги — по полям исходника; фактура — мягкое зерно без повторов и полос
    edge = np.concatenate([bgr[:, : int(0.06 * w)].reshape(-1, 3), bgr[:, -int(0.06 * w) :].reshape(-1, 3)])
    base = np.median(edge, 0).astype(np.float32)
    rng = np.random.default_rng(7)
    fine = cv2.GaussianBlur(rng.normal(0, 1, (size, size)).astype(np.float32), (0, 0), 1.0) * 5
    soft = cv2.GaussianBlur(rng.normal(0, 1, (size, size)).astype(np.float32), (0, 0), 40) * 220
    # лёгкая виньетка: к краям чуть темнее, как на исходной бумаге
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32) / size - 0.5
    vignette = -10 * (xx**2 + yy**2)
    tex = (fine + soft + vignette)[..., None]
    return np.clip(base + tex, 0, 255).astype(np.uint8)


def with_margin(bgr, cut_rgba, scale=0.86, top=0.06):
    """Девушка целиком на бумажном фоне: отступ сверху, голова не упирается в край."""
    size = bgr.shape[0]
    canvas = paper_texture(bgr, size).astype(np.float32)
    ch, cw = cut_rgba.shape[:2]
    k = scale * size / max(ch, cw) if max(ch, cw) > size * scale else scale
    fig = cv2.resize(cut_rgba, (int(cw * k), int(ch * k)), interpolation=cv2.INTER_AREA)
    fh, fw = fig.shape[:2]
    x0 = (size - fw) // 2
    y0 = int(top * size)
    y1 = min(y0 + fh, size)
    fig = fig[: y1 - y0]
    a = fig[:, :, 3:4].astype(np.float32) / 255
    region = canvas[y0:y1, x0 : x0 + fw]
    canvas[y0:y1, x0 : x0 + fw] = region * (1 - a) + fig[:, :, :3].astype(np.float32) * a
    return canvas.astype(np.uint8)


def main():
    for key, path in SOURCES.items():
        clean, _ = erase_text(read(path))
        cut = cutout(clean)
        write(f"brand/png/girl-{key}-cutout.png", cut)
        # полный кадр: без надписи и с отступом над головой
        write(f"brand/girl-{key}.png", with_margin(clean, cut))
        print("ok", key)


if __name__ == "__main__":
    main()
