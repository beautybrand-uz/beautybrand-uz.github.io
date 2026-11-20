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
    <ul className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-7">
      {houses.map((h, i) => (
        <Reveal as="li" key={h.slug} delay={(i % 7) * 40}>
          <Link href={`/${lang}/maison/${h.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-xl bg-[#1b120f]">
            <Image
              src={houseImage(h)}
              alt=""
              fill
              sizes="(min-width: 1024px) 14vw, (min-width: 640px) 25vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,18,15,0)_40%,rgba(27,18,15,0.55)_70%,rgba(27,18,15,0.92)_100%)]" />
            <span className="absolute inset-x-0 bottom-0 p-2.5 text-paper sm:p-3.5">
              <span className="block text-[0.8rem] font-medium leading-tight sm:text-base">{h.brand}</span>
              <span className="mt-0.5 hidden text-xs text-paper/70 sm:block">{houseMeta(h, lang)}</span>
            </span>
            <span
              aria-hidden
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-paper/90 text-ink opacity-0 transition-opacity group-hover:opacity-100"
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
