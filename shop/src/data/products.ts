import images from "./images.json";

export type Category = "makeup" | "skin" | "hair" | "fragrance" | "body" | "tools" | "sets";

export type Variant = { label: string; price: number };

export type Product = {
  slug: string;
  brand: string;
  name: string;
  category: Category;
  /** Цена в сумах. Для товаров с вариантами — цена первого варианта. */
  price: number;
  oldPrice?: number;
  variants?: Variant[];
  description: { ru: string; uz: string };
  /** Номер поста в канале t.me/beauty_branduz */
  post: number;
  /** Ключ в images.json, если фото общие с другим товаром */
  imageKey?: string;
  /** Ролик из video/ (композиция ProductPromo), путь в public */
  video?: string;
  /** Канал, откуда пост (по умолчанию beauty_branduz) */
  channel?: string;
  /** Флаконы под заказ — цена в долларах, заказ через Telegram (не через корзину) */
  usd?: { label: string; usd: number }[];
  /** Флакон под заказ к товару на распив, например «100 ml — 250 $» */
  bottle?: string;
};

export const CATEGORIES: Category[] = ["makeup", "skin", "hair", "fragrance", "body", "tools", "sets"];

const data: Product[] = [
  {
    slug: "makeup-forever-hd-skin-face-essentials",
    brand: "Make Up For Ever",
    name: "HD Skin Face Essentials Palette",
    category: "makeup",
    price: 1_279_000,
    description: {
      ru: "Многофункциональная палетка для лица: всё для безупречного макияжа в одном футляре.",
      uz: "Yuz uchun ko‘p funksiyali palitra: mukammal makiyaj uchun hammasi bitta qutida.",
    },
    post: 16303,
  },
  {
    slug: "color-wow-dream-coat-extra-strength",
    brand: "Color Wow",
    name: "Dream Coat Extra Strength, 200 ml",
    category: "hair",
    price: 625_000,
    description: {
      ru: "Спрей для гладких, блестящих волос с эффектом Glass Hair. Убирает пушистость, защищает от влажности и активируется при сушке феном. Для густых, жёстких и пористых волос.",
      uz: "Silliq va yaltiroq sochlar uchun Glass Hair effektli sprey. Paxmoqlikni yo‘qotadi, namlikdan himoya qiladi va fen bilan quritganda faollashadi. Qalin, dag‘al va g‘ovak sochlar uchun.",
    },
    post: 16281,
  },
  {
    slug: "dior-backstage-glow-maximizer-007",
    brand: "Dior",
    name: "Backstage Glow Maximizer Palette 007",
    category: "makeup",
    price: 800_000,
    description: {
      ru: "Деликатное жемчужное сияние и эффект естественного glow. Освежает макияж в течение дня.",
      uz: "Nozik marvarid jilosi va tabiiy glow effekti. Kun davomida makiyajni yangilaydi.",
    },
    post: 16243,
  },
  {
    slug: "makeup-by-mario-brush-set",
    brand: "Makeup by Mario",
    name: "Makeup Brush Set",
    category: "tools",
    price: 1_280_000,
    description: {
      ru: "Три многофункциональные кисти для нанесения и растушёвки на лице и глазах. В комплекте косметичка для хранения.",
      uz: "Yuz va ko‘zga surtish hamda soyalash uchun uchta ko‘p funksiyali cho‘tka. To‘plamda saqlash uchun kosmetichka bor.",
    },
    post: 16241,
  },
  {
    slug: "dior-glow-stick-012-rosewood",
    brand: "Dior",
    name: "Glow Stick 012 Rosewood",
    category: "makeup",
    price: 715_000,
    description: {
      ru: "Кремовые румяна-стик. Подстраиваются под pH кожи и дают индивидуальный розово-древесный оттенок.",
      uz: "Krem-stik qizartirgich. Teri pH darajasiga moslashib, o‘ziga xos pushti-yog‘och tusini beradi.",
    },
    post: 16236,
    video: "/videos/product-dior-glow-stick-012-rosewood.mp4",
  },
  {
    slug: "makeup-by-mario-softsculpt-shaping-stick",
    brand: "Makeup by Mario",
    name: "SoftSculpt Shaping Stick",
    category: "makeup",
    price: 595_000,
    variants: [
      { label: "Light Medium", price: 595_000 },
      { label: "Medium", price: 595_000 },
    ],
    description: {
      ru: "Кремовый стик-бронзер для мягкого скульптурирования. Легко растушёвывается и подчёркивает скулы.",
      uz: "Yuzni yumshoq skulpturlash uchun krem-stik bronzer. Oson soyalanadi va yonoqlarni ajratib ko‘rsatadi.",
    },
    post: 16232,
  },
  {
    slug: "kerastase-genesis-anti-chute-serum",
    brand: "Kérastase",
    name: "Genesis Anti-Chute Serum",
    category: "hair",
    price: 717_000,
    description: {
      ru: "Укрепляющая сыворотка против выпадения волос. Укрепляет корни и повышает плотность волос.",
      uz: "Soch to‘kilishiga qarshi mustahkamlovchi zardob. Ildizlarni mustahkamlaydi va sochni qalinlashtiradi.",
    },
    post: 16230,
    imageKey: "kerastase-genesis-duo",
  },
  {
    slug: "kerastase-genesis-defense-thermique",
    brand: "Kérastase",
    name: "Genesis Défense Thermique",
    category: "hair",
    price: 574_000,
    description: {
      ru: "Термозащита: бережёт волосы от высоких температур, облегчает расчёсывание и придаёт гладкость.",
      uz: "Termohimoya: sochni yuqori haroratdan asraydi, taralishini osonlashtiradi va silliqlik beradi.",
    },
    post: 16230,
    imageKey: "kerastase-genesis-duo",
  },
  {
    slug: "armani-blush-balm-05",
    brand: "Armani Beauty",
    name: "Blush Balm 05 Mauve Blush",
    category: "makeup",
    price: 675_000,
    description: {
      ru: "Кремовые румяна с бальзамной текстурой. Оттенок 05 — благородный розово-лиловый, подходит и для губ.",
      uz: "Balzam teksturali krem qizartirgich. 05 — nafis pushti-binafsha tus, labga ham surtish mumkin.",
    },
    post: 16221,
  },
  {
    slug: "tom-ford-highlighter-01-capri",
    brand: "Tom Ford",
    name: "Highlighter 01 Capri",
    category: "makeup",
    price: 1_210_000,
    description: {
      ru: "Хайлайтер с нежным сиянием: подсвечивает кожу и даёт эффект свежего, ухоженного лица.",
      uz: "Nozik jiloli haylayter: terini yoritadi va yuzga tetik, parvarishlangan ko‘rinish beradi.",
    },
    post: 16217,
  },
  {
    slug: "tom-ford-soleil-sunlit-rose-lip-balm",
    brand: "Tom Ford",
    name: "Soleil Sunlit Rose Lip Balm",
    category: "makeup",
    price: 715_000,
    description: {
      ru: "Бальзам для губ в золотом футляре. Смягчает губы и даёт лёгкий розовый оттенок.",
      uz: "Oltin qutidagi lab balzami. Labni yumshatadi va yengil pushti tus beradi.",
    },
    post: 16213,
  },
  {
    slug: "lilac-brush-set",
    brand: "Lilac",
    name: "Lilac Set",
    category: "tools",
    price: 480_000,
    description: {
      ru: "Набор кистей для лица и глаз: натуральный ворс козы и синтетика таклон. Подойдёт визажисту и для дома.",
      uz: "Yuz va ko‘z uchun cho‘tkalar to‘plami: tabiiy echki juni va taklon sintetik tolasi. Vizajist uchun ham, uy uchun ham mos.",
    },
    post: 16189,
  },
  {
    slug: "keune-rush-hour",
    brand: "Keune",
    name: "Rush Hour 2-in-1 Spray",
    category: "hair",
    price: 245_000,
    description: {
      ru: "Ускоряет сушку феном и защищает волосы от температуры до 230 °C.",
      uz: "Fen bilan quritishni tezlashtiradi va sochni 230 °C gacha haroratdan himoya qiladi.",
    },
    post: 16152,
  },
  {
    slug: "keune-derma-activate-thickening-spray",
    brand: "Keune",
    name: "Derma Activate Thickening Spray",
    category: "hair",
    price: 325_000,
    description: {
      ru: "Уплотняющий спрей для тонких и редеющих волос: прикорневой объём и визуальная густота.",
      uz: "Ingichka va siyraklashgan sochlar uchun qalinlashtiruvchi sprey: ildizdan hajm va ko‘rinishdan qalinlik.",
    },
    post: 16151,
  },
  {
    slug: "kerastase-genesis-cure",
    brand: "Kérastase",
    name: "Genesis Cure, 10 × 6 ml",
    category: "hair",
    price: 818_000,
    description: {
      ru: "Интенсивный уход против выпадения волос в ампулах. Укрепляет корни и делает волосы гуще.",
      uz: "Ampulalarda soch to‘kilishiga qarshi intensiv parvarish. Ildizlarni mustahkamlaydi va sochni qalinroq qiladi.",
    },
    post: 16148,
  },
  {
    slug: "bobbi-brown-extra-plump-lip-serum",
    brand: "Bobbi Brown",
    name: "Extra Plump Lip Serum",
    category: "makeup",
    price: 383_000,
    oldPrice: 425_000,
    variants: [
      { label: "Bare Peach", price: 383_000 },
      { label: "Bare Rose", price: 383_000 },
      { label: "Bare Blossom", price: 383_000 },
      { label: "Bare Bloom", price: 383_000 },
    ],
    description: {
      ru: "Плампер для губ: объём и сияние. Сейчас со скидкой 10%.",
      uz: "Lab plamperi: hajm va jilo. Hozir 10% chegirma bilan.",
    },
    post: 16137,
  },
  {
    slug: "bath-body-works-shimmer-body-butter",
    brand: "Bath & Body Works",
    name: "Shimmer Body Butter",
    category: "body",
    price: 276_000,
    description: {
      ru: "Сияющий баттер для тела: мягкость, увлажнение, аромат и красивый блеск на солнце.",
      uz: "Tana uchun jilo beruvchi batter: yumshoqlik, namlik, xushbo‘ylik va quyoshda chiroyli yaltirash.",
    },
    post: 16131,
  },
  {
    slug: "charlotte-tilbury-loose-setting-powder",
    brand: "Charlotte Tilbury",
    name: "Loose Setting Powder",
    category: "makeup",
    price: 780_000,
    description: {
      ru: "Рассыпчатая пудра с бархатистой текстурой. Фиксирует макияж и сглаживает кожу без эффекта маски.",
      uz: "Baxmal teksturali sochiluvchan upa. Makiyajni mustahkamlaydi va terini niqob effektisiz tekislaydi.",
    },
    post: 16120,
  },
  {
    slug: "vivienne-sabo-volume-lip-pencil",
    brand: "Vivienne Sabo",
    name: "Volume Gel Lip Pencil",
    category: "makeup",
    price: 100_000,
    description: {
      ru: "Стойкие гелевые карандаши для губ с эффектом увеличения объёма.",
      uz: "Lab hajmini kattalashtirish effektli bardoshli gel lab qalamlari.",
    },
    post: 16110,
  },
  {
    slug: "too-faced-lip-injection-plumpgasm",
    brand: "Too Faced",
    name: "Lip Injection Plumpgasm",
    category: "makeup",
    price: 625_000,
    description: {
      ru: "Плампер-блеск: губы выглядят пухлее, объёмнее и глянцевее. Хороший подарок к праздникам.",
      uz: "Plamper-glos: lablar to‘liqroq, hajmliroq va yaltiroqroq ko‘rinadi. Bayramga yaxshi sovg‘a.",
    },
    post: 16107,
  },
  {
    slug: "dior-hydra-life-fresh-sorbet-creme",
    brand: "Dior",
    name: "Hydra Life Fresh Sorbet Creme",
    category: "skin",
    price: 1_187_000,
    description: {
      ru: "Увлажняющий крем с текстурой геля-сорбета. Тает на коже, освежает и глубоко увлажняет. Для сухой и чувствительной кожи.",
      uz: "Gel-sorbet teksturali namlovchi krem. Teriga singib, tetiklashtiradi va chuqur namlaydi. Quruq va sezgir teri uchun.",
    },
    post: 16075,
  },
  {
    slug: "charlotte-tilbury-hollywood-beauty-wonderland",
    brand: "Charlotte Tilbury",
    name: "Hollywood Beauty Wonderland Advent Calendar",
    category: "sets",
    price: 3_510_000,
    description: {
      ru: "Адвент-календарь Charlotte’s Hollywood Beauty Wonderland.",
      uz: "Charlotte’s Hollywood Beauty Wonderland advent-kalendari.",
    },
    post: 16072,
  },
  {
    slug: "makeup-by-mario-neutrals-palette",
    brand: "Makeup by Mario",
    name: "Eyeshadow Palette",
    category: "makeup",
    price: 963_000,
    variants: [
      { label: "Original", price: 963_000 },
      { label: "The Neutrals", price: 963_000 },
    ],
    description: {
      ru: "Original — тёплые нюдовые, бежевые и карамельные оттенки на каждый день. The Neutrals — холодные серые, розово-коричневые и бежевые.",
      uz: "Original — har kungi iliq nyud, bej va karamel tuslar. The Neutrals — sovuq kulrang, pushti-jigarrang va bej tuslar.",
    },
    post: 16048,
  },
  {
    slug: "ysl-lash-clash-loveshine-set",
    brand: "YSL",
    name: "Lash Clash & Loveshine 44 Gift Set",
    category: "sets",
    price: 1_042_000,
    description: {
      ru: "Полноразмерный набор: тушь Lash Clash для объёма и насыщенного чёрного цвета и увлажняющая помада Loveshine №44 с сияющим финишем.",
      uz: "To‘liq hajmli to‘plam: hajm va to‘q qora rang beruvchi Lash Clash tushi hamda jilo beruvchi namlovchi Loveshine №44 lab bo‘yog‘i.",
    },
    post: 16044,
  },
  {
    slug: "makeup-by-mario-ethereal-eyes-nature",
    brand: "Makeup by Mario",
    name: "Ethereal Eyes Nature Eyeshadow Palette",
    category: "makeup",
    price: 1_050_000,
    description: {
      ru: "12 оттенков от бежевых и шоколадных до бронзовых, розовых и оливковых. Матовые, сатиновые и сияющие текстуры.",
      uz: "Bej va shokoladdan bronza, pushti va zaytun ranggacha 12 tus. Mat, satin va jilo teksturalar.",
    },
    post: 16007,
  },
  {
    slug: "patrick-ta-major-dimension",
    brand: "Patrick Ta",
    name: "Major Dimension Eyeshadow Palette",
    category: "makeup",
    price: 1_035_000,
    description: {
      ru: "12 универсальных оттенков: от нежных нюдовых до глубоких шоколадных.",
      uz: "12 ta universal tus: nozik nyuddan to‘q shokolad ranggacha.",
    },
    post: 16003,
  },
  {
    slug: "burberry-eye-quad",
    brand: "Burberry",
    name: "Eye Quad",
    category: "makeup",
    price: 1_160_000,
    description: {
      ru: "Четыре гармоничных оттенка с шелковистой текстурой — для дневного и вечернего макияжа.",
      uz: "Ipaksimon teksturali to‘rtta uyg‘un tus — kunduzgi va kechki makiyaj uchun.",
    },
    post: 15999,
  },
];

const imageMap = images as Record<string, string[]>;
// префикс для GitHub Pages; в видео-проекте process может отсутствовать
const BASE = typeof process !== "undefined" ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "") : "";

export type ProductWithImages = Product & {
  images: string[];
  video: string | undefined;
  /** Добавлен через админку (база), своя страница /item/?p=… */
  dynamic?: boolean;
};

export const products: ProductWithImages[] = data.map((p) => ({
  ...p,
  images: (imageMap[p.imageKey ?? p.slug] ?? []).map((src) => BASE + src),
  video: p.video ? BASE + p.video : undefined,
}));

/** Товары из админки — подгружаются в браузере (lib/extra-products.ts) */
const extra = new Map<string, ProductWithImages>();
/** Товары из админки. Если slug совпадает с товаром каталога — это его правка: поля заменяются */
export function registerExtra(list: ProductWithImages[]) {
  for (const p of list) {
    const s = products.find((x) => x.slug === p.slug);
    if (!s) {
      extra.set(p.slug, p);
      continue;
    }
    Object.assign(s, {
      brand: p.brand,
      name: p.name,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice,
      variants: p.variants,
      usd: p.usd,
      bottle: p.bottle,
      description: p.description,
      images: p.images.length ? p.images : s.images,
    });
  }
}

export const isCatalogSlug = (slug: string) => products.some((p) => p.slug === slug);

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug) ?? extra.get(slug);
}

export const BRANDS = Array.from(new Set(products.map((p) => p.brand))).sort((a, b) =>
  a.localeCompare(b),
);
