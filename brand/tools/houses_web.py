"""brand/houses/*.png -> shop/public/brand/houses/*.webp (для плиток парфюмерных домов)."""
import glob, os
from PIL import Image

os.makedirs("shop/public/brand/houses", exist_ok=True)
for f in glob.glob("brand/houses/*.png"):
    name = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f).convert("RGB")
    im.thumbnail((900, 1125), Image.LANCZOS)
    im.save(f"shop/public/brand/houses/{name}.webp", quality=84, method=6)
    print("ok", name)
