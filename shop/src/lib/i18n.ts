import type { Category } from "@/data/products";

export const LOCALES = ["ru", "uz"] as const;
export type Locale = (typeof LOCALES)[number];

export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

type Dict = {
  langName: string;
  currency: string;
  meta: { title: string; description: string };
  nav: { catalog: string; stores: string; telegram: string; cart: string };
  hero: { title: string; lead: string; toCatalog: string; toChannel: string };
  catalog: {
    title: string;
    all: string;
    search: string;
    brand: string;
    allBrands: string;
    found: (n: number) => string;
    empty: string;
    reset: string;
    choose: string;
  };
  categories: Record<Category, string>;
  categoryLead: Record<Category, string>;
  promo: { title: string; cta: string; sale: string; allSection: string };
  product: {
    back: string;
    variant: string;
    add: string;
    added: string;
    ask: string;
    askText: (name: string) => string;
    post: string;
    original: string;
    pickup: string;
  };
  cart: {
    title: string;
    close: string;
    empty: string;
    emptyAction: string;
    total: string;
    remove: string;
    less: string;
    more: string;
    form: string;
    name: string;
    phone: string;
    phoneHint: string;
    method: string;
    pickupAt: (store: string) => string;
    delivery: string;
    address: string;
    comment: string;
    send: string;
    copy: string;
    copied: string;
    note: string;
    errName: string;
    errPhone: string;
    errAddress: string;
    sentTitle: string;
    sentText: string;
    clear: string;
    keep: string;
    msgHello: string;
    msgTotal: string;
    msgName: string;
    msgPhone: string;
    msgPickup: string;
    msgDelivery: string;
    msgComment: string;
  };
  stores: { title: string; lead: string };
  footer: { original: string; order: string };
  notFound: { title: string; action: string };
};

const ru: Dict = {
  langName: "Русский",
  currency: "сум",
  meta: {
    title: "BeautyBrand Uz — оригинальная косметика в Ташкенте",
    description:
      "Брендовая косметика со всего мира: Dior, Tom Ford, Charlotte Tilbury, Kérastase и другие. Только оригинал, всё в наличии. Заказ в Telegram.",
  },
  nav: { catalog: "Каталог", stores: "Магазины", telegram: "Telegram-канал", cart: "Корзина" },
  hero: {
    title: "Оригинальная косметика со всего мира",
    lead: "Всё в наличии в двух магазинах в Ташкенте. Соберите корзину — заказ уйдёт менеджеру в Telegram.",
    toCatalog: "Смотреть каталог",
    toChannel: "Наш Telegram-канал",
  },
  catalog: {
    title: "Каталог",
    all: "Всё",
    search: "Поиск по названию или бренду",
    brand: "Бренд",
    allBrands: "Все бренды",
    found: (n) => `${n} ${plural(n, "товар", "товара", "товаров")}`,
    empty: "Ничего не нашлось. Попробуйте другой запрос или сбросьте фильтры.",
    reset: "Сбросить фильтры",
    choose: "Выбрать",
  },
  categoryLead: {
    makeup: "Палетки, румяна, хайлайтеры и всё для губ",
    skin: "Кремы и уход для сияющей кожи",
    hair: "Сыворотки, спреи и термозащита",
    fragrance: "Нишевые и классические ароматы на разлив",
    body: "Баттеры и уход за телом",
    tools: "Кисти для лица и глаз",
    sets: "Подарочные наборы и адвент-календари",
  },
  promo: { title: "Что вы ищете?", cta: "Смотреть", sale: "Скидка", allSection: "Все разделы" },
  categories: {
    makeup: "Макияж",
    skin: "Уход за лицом",
    hair: "Волосы",
    fragrance: "Парфюм",
    body: "Тело",
    tools: "Кисти",
    sets: "Наборы",
  },
  product: {
    back: "Каталог",
    variant: "Вариант",
    add: "В корзину",
    added: "В корзине",
    ask: "Спросить в Telegram",
    askText: (name) => `Здравствуйте! Есть в наличии ${name}?`,
    post: "Пост в канале",
    original: "Только оригинал",
    pickup: "Самовывоз из двух магазинов в Ташкенте",
  },
  cart: {
    title: "Корзина",
    close: "Закрыть",
    empty: "Корзина пуста.",
    emptyAction: "Перейти в каталог",
    total: "Итого",
    remove: "Убрать",
    less: "Меньше",
    more: "Больше",
    form: "Данные для заказа",
    name: "Имя",
    phone: "Телефон",
    phoneHint: "+998 90 123 45 67",
    method: "Как получить",
    pickupAt: (s) => `Самовывоз: ${s}`,
    delivery: "Доставка по Ташкенту",
    address: "Адрес доставки",
    comment: "Комментарий (необязательно)",
    send: "Отправить заказ в Telegram",
    copy: "Скопировать текст заказа",
    copied: "Текст скопирован",
    note: "Откроется чат с менеджером с готовым текстом заказа — нажмите «Отправить». Менеджер подтвердит наличие и стоимость доставки.",
    errName: "Введите имя",
    errPhone: "Введите номер телефона, например +998 90 123 45 67",
    errAddress: "Введите адрес доставки",
    sentTitle: "Чат с менеджером открыт",
    sentText: "Нажмите «Отправить» в Telegram. Если чат не открылся, скопируйте текст заказа и отправьте его @beautybrandcosmetics.",
    clear: "Очистить корзину",
    keep: "Вернуться к заказу",
    msgHello: "Здравствуйте! Хочу оформить заказ с сайта beautybrand.uz:",
    msgTotal: "Итого",
    msgName: "Имя",
    msgPhone: "Телефон",
    msgPickup: "Самовывоз",
    msgDelivery: "Доставка",
    msgComment: "Комментарий",
  },
  stores: {
    title: "Магазины в Ташкенте",
    lead: "Можно прийти, посмотреть и забрать заказ.",
  },
  footer: { original: "Брендовая косметика со всего мира. Только оригинал.", order: "Заказы в Telegram" },
  notFound: { title: "Такой страницы нет", action: "Вернуться в каталог" },
};

const uz: Dict = {
  langName: "O‘zbekcha",
  currency: "so‘m",
  meta: {
    title: "BeautyBrand Uz — Toshkentda original kosmetika",
    description:
      "Butun dunyodan brend kosmetika: Dior, Tom Ford, Charlotte Tilbury, Kérastase va boshqalar. Faqat original, hammasi mavjud. Buyurtma Telegramda.",
  },
  nav: { catalog: "Katalog", stores: "Do‘konlar", telegram: "Telegram-kanal", cart: "Savat" },
  hero: {
    title: "Butun dunyodan original kosmetika",
    lead: "Hammasi Toshkentdagi ikki do‘konimizda mavjud. Savatni to‘ldiring — buyurtma Telegramda menejerga yuboriladi.",
    toCatalog: "Katalogni ko‘rish",
    toChannel: "Telegram-kanalimiz",
  },
  catalog: {
    title: "Katalog",
    all: "Hammasi",
    search: "Nomi yoki brend bo‘yicha qidirish",
    brand: "Brend",
    allBrands: "Barcha brendlar",
    found: (n) => `${n} ta mahsulot`,
    empty: "Hech narsa topilmadi. Boshqa so‘rovni sinab ko‘ring yoki filtrlarni tozalang.",
    reset: "Filtrlarni tozalash",
    choose: "Tanlash",
  },
  categoryLead: {
    makeup: "Paletkalar, qizartirgichlar, haylayterlar va lab uchun hammasi",
    skin: "Yorqin teri uchun kremlar va parvarish",
    hair: "Zardoblar, spreylar va termohimoya",
    fragrance: "Nish va klassik atirlar quyma holda",
    body: "Tana uchun batterlar va parvarish",
    tools: "Yuz va ko‘z uchun cho‘tkalar",
    sets: "Sovg‘a to‘plamlari va advent-kalendarlar",
  },
  promo: { title: "Nima qidiryapsiz?", cta: "Ko‘rish", sale: "Chegirma", allSection: "Barcha bo‘limlar" },
  categories: {
    makeup: "Makiyaj",
    skin: "Yuz parvarishi",
    hair: "Soch",
    fragrance: "Atirlar",
    body: "Tana",
    tools: "Cho‘tkalar",
    sets: "To‘plamlar",
  },
  product: {
    back: "Katalog",
    variant: "Variant",
    add: "Savatga",
    added: "Savatda",
    ask: "Telegramda so‘rash",
    askText: (name) => `Assalomu alaykum! ${name} mavjudmi?`,
    post: "Kanaldagi post",
    original: "Faqat original",
    pickup: "Toshkentdagi ikki do‘kondan olib ketish",
  },
  cart: {
    title: "Savat",
    close: "Yopish",
    empty: "Savat bo‘sh.",
    emptyAction: "Katalogga o‘tish",
    total: "Jami",
    remove: "O‘chirish",
    less: "Kamroq",
    more: "Ko‘proq",
    form: "Buyurtma ma’lumotlari",
    name: "Ism",
    phone: "Telefon",
    phoneHint: "+998 90 123 45 67",
    method: "Qanday olasiz",
    pickupAt: (s) => `Olib ketish: ${s}`,
    delivery: "Toshkent bo‘ylab yetkazib berish",
    address: "Yetkazib berish manzili",
    comment: "Izoh (ixtiyoriy)",
    send: "Buyurtmani Telegramga yuborish",
    copy: "Buyurtma matnini nusxalash",
    copied: "Matn nusxalandi",
    note: "Menejer bilan chat tayyor buyurtma matni bilan ochiladi — «Yuborish»ni bosing. Menejer mavjudlik va yetkazib berish narxini tasdiqlaydi.",
    errName: "Ismingizni kiriting",
    errPhone: "Telefon raqamini kiriting, masalan +998 90 123 45 67",
    errAddress: "Yetkazib berish manzilini kiriting",
    sentTitle: "Menejer bilan chat ochildi",
    sentText: "Telegramda «Yuborish»ni bosing. Chat ochilmagan bo‘lsa, buyurtma matnini nusxalab @beautybrandcosmetics ga yuboring.",
    clear: "Savatni tozalash",
    keep: "Buyurtmaga qaytish",
    msgHello: "Assalomu alaykum! beautybrand.uz saytidan buyurtma bermoqchiman:",
    msgTotal: "Jami",
    msgName: "Ism",
    msgPhone: "Telefon",
    msgPickup: "Olib ketish",
    msgDelivery: "Yetkazib berish",
    msgComment: "Izoh",
  },
  stores: {
    title: "Toshkentdagi do‘konlar",
    lead: "Kelib ko‘rishingiz va buyurtmani olib ketishingiz mumkin.",
  },
  footer: { original: "Butun dunyodan brend kosmetika. Faqat original.", order: "Buyurtmalar Telegramda" },
  notFound: { title: "Bunday sahifa yo‘q", action: "Katalogga qaytish" },
};

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const dicts: Record<Locale, Dict> = { ru, uz };

export const getDict = (l: Locale) => dicts[l];
export type { Dict };
