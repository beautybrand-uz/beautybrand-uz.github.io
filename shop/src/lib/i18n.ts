import type { Category } from "@/data/products";

export const LOCALES = ["ru", "uz"] as const;
export type Locale = (typeof LOCALES)[number];

export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

type Dict = {
  langName: string;
  currency: string;
  meta: { title: string; description: string };
  nav: { catalog: string; stores: string; telegram: string; cart: string; boutique: string; admin: string; ribbon: string[] };
  maison: {
    label: string;
    lead: string;
    stats: [string, string][];
    toAromas: string;
    channel: string;
    decants: string;
    decantsLead: string;
    bottles: string;
    bottlesLead: string;
    bannerText: string;
    cta: string;
  };
  hero: { title: string; lead: string; toCatalog: string; toChannel: string; facts: string[] };
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
  home: {
    newTitle: string;
    newText: string;
    newCta: string;
    brandsTitle: string;
    brandsAll: string;
    moreBrands: (n: number) => string;
    brandsPrev: string;
    brandsNext: string;
    howTitle: string;
    how: [string, string][];
  };
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
    order: string;
    orderText: (name: string, price: string) => string;
    bottle: string;
    boutique: string;
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
  contact: {
    hours: string;
    open: string;
    closed: string;
    opensAt: (t: string) => string;
    phone: string;
    call: string;
    days: string[];
    daily: (from: string, to: string) => string;
  };
  footer: { original: string; order: string };
  notFound: { title: string; action: string };
  reviews: {
    title: string;
    lead: string;
    product: string;
    empty: string;
    count: (n: number) => string;
    outOf: string;
    write: string;
    rating: string;
    ratingLabel: (n: number) => string;
    name: string;
    text: string;
    textHint: string;
    submit: string;
    sending: string;
    thanks: string;
    thanksTg: string;
    errRating: string;
    errName: string;
    errText: string;
    errSend: string;
    fromChannel: string;
    loadError: string;
  };
};

const ru: Dict = {
  langName: "Русский",
  currency: "сум",
  meta: {
    title: "BeautyBrand Uz — оригинальная косметика в Ташкенте",
    description:
      "Брендовая косметика со всего мира: Dior, Tom Ford, Charlotte Tilbury, Kérastase и другие. Только оригинал, всё в наличии. Заказ в Telegram.",
  },
  nav: { catalog: "Каталог", stores: "Магазины", telegram: "Telegram-канал", cart: "Корзина", boutique: "Парфюм-бутик", admin: "Админка", ribbon: ["Только оригинал", "Всё в наличии", "Ц5 и Ц1, Ташкент"] },
  maison: {
    label: "Парфюмерный бутик",
    lead: "Нишевая и люксовая парфюмерия. Попробуйте аромат на распив от 5 мл — и закажите полный флакон, когда влюбитесь.",
    stats: [
      ["5 и 10 мл", "распив оригиналов"],
      ["Флаконы", "полные, под заказ"],
      ["Отзывы", "каждую неделю в канале"],
    ],
    toAromas: "Смотреть ароматы",
    channel: "Канал бутика",
    decants: "На распив",
    decantsLead: "Оригинальные ароматы в объёме 5 и 10 мл — можно оформить через корзину.",
    bottles: "Флаконы под заказ",
    bottlesLead: "Полные флаконы, цена в долларах. Нажмите на аромат — заказ уйдёт менеджеру в Telegram.",
    bannerText: "Нишевая парфюмерия на распив от 5 мл и полные флаконы под заказ.",
    cta: "Перейти в бутик",
  },
  hero: {
    title: "Оригинальная косметика со всего мира",
    lead: "Всё в наличии в двух магазинах в Ташкенте. Соберите корзину — заказ уйдёт менеджеру в Telegram.",
    toCatalog: "Смотреть каталог",
    toChannel: "Наш Telegram-канал",
    facts: ["Только оригинал", "Всё в наличии", "2 магазина в Ташкенте"],
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
  home: {
    newTitle: "Новинки недели",
    newText: "Короткий обзор свежего поступления. Новые позиции появляются в нашем Telegram-канале каждый день — подписывайтесь, чтобы не пропустить.",
    newCta: "Новинки в Telegram",
    brandsTitle: "Бренды в наличии",
    brandsAll: "Весь каталог",
    moreBrands: (n) => `и ещё ${n} ${plural(n, "бренд", "бренда", "брендов")}`,
    brandsPrev: "Предыдущие бренды",
    brandsNext: "Следующие бренды",
    howTitle: "Как заказать",
    how: [
      ["Выберите", "Добавьте товары в корзину на сайте."],
      ["Отправьте", "Заказ уйдёт менеджеру в Telegram — текст соберётся сам."],
      ["Получите", "Заберите в магазине Ц5 или Ц1 или закажите доставку по Ташкенту."],
    ],
  },
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
    order: "Заказать в Telegram",
    orderText: (name, price) => `Здравствуйте! Хочу заказать ${name} — ${price}.`,
    bottle: "Полный флакон под заказ",
    boutique: "Парфюмерный бутик",
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
  footer: { original: "Брендовая косметика со всего мира. Только оригинал.", order: "Контакты" },
  contact: {
    hours: "Часы работы",
    open: "Открыто",
    closed: "Закрыто",
    opensAt: (t) => `откроется в ${t}`,
    phone: "Телефон",
    call: "Позвонить",
    days: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    daily: (a, b) => `${a}–${b}`,
  },
  notFound: { title: "Такой страницы нет", action: "Вернуться в каталог" },
  reviews: {
    title: "Отзывы",
    lead: "Что говорят покупатели и наши подписчики об ароматах и косметике.",
    product: "Отзывы",
    empty: "Пока нет отзывов. Будьте первым — это поможет другим с выбором.",
    count: (n) => `${n} ${plural(n, "отзыв", "отзыва", "отзывов")}`,
    outOf: "из 5",
    write: "Оставить отзыв",
    rating: "Ваша оценка",
    ratingLabel: (n) => `${n} из 5`,
    name: "Имя",
    text: "Отзыв",
    textHint: "Как вам товар? Стойкость, аромат, текстура…",
    submit: "Отправить отзыв",
    sending: "Отправляем…",
    thanks: "Спасибо! Отзыв появится на сайте после проверки.",
    thanksTg: "Откроется Telegram с текстом отзыва — нажмите «Отправить». Менеджер опубликует его после проверки.",
    errRating: "Поставьте оценку от 1 до 5 звёзд",
    errName: "Введите имя",
    errText: "Напишите хотя бы пару слов",
    errSend: "Не получилось отправить отзыв. Проверьте интернет и попробуйте ещё раз.",
    fromChannel: "Из канала Maison De Mari",
    loadError: "Не удалось загрузить отзывы.",
  },
};

const uz: Dict = {
  langName: "O‘zbekcha",
  currency: "so‘m",
  meta: {
    title: "BeautyBrand Uz — Toshkentda original kosmetika",
    description:
      "Butun dunyodan brend kosmetika: Dior, Tom Ford, Charlotte Tilbury, Kérastase va boshqalar. Faqat original, hammasi mavjud. Buyurtma Telegramda.",
  },
  nav: { catalog: "Katalog", stores: "Do‘konlar", telegram: "Telegram-kanal", cart: "Savat", boutique: "Atir butigi", admin: "Admin", ribbon: ["Faqat original", "Hammasi mavjud", "Ts5 va Ts1, Toshkent"] },
  maison: {
    label: "Atir butigi",
    lead: "Nish va lyuks parfyumeriya. Atirni 5 ml dan quyma holda sinab ko‘ring — yoqib qolsa, to‘liq flakon buyurtma qiling.",
    stats: [
      ["5 va 10 ml", "originallar quymasi"],
      ["Flakonlar", "to‘liq, buyurtma asosida"],
      ["Sharhlar", "har hafta kanalda"],
    ],
    toAromas: "Atirlarni ko‘rish",
    channel: "Butik kanali",
    decants: "Quyma",
    decantsLead: "5 va 10 ml hajmdagi original atirlar — savat orqali buyurtma berish mumkin.",
    bottles: "Buyurtma asosida flakonlar",
    bottlesLead: "To‘liq flakonlar, narxi dollarda. Atirni bosing — buyurtma Telegramda menejerga yuboriladi.",
    bannerText: "5 ml dan nish parfyumeriya quymasi va buyurtma asosida to‘liq flakonlar.",
    cta: "Butikka o‘tish",
  },
  hero: {
    title: "Butun dunyodan original kosmetika",
    lead: "Hammasi Toshkentdagi ikki do‘konimizda mavjud. Savatni to‘ldiring — buyurtma Telegramda menejerga yuboriladi.",
    toCatalog: "Katalogni ko‘rish",
    toChannel: "Telegram-kanalimiz",
    facts: ["Faqat original", "Hammasi mavjud", "Toshkentda 2 ta do‘kon"],
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
  home: {
    newTitle: "Hafta yangiliklari",
    newText: "Yangi kelgan mahsulotlarning qisqa sharhi. Yangi mahsulotlar har kuni Telegram-kanalimizda paydo bo‘ladi — o‘tkazib yubormaslik uchun obuna bo‘ling.",
    newCta: "Yangiliklar Telegramda",
    brandsTitle: "Mavjud brendlar",
    brandsAll: "Butun katalog",
    moreBrands: (n) => `yana ${n} ta brend`,
    brandsPrev: "Oldingi brendlar",
    brandsNext: "Keyingi brendlar",
    howTitle: "Qanday buyurtma berish",
    how: [
      ["Tanlang", "Mahsulotlarni saytdagi savatga qo‘shing."],
      ["Yuboring", "Buyurtma Telegramda menejerga yuboriladi — matn o‘zi tayyorlanadi."],
      ["Oling", "Ts5 yoki Ts1 do‘konidan olib keting yoki Toshkent bo‘ylab yetkazib berishni buyurtma qiling."],
    ],
  },
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
    order: "Telegramda buyurtma berish",
    orderText: (name, price) => `Assalomu alaykum! ${name} buyurtma bermoqchiman — ${price}.`,
    bottle: "To‘liq flakon buyurtma asosida",
    boutique: "Atir butigi",
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
  footer: { original: "Butun dunyodan brend kosmetika. Faqat original.", order: "Aloqa" },
  contact: {
    hours: "Ish vaqti",
    open: "Ochiq",
    closed: "Yopiq",
    opensAt: (t) => `${t} da ochiladi`,
    phone: "Telefon",
    call: "Qo‘ng‘iroq qilish",
    days: ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"],
    daily: (a, b) => `${a}–${b}`,
  },
  notFound: { title: "Bunday sahifa yo‘q", action: "Katalogga qaytish" },
  reviews: {
    title: "Sharhlar",
    lead: "Xaridorlar va obunachilarimiz atirlar va kosmetika haqida nima deyishadi.",
    product: "Sharhlar",
    empty: "Hozircha sharhlar yo‘q. Birinchi bo‘ling — bu boshqalarga tanlashda yordam beradi.",
    count: (n) => `${n} ta sharh`,
    outOf: "5 dan",
    write: "Sharh qoldirish",
    rating: "Sizning bahoingiz",
    ratingLabel: (n) => `5 dan ${n}`,
    name: "Ism",
    text: "Sharh",
    textHint: "Mahsulot qanday? Bardoshliligi, hidi, teksturasi…",
    submit: "Sharhni yuborish",
    sending: "Yuborilmoqda…",
    thanks: "Rahmat! Sharh tekshiruvdan so‘ng saytda paydo bo‘ladi.",
    thanksTg: "Sharh matni bilan Telegram ochiladi — «Yuborish»ni bosing. Menejer uni tekshirib, e’lon qiladi.",
    errRating: "1 dan 5 gacha yulduz qo‘ying",
    errName: "Ismingizni kiriting",
    errText: "Kamida bir necha so‘z yozing",
    errSend: "Sharhni yuborib bo‘lmadi. Internetni tekshirib, qayta urinib ko‘ring.",
    fromChannel: "Maison De Mari kanalidan",
    loadError: "Sharhlarni yuklab bo‘lmadi.",
  },
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
