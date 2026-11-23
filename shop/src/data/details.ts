/**
 * Подробные сведения о товарах для блока «О товаре» на странице товара.
 * Ароматы — пирамида нот, год, парфюмер (по Fragrantica/Parfumo и сайтам брендов; чего нет в
 * надёжных источниках — не указываем). Косметика — что даёт, как наносить, кому подойдёт.
 */

type L = { ru: string; uz: string };

/** Ноты: ключ → [рус, узб] */
export const NOTE = {
  bergamot: ["бергамот", "bergamot"],
  lemon: ["лимон", "limon"],
  orange: ["апельсин", "apelsin"],
  bitterOrange: ["горький апельсин", "achchiq apelsin"],
  mandarin: ["мандарин", "mandarin"],
  grapefruit: ["грейпфрут", "greypfrut"],
  pinkGrapefruit: ["розовый грейпфрут", "pushti greypfrut"],
  petitgrain: ["петитгрейн", "petitgreyn"],
  apple: ["яблоко", "olma"],
  melon: ["дыня", "qovun"],
  peach: ["персик", "shaftoli"],
  apricot: ["абрикос", "o‘rik"],
  plum: ["слива", "olxo‘ri"],
  raspberry: ["малина", "malina"],
  blackcurrant: ["чёрная смородина", "qora smorodina"],
  coconut: ["кокос", "kokos"],
  champagne: ["розовое шампанское", "pushti shampan"],
  driedFruits: ["сухофрукты", "quritilgan mevalar"],
  fig: ["инжир", "anjir"],
  figLeaf: ["лист инжира", "anjir bargi"],
  galbanum: ["гальбанум", "galbanum"],
  basil: ["базилик", "rayhon"],
  lavender: ["лаванда", "lavanda"],
  lavandin: ["лавандин", "lavandin"],
  sage: ["шалфей", "shalfey"],
  mint: ["мята", "yalpiz"],
  juniper: ["можжевельник", "archa"],
  elemi: ["элеми", "elemi"],
  greenTea: ["зелёный чай", "ko‘k choy"],
  aromatic: ["ароматические травы", "xushbo‘y o‘tlar"],
  pepper: ["чёрный перец", "qora murch"],
  pinkPepper: ["розовый перец", "pushti murch"],
  timut: ["перец тимут", "timut murchi"],
  pimento: ["душистый перец", "xushbo‘y murch"],
  chili: ["перец чили", "achchiq qalampir"],
  ginger: ["имбирь", "zanjabil"],
  cinnamon: ["корица", "doljin"],
  cardamom: ["кардамон", "hel"],
  nutmeg: ["мускатный орех", "muskat yong‘og‘i"],
  cumin: ["тмин", "zira"],
  spices: ["пряности", "ziravorlar"],
  saffron: ["шафран", "za’faron"],
  rose: ["роза", "atirgul"],
  jasmine: ["жасмин", "yasmin"],
  sambac: ["жасмин самбак", "sambak yasmini"],
  peony: ["пион", "pion"],
  magnolia: ["магнолия", "magnoliya"],
  geranium: ["герань", "geran"],
  roseGeranium: ["розовая герань", "pushti geran"],
  violet: ["фиалка", "binafsha"],
  mimosa: ["мимоза", "mimoza"],
  heliotrope: ["гелиотроп", "geliotrop"],
  orangeBlossom: ["цветок апельсина", "apelsin guli"],
  neroli: ["нероли", "neroli"],
  osmanthus: ["османтус", "osmantus"],
  orris: ["ирис", "iris"],
  lily: ["лилия", "liliya"],
  freesia: ["фрезия", "freziya"],
  sweetPea: ["душистый горошек", "xushbo‘y no‘xat"],
  tobaccoBlossom: ["цветок табака", "tamaki guli"],
  ambrette: ["амбретта", "ambretta"],
  aldehydes: ["альдегиды", "aldegidlar"],
  solar: ["солнечные ноты", "quyoshli notalar"],
  solarCoconut: ["солнечный кокос", "quyoshli kokos"],
  coffee: ["кофе", "qahva"],
  walnut: ["грецкий орех", "yong‘oq"],
  caramel: ["карамель", "karamel"],
  cacao: ["какао", "kakao"],
  chocolate: ["шоколад", "shokolad"],
  sugar: ["сахар", "shakar"],
  sugarCrystals: ["сахарные кристаллы", "shakar kristallari"],
  praline: ["пралине", "pralin"],
  almond: ["засахаренный миндаль", "qandlangan bodom"],
  vanilla: ["ваниль", "vanil"],
  bourbonVanilla: ["бурбонская ваниль", "burbon vanili"],
  tonka: ["бобы тонка", "tonka loviyasi"],
  benzoin: ["бензоин", "benzoin"],
  labdanum: ["лабданум", "labdanum"],
  amber: ["амбра", "ambra"],
  ambergris: ["серая амбра", "kulrang ambra"],
  ambroxan: ["амброксан", "ambroksan"],
  ambrofix: ["Ambrofix™", "Ambrofix™"],
  amberwood: ["амбровое дерево", "ambra yog‘ochi"],
  musk: ["мускус", "mushk"],
  whiteMusk: ["белый мускус", "oq mushk"],
  tobacco: ["табак", "tamaki"],
  tobaccoLeaf: ["табачный лист", "tamaki bargi"],
  leather: ["кожа", "teri"],
  suede: ["замша", "zamsh"],
  oud: ["уд", "ud"],
  agarwood: ["агаровое дерево", "agar daraxti"],
  incense: ["ладан", "ladan"],
  frankincense: ["олибанум", "olibanum"],
  papyrus: ["папирус", "papirus"],
  nagarmotha: ["нагармота", "nagarmota"],
  patchouli: ["пачули", "pachuli"],
  vetiver: ["ветивер", "vetiver"],
  cedar: ["кедр", "kedr"],
  sandalwood: ["сандал", "sandal"],
  guaiac: ["гваяковое дерево", "gvayak daraxti"],
  cashmere: ["кашемировое дерево", "kashmir yog‘ochi"],
  cypriol: ["циприол", "sipriol"],
  akigalawood: ["акигалавуд", "akigalavud"],
  woods: ["древесные ноты", "yog‘och notalari"],
} as const satisfies Record<string, readonly [string, string]>;

export type Note = keyof typeof NOTE;

export type ScentDetails = {
  kind: "scent";
  family: L;
  year?: number;
  perfumer?: string;
  /** Концентрация, если её указывает бренд */
  conc?: string;
  top: Note[];
  heart: Note[];
  base: Note[];
  /** Когда носить */
  wear: L;
};

export type CareDetails = {
  kind: "care";
  /** Что даёт — 3–4 пункта */
  points: { ru: string[]; uz: string[] };
  howTo: L;
  forWhom: L;
};

export type Details = ScentDetails | CareDetails;

export const DETAILS: Record<string, Details> = {
  /* ——————————————————— Ароматы ——————————————————— */

  /* ——————————————————— Макияж ——————————————————— */
  "makeup-forever-hd-skin-face-essentials": {
    kind: "care",
    points: {
      ru: [
        "Всё для лица в одном футляре: румяна, бронзер и хайлайтер",
        "Невесомая пудровая текстура линии HD Skin — не забивается в поры и не утяжеляет",
        "Оттенки сочетаются между собой, легко наслаиваются",
        "Компактная — удобно брать в поездки",
      ],
      uz: [
        "Yuz uchun hammasi bitta qutida: qizartirgich, bronzer va haylayter",
        "HD Skin liniyasining yengil upa teksturasi — g‘ovaklarga tiqilmaydi, og‘irlik qilmaydi",
        "Tuslar bir-biriga mos, oson qatlamlanadi",
        "Ixcham — safarga olish qulay",
      ],
    },
    howTo: {
      ru: "Бронзер — под скулы и у линии роста волос, румяна — на яблочки щёк, хайлайтер — на верх скул и спинку носа. Растушуйте пушистой кистью.",
      uz: "Bronzerni yonoq ostiga va soch chizig‘iga, qizartirgichni yonoq do‘mbog‘iga, haylayterni yonoq ustiga va burun qirrasiga surting. Momiq cho‘tka bilan soyalang.",
    },
    forWhom: {
      ru: "Тем, кто хочет собрать макияж лица одной палеткой — дома и в дороге.",
      uz: "Yuz makiyajini bitta palitra bilan qilmoqchi bo‘lganlar uchun — uyda ham, yo‘lda ham.",
    },
  },
  "dior-backstage-glow-maximizer-007": {
    kind: "care",
    points: {
      ru: [
        "Хайлайтеры с перламутровыми, металлическими и сияющими финишами",
        "Ультратонкая пудра с пигментами в геле — ощущается как голая кожа",
        "Сияние можно усиливать слоями: от лёгкого glow до яркого блеска",
        "Линия визажистов Dior Backstage — для подиумов и съёмок",
      ],
      uz: [
        "Sadafsimon, metall va yaltiroq finishli haylayterlar",
        "Geldagi pigmentli o‘ta mayin upa — teri o‘zidek seziladi",
        "Jiloni qatlamlab kuchaytirish mumkin: yengil glow’dan yorqin yaltirashgacha",
        "Dior Backstage vizajistlar liniyasi — podium va suratga olish uchun",
      ],
    },
    howTo: {
      ru: "Кистью — для естественного сияния, подушечками пальцев — для насыщенного. Наносите на скулы, над губой, на внутренние уголки глаз.",
      uz: "Cho‘tka bilan — tabiiy jilo, barmoq uchlari bilan — to‘yingan jilo. Yonoq ustiga, lab ustiga, ko‘zning ichki burchaklariga surting.",
    },
    forWhom: {
      ru: "Любительницам сияющей кожи и вечернего макияжа.",
      uz: "Yaltiroq teri va kechki makiyajni yoqtiruvchilar uchun.",
    },
  },
  "dior-glow-stick-012-rosewood": {
    kind: "care",
    points: {
      ru: [
        "Кремовые румяна-стик Dior Backstage Rosy Glow",
        "Реагируют на pH кожи — у каждой свой оттенок розового дерева",
        "Сияющий финиш «свежей кожи», цвет держится до 12 часов (по данным Dior)",
        "6 г, компактный стик — удобно поправлять в течение дня",
      ],
      uz: [
        "Dior Backstage Rosy Glow krem-stik qizartirgichi",
        "Teri pH darajasiga moslashadi — har kimda o‘ziga xos atirgul-yog‘och tusi",
        "«Tetik teri» jiloli finish, rang 12 soatgacha saqlanadi (Dior ma’lumoti)",
        "6 g, ixcham stik — kun davomida tuzatish qulay",
      ],
    },
    howTo: {
      ru: "Проведите стиком по яблочкам щёк и вбейте пальцами или спонжем к вискам. Цвет проявится за пару минут.",
      uz: "Stikni yonoq do‘mbog‘iga surting va barmoq yoki sponj bilan chakkaga qarab yoying. Rang bir-ikki daqiqada namoyon bo‘ladi.",
    },
    forWhom: {
      ru: "Тем, кто хочет естественный румянец «как после прогулки».",
      uz: "«Sayrdan keyingidek» tabiiy qizillikni xohlaganlar uchun.",
    },
  },
  "makeup-by-mario-brush-set": {
    kind: "care",
    points: {
      ru: [
        "Кисти от визажиста Марио Дедивановича — того, кто работает с Ким Кардашьян",
        "Мягкий плотный ворс: равномерно набирает и растушёвывает продукт",
        "Подходят для кремовых, жидких и пудровых текстур",
        "В комплекте косметичка для хранения",
      ],
      uz: [
        "Vizajist Mario Dedivanovich cho‘tkalari — Kim Kardashian bilan ishlaydigan usta",
        "Yumshoq, zich tuk: mahsulotni bir tekis oladi va soyalaydi",
        "Krem, suyuq va upa teksturalar uchun mos",
        "To‘plamda saqlash uchun kosmetichka bor",
      ],
    },
    howTo: {
      ru: "Плотная кисть — для тона и крема, пушистая — для пудры и румян, маленькая — для теней. Мойте кисти раз в неделю мягким шампунем.",
      uz: "Zich cho‘tka — tonal va krem uchun, momiq — upa va qizartirgich uchun, kichigi — soya uchun. Cho‘tkalarni haftada bir marta yumshoq shampun bilan yuving.",
    },
    forWhom: {
      ru: "И новичкам, и тем, кто давно красится, — базовый набор на каждый день.",
      uz: "Yangi boshlovchilarga ham, tajribalilarga ham — har kungi asosiy to‘plam.",
    },
  },
  "makeup-by-mario-softsculpt-shaping-stick": {
    kind: "care",
    points: {
      ru: [
        "Кремовый стик для мягкого скульптурирования и бронзирования",
        "Тает на коже и растушёвывается без пятен",
        "Естественная тень, которая выглядит как своя",
        "Оттенок легко наслаивать — от лёгкого до выразительного",
      ],
      uz: [
        "Yumshoq skulpturlash va bronzlash uchun krem-stik",
        "Teriga singib ketadi va dog‘siz soyalanadi",
        "O‘zingiznikidek ko‘rinadigan tabiiy soya",
        "Tusni oson qatlamlash mumkin — yengildan yorqingacha",
      ],
    },
    howTo: {
      ru: "Нанесите линии под скулами, у висков и вдоль линии челюсти, растушуйте кистью или спонжем вверх. Можно поверх тона.",
      uz: "Yonoq ostiga, chakka va jag‘ chizig‘i bo‘ylab chiziq torting, cho‘tka yoki sponj bilan yuqoriga soyalang. Tonal ustidan surtish mumkin.",
    },
    forWhom: {
      ru: "Тем, кто хочет подчеркнуть черты лица без резкого контуринга.",
      uz: "Keskin konturingsiz yuz chiziqlarini ajratmoqchi bo‘lganlar uchun.",
    },
  },
  "armani-blush-balm-05": {
    kind: "care",
    points: {
      ru: [
        "Румяна-бальзам: тают на коже и дают сочный «влажный» румянец",
        "Оттенок 05 — благородный розово-лиловый",
        "Подходят и для щёк, и для губ",
        "Не подчёркивают текстуру кожи",
      ],
      uz: [
        "Balzam-qizartirgich: teriga singib, shirali «nam» qizillik beradi",
        "05 tusi — nafis pushti-binafsha",
        "Yonoq uchun ham, lab uchun ham mos",
        "Teri teksturasini ajratib ko‘rsatmaydi",
      ],
    },
    howTo: {
      ru: "Наберите немного пальцем и вбейте в яблочки щёк. Для губ — лёгкими похлопываниями.",
      uz: "Barmoq bilan ozgina olib, yonoq do‘mbog‘iga urib-urib surting. Lab uchun — yengil tegizib.",
    },
    forWhom: {
      ru: "Для нормальной и сухой кожи, любительницам свежего макияжа.",
      uz: "Normal va quruq teri uchun, tetik makiyaj ishqibozlariga.",
    },
  },
  "tom-ford-highlighter-01-capri": {
    kind: "care",
    points: {
      ru: [
        "Хайлайтер из летней коллекции Tom Ford Soleil",
        "Тонкие сияющие частицы без крупных блёсток",
        "Даёт эффект кожи, тронутой солнцем",
        "Роскошный футляр — красиво смотрится в косметичке",
      ],
      uz: [
        "Tom Ford Soleil yozgi kolleksiyasidan haylayter",
        "Yirik yaltiroqsiz mayin jilo zarralari",
        "Quyosh tekkan teri effektini beradi",
        "Hashamatli quti — kosmetichkada chiroyli ko‘rinadi",
      ],
    },
    howTo: {
      ru: "Нанесите небольшой кистью на верх скул, дугу брови и купидонову дугу.",
      uz: "Kichik cho‘tka bilan yonoq ustiga, qosh yoyi ostiga va lab ustidagi chuqurchaga surting.",
    },
    forWhom: {
      ru: "Тем, кто любит ухоженный сияющий образ и люкс-косметику.",
      uz: "Parvarishlangan, yaltiroq qiyofa va lyuks kosmetikani yoqtiruvchilar uchun.",
    },
  },
  "tom-ford-soleil-sunlit-rose-lip-balm": {
    kind: "care",
    points: {
      ru: [
        "Увлажняющий бальзам с прозрачным розовым оттенком",
        "Смягчает и защищает губы, не липнет",
        "Подходит как самостоятельное средство и под помаду",
        "Золотой футляр в стиле Tom Ford Soleil",
      ],
      uz: [
        "Shaffof pushti tusli namlovchi balzam",
        "Labni yumshatadi va himoya qiladi, yopishmaydi",
        "Alohida ham, lab bo‘yog‘i ostiga ham mos",
        "Tom Ford Soleil uslubidagi oltin quti",
      ],
    },
    howTo: {
      ru: "Наносите на губы в течение дня по необходимости, особенно в холод и ветер.",
      uz: "Kun davomida kerak bo‘lganda labga surting, ayniqsa sovuq va shamolda.",
    },
    forWhom: {
      ru: "Для сухих губ и тех, кто любит естественный макияж.",
      uz: "Quruq lablar va tabiiy makiyajni yoqtiruvchilar uchun.",
    },
  },
  "lilac-brush-set": {
    kind: "care",
    points: {
      ru: [
        "Кисти для лица и глаз — полный набор для макияжа",
        "Натуральный козий ворс для пудровых текстур",
        "Синтетика таклон — для кремов и жидких текстур",
        "Подойдёт и визажисту, и для дома",
      ],
      uz: [
        "Yuz va ko‘z uchun cho‘tkalar — makiyaj uchun to‘liq to‘plam",
        "Upa teksturalar uchun tabiiy echki tuki",
        "Taklon sintetikasi — krem va suyuq teksturalar uchun",
        "Vizajistga ham, uy uchun ham mos",
      ],
    },
    howTo: {
      ru: "Натуральный ворс — для пудры, румян, теней; синтетику — для тона, консилера и кремовых продуктов. Мойте раз в неделю, сушите горизонтально.",
      uz: "Tabiiy tuk — upa, qizartirgich, soya uchun; sintetika — tonal, konsiler va krem mahsulotlar uchun. Haftada bir yuving, yotqizib quriting.",
    },
    forWhom: {
      ru: "Тем, кто собирает свой набор кистей с нуля.",
      uz: "O‘z cho‘tkalar to‘plamini noldan yig‘ayotganlar uchun.",
    },
  },
  "bobbi-brown-extra-plump-lip-serum": {
    kind: "care",
    points: {
      ru: [
        "Комплекс Extra Plump: шесть растительных масел и гиалуроновая кислота",
        "Масла жожоба, авокадо и оливы питают и смягчают",
        "Губы выглядят пухлее — без жжения и покалывания",
        "Лёгкий оттенок и сочный блеск",
      ],
      uz: [
        "Extra Plump kompleksi: oltita o‘simlik moyi va gialuron kislotasi",
        "Jojoba, avokado va zaytun moylari oziqlantiradi va yumshatadi",
        "Lablar to‘liqroq ko‘rinadi — achishish va sanchishsiz",
        "Yengil tus va shirali jilo",
      ],
    },
    howTo: {
      ru: "Наносите аппликатором на чистые губы отдельно или поверх помады.",
      uz: "Aplikator bilan toza labga alohida yoki lab bo‘yog‘i ustidan surting.",
    },
    forWhom: {
      ru: "Для сухих и чувствительных губ — тем, кто не переносит «жгучие» пламперы.",
      uz: "Quruq va sezgir lablar uchun — «achituvchi» plamperlarni ko‘tarmaydiganlarga.",
    },
  },
  "charlotte-tilbury-loose-setting-powder": {
    kind: "care",
    points: {
      ru: [
        "Рассыпчатая пудра с эффектом мягкого фокуса",
        "Фиксирует тон и консилер, продлевает стойкость макияжа",
        "Матирует без эффекта маски и не сушит",
        "Скрывает поры и мелкие неровности",
      ],
      uz: [
        "Yumshoq fokus effektli sochiluvchan upa",
        "Tonal va konsilerni mustahkamlaydi, makiyajni uzoq saqlaydi",
        "Niqob effektisiz matlaydi va quritmaydi",
        "G‘ovaklar va mayda notekisliklarni yashiradi",
      ],
    },
    howTo: {
      ru: "Наберите пудру пушистой кистью, стряхните лишнее и нанесите на Т-зону. Под глаза — влажным спонжем.",
      uz: "Momiq cho‘tka bilan upa oling, ortiqchasini silkiting va T-zonaga surting. Ko‘z ostiga — nam sponj bilan.",
    },
    forWhom: {
      ru: "Для любого типа кожи, особенно комбинированной и жирной.",
      uz: "Har qanday teri uchun, ayniqsa aralash va yog‘li teriga.",
    },
  },
  "vivienne-sabo-volume-lip-pencil": {
    kind: "care",
    points: {
      ru: [
        "Гелевая текстура — мягко скользит и не тянет губы",
        "Стойкий контур, не растекается",
        "Визуально увеличивает объём губ",
        "Можно заполнить всю поверхность губ как матовую помаду",
      ],
      uz: [
        "Gel tekstura — yumshoq sirpanadi, labni tortmaydi",
        "Bardoshli kontur, yoyilib ketmaydi",
        "Lab hajmini ko‘rinishdan kattalashtiradi",
        "Butun labni mat lab bo‘yog‘idek to‘ldirish mumkin",
      ],
    },
    howTo: {
      ru: "Обведите контур чуть по краю губ, растушуйте к центру. Сверху — блеск или бальзам.",
      uz: "Konturni lab chetidan sal tashqariroq chizing, markazga qarab soyalang. Ustidan — glos yoki balzam.",
    },
    forWhom: {
      ru: "Тем, кто хочет более пухлые губы без процедур.",
      uz: "Muolajasiz to‘liqroq lab xohlaganlar uchun.",
    },
  },
  "too-faced-lip-injection-plumpgasm": {
    kind: "care",
    points: {
      ru: [
        "Плампер-блеск из культовой линии Lip Injection",
        "Лёгкое покалывание — губы сразу выглядят пухлее",
        "Глянцевый блеск без липкости",
        "Питает и смягчает губы",
      ],
      uz: [
        "Mashhur Lip Injection liniyasidan plamper-glos",
        "Yengil sanchish — lablar darhol to‘liqroq ko‘rinadi",
        "Yopishqoqsiz yaltiroq jilo",
        "Labni oziqlantiradi va yumshatadi",
      ],
    },
    howTo: {
      ru: "Нанесите на губы отдельно или поверх помады, обновляйте по желанию. Покалывание — нормальная реакция, оно проходит.",
      uz: "Labga alohida yoki lab bo‘yog‘i ustidan surting, xohlaganda yangilang. Sanchish — normal holat, o‘tib ketadi.",
    },
    forWhom: {
      ru: "Тем, кто любит эффект объёма и сочный блеск. Отличный подарок.",
      uz: "Hajm effekti va shirali jiloni yoqtiruvchilar uchun. Ajoyib sovg‘a.",
    },
  },
  "charlotte-tilbury-hollywood-beauty-wonderland": {
    kind: "care",
    points: {
      ru: [
        "Праздничный адвент-календарь Charlotte Tilbury",
        "За каждой дверцей — бестселлер бренда в мини- или полном размере",
        "Уход и макияж: от помад и туши до средств для кожи",
        "Готовый подарок в роскошной упаковке",
      ],
      uz: [
        "Charlotte Tilbury bayram advent-kalendari",
        "Har bir eshikcha ortida — brendning mashhur mahsuloti mini yoki to‘liq hajmda",
        "Parvarish va makiyaj: lab bo‘yog‘i va tushdan teri vositalarigacha",
        "Hashamatli qadoqdagi tayyor sovg‘a",
      ],
    },
    howTo: {
      ru: "Открывайте по одной дверце в день до праздника — или все сразу, мы не скажем.",
      uz: "Bayramgacha har kuni bitta eshikcha oching — yoki hammasini birdan, hech kimga aytmaymiz.",
    },
    forWhom: {
      ru: "Лучший подарок на Новый год для подруги, мамы, любимой.",
      uz: "Dugona, ona, sevgilingiz uchun Yangi yilga eng yaxshi sovg‘a.",
    },
  },
  "makeup-by-mario-neutrals-palette": {
    kind: "care",
    points: {
      ru: [
        "Палетки Makeup by Mario на выбор: Original и The Neutrals",
        "Original — тёплые нюдовые, бежевые и карамельные оттенки",
        "The Neutrals — холодные серые, розово-коричневые и бежевые",
        "Матовые и мерцающие тени, плотный пигмент, мягкая растушёвка",
      ],
      uz: [
        "Makeup by Mario palitralari: Original va The Neutrals",
        "Original — iliq nyud, bej va karamel tuslar",
        "The Neutrals — sovuq kulrang, pushti-jigarrang va bej tuslar",
        "Mat va yaltiroq soyalar, to‘yingan pigment, yumshoq soyalanish",
      ],
    },
    howTo: {
      ru: "Светлый матовый — на всё веко, средний — в складку, тёмный — во внешний уголок, мерцающий — в центр века пальцем.",
      uz: "Och mat tus — butun qovoqqa, o‘rtachasi — burmaga, to‘q — tashqi burchakka, yaltiroq — barmoq bilan qovoq o‘rtasiga.",
    },
    forWhom: {
      ru: "Для дневного и вечернего макияжа, под любой цвет глаз.",
      uz: "Kunduzgi va kechki makiyaj uchun, har qanday ko‘z rangiga.",
    },
  },
  "ysl-lash-clash-loveshine-set": {
    kind: "care",
    points: {
      ru: [
        "Тушь Lash Clash — экстремальный объём и глубокий чёрный",
        "Помада Loveshine №44 — увлажняет и даёт сияющий финиш",
        "Оба средства в полном размере",
        "Подарочная упаковка YSL",
      ],
      uz: [
        "Lash Clash tushi — ekstremal hajm va to‘q qora rang",
        "Loveshine №44 lab bo‘yog‘i — namlaydi va yaltiroq finish beradi",
        "Ikkala vosita to‘liq hajmda",
        "YSL sovg‘a qadog‘i",
      ],
    },
    howTo: {
      ru: "Тушь — зигзагом от корней к кончикам в 1–2 слоя. Помаду можно наносить прямо из стика или пальцем для лёгкого оттенка.",
      uz: "Tush — ildizdan uchiga zigzag bilan 1–2 qatlam. Lab bo‘yog‘ini to‘g‘ridan stikdan yoki yengil tus uchun barmoq bilan surting.",
    },
    forWhom: {
      ru: "Готовый подарок для любительниц YSL.",
      uz: "YSL ishqibozlari uchun tayyor sovg‘a.",
    },
  },
  "makeup-by-mario-ethereal-eyes-nature": {
    kind: "care",
    points: {
      ru: [
        "12 оттенков от бежевых и шоколадных до бронзовых, розовых и оливковых",
        "Матовые, сатиновые и сияющие текстуры",
        "Мягкие пигменты легко растушёвываются без пятен",
        "Хватит и на нюдовый день, и на дымчатый вечер",
      ],
      uz: [
        "Bej va shokoladdan bronza, pushti va zaytun ranggacha 12 tus",
        "Mat, satin va yaltiroq teksturalar",
        "Yumshoq pigmentlar dog‘siz oson soyalanadi",
        "Nyud kun uchun ham, tutunli oqshom uchun ham yetadi",
      ],
    },
    howTo: {
      ru: "Начните с матового переходного оттенка в складку, затемните внешний угол, сияющий тон нанесите в центр века пальцем.",
      uz: "Burmaga mat o‘tish tusidan boshlang, tashqi burchakni to‘qlashtiring, yaltiroq tusni barmoq bilan qovoq o‘rtasiga surting.",
    },
    forWhom: {
      ru: "Особенно красиво на карих и зелёных глазах.",
      uz: "Ayniqsa jigarrang va yashil ko‘zlarda chiroyli.",
    },
  },
  "patrick-ta-major-dimension": {
    kind: "care",
    points: {
      ru: [
        "Палетка визажиста Патрика Та — 12 универсальных оттенков",
        "Кремовые базы, бархатные матовые и металлические тени",
        "Сияющий топпер для «влажного» эффекта",
        "Тёплые и холодные нюды — от нежных до шоколадных",
      ],
      uz: [
        "Vizajist Patrik Ta palitrasi — 12 ta universal tus",
        "Krem asoslar, baxmal mat va metall soyalar",
        "«Nam» effekt uchun yaltiroq topper",
        "Iliq va sovuq nyudlar — noziklardan shokoladgacha",
      ],
    },
    howTo: {
      ru: "Сначала кремовая база на веко — потом матовые тени для формы и металлик поверх. Топпер — точечно в центр века.",
      uz: "Avval qovoqqa krem asos — so‘ng shakl uchun mat soyalar va ustidan metallik. Topper — qovoq o‘rtasiga nuqtaviy.",
    },
    forWhom: {
      ru: "Тем, кто хочет одну палетку на все случаи.",
      uz: "Barcha holatlar uchun bitta palitra xohlaganlar uchun.",
    },
  },
  "burberry-eye-quad": {
    kind: "care",
    points: {
      ru: [
        "Четыре гармоничных оттенка, подобранных визажистами Burberry",
        "Шелковистая текстура, легко наслаивается",
        "Готовая схема для дневного и вечернего макияжа",
        "Элегантный футляр с узнаваемым британским стилем",
      ],
      uz: [
        "Burberry vizajistlari tanlagan to‘rtta uyg‘un tus",
        "Ipaksimon tekstura, oson qatlamlanadi",
        "Kunduzgi va kechki makiyaj uchun tayyor sxema",
        "Taniqli britaniya uslubidagi nafis quti",
      ],
    },
    howTo: {
      ru: "Самый светлый — под бровь и во внутренний угол, средний — на веко, тёмный — по ресничному краю и во внешний угол.",
      uz: "Eng och tus — qosh ostiga va ichki burchakka, o‘rtachasi — qovoqqa, to‘q — kiprik chizig‘i va tashqi burchakka.",
    },
    forWhom: {
      ru: "Тем, кто ценит спокойную классику и быстрый макияж.",
      uz: "Sokin klassika va tez makiyajni qadrlaydiganlar uchun.",
    },
  },

  /* ——————————————————— Волосы ——————————————————— */
  "color-wow-dream-coat-extra-strength": {
    kind: "care",
    points: {
      ru: [
        "Эффект Glass Hair — гладкие, зеркально блестящие волосы",
        "Защищает от влажности и пушистости, держится несколько мытья",
        "Активируется теплом фена",
        "Версия Extra Strength — для густых, жёстких и пористых волос",
      ],
      uz: [
        "Glass Hair effekti — silliq, oynadek yaltiroq sochlar",
        "Namlik va paxmoqlikdan himoya qiladi, bir necha yuvishgacha saqlanadi",
        "Fen issiqligida faollashadi",
        "Extra Strength versiyasi — qalin, dag‘al va g‘ovak sochlar uchun",
      ],
    },
    howTo: {
      ru: "Распылите на чистые влажные волосы по прядям, расчешите и высушите феном с брашингом до полного высыхания.",
      uz: "Toza nam sochga tutamlab sepin, tarang va fen bilan to‘liq quriguncha brashing bilan quriting.",
    },
    forWhom: {
      ru: "Для пушащихся, вьющихся и непослушных волос.",
      uz: "Paxmoq, jingalak va itoatsiz sochlar uchun.",
    },
  },
  "kerastase-genesis-anti-chute-serum": {
    kind: "care",
    points: {
      ru: [
        "Сыворотка против выпадения из-за ломкости",
        "Аминексил, кофеин, клетки эдельвейса и корень имбиря",
        "Укрепляет корни и делает волосы плотнее",
        "Несмываемая, не утяжеляет волосы",
      ],
      uz: [
        "Mo‘rtlik sababli to‘kilishga qarshi zardob",
        "Aminexil, kofein, edelveys hujayralari va zanjabil ildizi",
        "Ildizlarni mustahkamlaydi va sochni qalinlashtiradi",
        "Yuvilmaydi, sochni og‘irlashtirmaydi",
      ],
    },
    howTo: {
      ru: "Нанесите на кожу головы по проборам, помассируйте. Не смывайте. Используйте каждый день курсом.",
      uz: "Bosh terisiga farq bo‘ylab surting, massaj qiling. Yuvmang. Har kuni kurs bilan qo‘llang.",
    },
    forWhom: {
      ru: "Для ослабленных, ломких и выпадающих волос.",
      uz: "Zaiflashgan, mo‘rt va to‘kiluvchi sochlar uchun.",
    },
  },
  "kerastase-genesis-defense-thermique": {
    kind: "care",
    points: {
      ru: [
        "Термозащита линии Genesis для ослабленных волос",
        "Бережёт от жара фена и утюжка, уменьшает ломкость",
        "Облегчает расчёсывание и придаёт гладкость",
        "Не утяжеляет и не склеивает пряди",
      ],
      uz: [
        "Zaif sochlar uchun Genesis liniyasining termohimoyasi",
        "Fen va dazmol issig‘idan asraydi, mo‘rtlikni kamaytiradi",
        "Taralishni osonlashtiradi va silliqlik beradi",
        "Og‘irlashtirmaydi, tutamlarni yopishtirmaydi",
      ],
    },
    howTo: {
      ru: "Нанесите на влажные волосы по длине перед укладкой феном, расчешите и сушите.",
      uz: "Fen bilan turmaklashdan oldin nam sochga uzunligi bo‘ylab surting, tarang va quriting.",
    },
    forWhom: {
      ru: "Тем, кто часто укладывает волосы и хочет сохранить их густоту.",
      uz: "Sochini tez-tez turmaklaydigan va qalinligini saqlamoqchi bo‘lganlar uchun.",
    },
  },
  "kerastase-genesis-cure": {
    kind: "care",
    points: {
      ru: [
        "Интенсивный курс в ампулах: 10 × 6 мл",
        "Аминексил, клетки эдельвейса и корень имбиря",
        "Укрепляет корни и снижает выпадение",
        "Удобно на сезонное выпадение — весной и осенью",
      ],
      uz: [
        "Ampulalardagi intensiv kurs: 10 × 6 ml",
        "Aminexil, edelveys hujayralari va zanjabil ildizi",
        "Ildizlarni mustahkamlaydi va to‘kilishni kamaytiradi",
        "Mavsumiy to‘kilishda qulay — bahor va kuzda",
      ],
    },
    howTo: {
      ru: "Нанесите содержимое ампулы на кожу головы по проборам, помассируйте, не смывайте. Курс — по инструкции на упаковке.",
      uz: "Ampula ichidagini bosh terisiga farq bo‘ylab surting, massaj qiling, yuvmang. Kurs — qadoqdagi ko‘rsatma bo‘yicha.",
    },
    forWhom: {
      ru: "При сезонном выпадении, после стресса, родов и диет.",
      uz: "Mavsumiy to‘kilishda, stress, tug‘ruq va parhezlardan keyin.",
    },
  },
  "keune-rush-hour": {
    kind: "care",
    points: {
      ru: [
        "Ускоряет сушку феном — экономит время по утрам",
        "Термозащита до 230 °C",
        "Разглаживает и облегчает укладку",
        "Нидерландский профессиональный бренд Keune",
      ],
      uz: [
        "Fen bilan quritishni tezlashtiradi — ertalab vaqtni tejaydi",
        "230 °C gacha termohimoya",
        "Silliqlaydi va turmaklashni osonlashtiradi",
        "Niderlandiyaning professional Keune brendi",
      ],
    },
    howTo: {
      ru: "Распылите на влажные волосы, расчешите и сушите феном.",
      uz: "Nam sochga sepin, tarang va fen bilan quriting.",
    },
    forWhom: {
      ru: "Для всех типов волос, особенно для длинных и густых.",
      uz: "Barcha soch turlari uchun, ayniqsa uzun va qalin sochlarga.",
    },
  },
  "keune-derma-activate-thickening-spray": {
    kind: "care",
    points: {
      ru: [
        "Уплотняющий спрей линии Derma Activate",
        "Прикорневой объём и визуальная густота",
        "Ухаживает за кожей головы",
        "Несмываемый, лёгкий",
      ],
      uz: [
        "Derma Activate liniyasining qalinlashtiruvchi spreyi",
        "Ildizdan hajm va ko‘rinishdan qalinlik",
        "Bosh terisini parvarishlaydi",
        "Yuvilmaydi, yengil",
      ],
    },
    howTo: {
      ru: "Распылите на кожу головы и корни чистых влажных волос, помассируйте. Не смывайте, уложите как обычно.",
      uz: "Toza nam sochning ildizi va bosh terisiga sepin, massaj qiling. Yuvmang, odatdagidek turmaklang.",
    },
    forWhom: {
      ru: "Для тонких и редеющих волос.",
      uz: "Ingichka va siyraklashgan sochlar uchun.",
    },
  },

  /* ——————————————————— Тело и лицо ——————————————————— */
  "bath-body-works-shimmer-body-butter": {
    kind: "care",
    points: {
      ru: [
        "Плотный баттер с маслом ши — глубоко увлажняет",
        "Мерцающие частицы дают красивое сияние на коже",
        "Фирменный аромат Bath & Body Works",
        "Кожа мягкая и гладкая весь день",
      ],
      uz: [
        "Shi moyli quyuq batter — chuqur namlaydi",
        "Yaltiroq zarralar teriga chiroyli jilo beradi",
        "Bath & Body Works’ning o‘ziga xos ifori",
        "Teri kun bo‘yi yumshoq va silliq",
      ],
    },
    howTo: {
      ru: "Нанесите на чистую кожу после душа, особенно на плечи, ключицы и ноги.",
      uz: "Dushdan keyin toza teriga surting, ayniqsa yelka, o‘mrov va oyoqlarga.",
    },
    forWhom: {
      ru: "Для сухой кожи и тем, кто хочет сияющие плечи летом и на праздник.",
      uz: "Quruq teri va yozda, bayramda yaltiroq yelka xohlaganlar uchun.",
    },
  },
  "dior-hydra-life-fresh-sorbet-creme": {
    kind: "care",
    points: {
      ru: [
        "Крем с текстурой геля-сорбета — тает на коже",
        "Глубоко увлажняет и освежает",
        "Мгновенно впитывается, не оставляет плёнки",
        "Хорошая база под макияж",
      ],
      uz: [
        "Gel-sorbet teksturali krem — teriga singib ketadi",
        "Chuqur namlaydi va tetiklashtiradi",
        "Tez singadi, parda qoldirmaydi",
        "Makiyaj uchun yaxshi asos",
      ],
    },
    howTo: {
      ru: "Утром и вечером на очищенную кожу лица и шеи лёгкими похлопывающими движениями.",
      uz: "Ertalab va kechqurun tozalangan yuz va bo‘yin terisiga yengil urib-urib surting.",
    },
    forWhom: {
      ru: "Для сухой, обезвоженной и чувствительной кожи.",
      uz: "Quruq, suvsizlangan va sezgir teri uchun.",
    },
  },
};

export function getDetails(slug: string): Details | undefined {
  return DETAILS[slug];
}
