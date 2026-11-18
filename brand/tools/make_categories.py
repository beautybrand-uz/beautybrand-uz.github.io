"""
Картинки для плиток разделов на главной.

Положите файлы в brand/categories/ с такими именами (png или jpg):
  makeup, skin, hair, fragrance, body, tools, sets
и запустите из корня проекта:
  python brand/tools/make_categories.py

Скрипт сделает веб-версии в shop/public/brand/categories/*.webp.
Сайт сам использует картинку раздела, если она есть, иначе — фото товара.
"""
import pathlib

from PIL import Image

NAMES = ["makeup", "skin", "hair", "fragrance", "body", "tools", "sets"]
SRC = pathlib.Path("brand/categories")
OUT = pathlib.Path("shop/public/brand/categories")
OUT.mkdir(parents=True, exist_ok=True)

for name in NAMES:
    files = [p for p in SRC.glob(f"{name}.*") if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}]
    if not files:
        print("нет картинки:", name)
        continue
    im = Image.open(files[0]).convert("RGB")
    im.thumbnail((1600, 1600), Image.LANCZOS)
    im.save(OUT / f"{name}.webp", quality=84, method=6)
    print("ok", name, im.size)
