"""
Собирает все версии логотипа из исходников в brand/.

  python brand/tools/make_logos.py      (запускать из корня проекта)

1. Берёт brand/girl-*.png без надписи (их делает brand/tools/cutout.py — запускать первым)
2. Делает PNG с прозрачным фоном, тенью и объёмной кромкой -> brand/png/
3. Кладёт веб-версии для сайта и видео -> shop/public/brand/
4. Обновляет превью для соцсетей -> shop/src/app/opengraph-image.jpg
"""
from PIL import Image, ImageChops, ImageDraw, ImageFilter

SOURCES = {
    "glam": "brand/Гламурный бьюти-портрет с футляром MAC.png",
    "classic": "brand/Гламурный портрет с ярким синим глазом.png",
    "34": "brand/Портрет женщины с тюбиком MAC.png",
}
CARD, R, PAD = 1200, 96, 150
SHADOW = (42, 26, 21)


def no_text(key: str) -> Image.Image:
    # полный кадр без надписи — делает brand/tools/cutout.py (надпись стёрта, волосы не обрезаны)
    return Image.open(f"brand/girl-{key}.png").convert("RGB").resize((CARD, CARD), Image.LANCZOS)


def rounded_mask(size, r, scale=4):
    big = Image.new("L", (size * scale, size * scale), 0)
    ImageDraw.Draw(big).rounded_rectangle((0, 0, size * scale - 1, size * scale - 1), r * scale, fill=255)
    return big.resize((size, size), Image.LANCZOS)


def vgrad(h, top, bottom):
    g = Image.new("L", (1, h))
    for y in range(h):
        g.putpixel((0, y), int(top + (bottom - top) * y / (h - 1)))
    return g.resize((CARD, h))


MASK = rounded_mask(CARD, R)
W = CARD + PAD * 2


def shadow_layer(alpha, blur, dy, spread=0):
    m = Image.new("L", (W, W), 0)
    m.paste(MASK.resize((CARD + spread * 2, CARD + spread * 2), Image.LANCZOS), (PAD - spread, PAD - spread + dy))
    m = m.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * alpha))
    layer = Image.new("RGBA", (W, W), SHADOW + (0,))
    layer.putalpha(m)
    return layer


def card_3d(art_rgb: Image.Image) -> Image.Image:
    art = art_rgb.convert("RGBA")
    light = Image.new("RGBA", (CARD, CARD), (255, 255, 255, 0))
    light.putalpha(vgrad(CARD, 34, 0))
    dark = Image.new("RGBA", (CARD, CARD), SHADOW + (0,))
    dark.putalpha(vgrad(CARD, 0, 26))
    art = Image.alpha_composite(Image.alpha_composite(art, light), dark)

    inner = Image.new("L", (CARD, CARD), 0)
    inner.paste(rounded_mask(CARD - 8, R - 4), (4, 4))
    ring = ImageChops.subtract(MASK, inner)
    edge_l = Image.new("RGBA", (CARD, CARD), (255, 255, 255, 0))
    edge_l.putalpha(ImageChops.multiply(ring, vgrad(CARD, 200, 40)))
    edge_d = Image.new("RGBA", (CARD, CARD), SHADOW + (0,))
    edge_d.putalpha(ImageChops.multiply(ring, vgrad(CARD, 0, 70)))
    art = Image.alpha_composite(Image.alpha_composite(art, edge_l), edge_d)
    art.putalpha(ImageChops.multiply(art.getchannel("A"), MASK))

    canvas = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    canvas = Image.alpha_composite(canvas, shadow_layer(0.38, 46, 46, spread=-18))
    canvas = Image.alpha_composite(canvas, shadow_layer(0.22, 12, 10))
    layer = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    layer.paste(art, (PAD, PAD), art)
    return Image.alpha_composite(canvas, layer)


def main():
    for key in SOURCES:
        art = no_text(key)
        art.save(f"shop/public/brand/girl-{key}-1200.webp", quality=88)

        c = card_3d(art)
        c.save(f"brand/png/beautybrand-{key}-3d.png", optimize=True)
        small = c.resize((W // 2, W // 2), Image.LANCZOS)
        small.save(f"brand/png/beautybrand-{key}-3d-750.png", optimize=True)
        small.save(f"shop/public/brand/beautybrand-{key}-3d.webp", quality=88, method=6)
        print("ok", key)

    glam = Image.open("brand/girl-glam.png")
    bg = tuple(sum(glam.getpixel(p)[i] for p in [(20, 20), (1180, 20), (20, 600), (1180, 600)]) // 4 for i in range(3))
    og = Image.new("RGB", (1200, 630), bg)
    og.paste(glam.resize((630, 630), Image.LANCZOS), (570, 0))
    og.save("shop/src/app/opengraph-image.jpg", quality=88)


if __name__ == "__main__":
    main()
