import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./reveal";
import type { House } from "@/data/houses";
import { getDict, type Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/site";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Картинка дома (brand/houses → public/brand/houses), иначе — фото первого аромата */
export function houseImage(h: House) {
  const file = path.join(process.cwd(), "public", "brand", "houses", `${h.slug}.webp`);
  return fs.existsSync(file) ? `${BASE}/brand/houses/${h.slug}.webp` : h.items[0]?.images[0] ?? "";
}

export function houseMeta(h: House, lang: Locale) {
  const t = getDict(lang).maison;
  const price = h.minPrice ? t.from(formatPrice(h.minPrice, getDict(lang).currency)) : h.minUsd ? t.from(`${h.minUsd} $`) : "";
  return [t.count(h.items.length), price].filter(Boolean).join(" · ");
}

/** Плитки парфюмерных домов: атмосферная картинка, название, сколько ароматов и цена «от» */
export function HouseGrid({ houses, lang }: { houses: House[]; lang: Locale }) {
  return (
    <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
      {houses.map((h, i) => (
        <Reveal as="li" key={h.slug} delay={(i % 3) * 60} className={i === 0 && houses.length % 2 ? "col-span-2 md:col-span-1" : ""}>
          <Link href={`/${lang}/maison/${h.slug}`} className={`group relative block overflow-hidden rounded-2xl bg-[#1b120f] ${i === 0 && houses.length % 2 ? "aspect-[8/5] md:aspect-[4/5]" : "aspect-[4/5]"}`}>
            <Image
              src={houseImage(h)}
              alt=""
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,18,15,0)_40%,rgba(27,18,15,0.55)_70%,rgba(27,18,15,0.92)_100%)]" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-paper sm:p-5">
              <span className="block text-lg font-medium leading-tight tracking-[-0.01em] sm:text-xl">{h.brand}</span>
              <span className="mt-1 block text-xs text-paper/75 sm:text-sm">{houseMeta(h, lang)}</span>
            </span>
            <span
              aria-hidden
              className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-paper/90 text-ink opacity-0 transition-opacity group-hover:opacity-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
