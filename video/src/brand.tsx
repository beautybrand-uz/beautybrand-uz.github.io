import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadUnbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as loadGolos } from "@remotion/google-fonts/GolosText";
import { loadFont as loadVibes } from "@remotion/google-fonts/GreatVibes";
import { getProduct, products } from "../../shop/src/data/products";

export const display = loadUnbounded("normal", { weights: ["500", "600"], subsets: ["latin", "cyrillic"] }).fontFamily;
export const sans = loadGolos("normal", { weights: ["400", "500", "600"], subsets: ["latin", "cyrillic"] }).fontFamily;
export const script = loadVibes("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;

// Те же цвета, что на сайте
export const C = {
  paper: "#f9f7f0",
  well: "#f1ebe2",
  ink: "#2a1a15",
  cocoa: "#6e5045",
  nude: "#ead2c6",
  rose: "#a3425a",
};

export type Lang = "ru" | "uz";

export const T = {
  ru: {
    currency: "сум",
    order: "Заказ в Telegram",
    original: "Только оригинал",
    newIn: "Новое поступление",
    sale: "Скидка",
    was: "Было",
    now: "Сейчас",
    stores: "Ц5 – Киёт, 60 · Ц1 – Буюк Ипак Йули, 26",
    site: "beautybrand.uz",
  },
  uz: {
    currency: "so‘m",
    order: "Buyurtma Telegramda",
    original: "Faqat original",
    newIn: "Yangi mahsulotlar",
    sale: "Chegirma",
    was: "Oldin",
    now: "Hozir",
    stores: "Ts5 – Kiyot, 60 · Ts1 – Buyuk Ipak Yo‘li, 26",
    site: "beautybrand.uz",
  },
};

export const LOGO = "brand/girl-glam-1200.webp";
export const MANAGER = "@beautybrandcosmetics";

export { getProduct, products };

export const img = (src: string) => staticFile(src.replace(/^\//, ""));

export function price(sum: number, lang: Lang) {
  return `${sum.toLocaleString("ru-RU").replace(/\s/g, " ")} ${T[lang].currency}`;
}

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 плавно за `dur` кадров начиная с `start` */
export function useIn(start: number, dur = 18) {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: ease });
}

/** Ценник-бирка как на сайте: скошенный край и дырочка, качается при появлении */
export const PriceTag: React.FC<{ children: React.ReactNode; size?: number; start?: number; color?: string }> = ({
  children,
  size = 64,
  start = 0,
  color = C.rose,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - start, fps, config: { damping: 9, stiffness: 120, mass: 0.8 } });
  const appear = spring({ frame: frame - start, fps, config: { damping: 200 }, durationInFrames: 14 });
  const rot = interpolate(s, [0, 1], [-14, 0]);
  const h = size * 1.55;
  const notch = h * 0.34;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: h,
        padding: `0 ${size * 0.5}px 0 ${notch + size * 0.55}px`,
        background: color,
        color: "#fff",
        fontFamily: display,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
        clipPath: `polygon(${notch}px 0, 100% 0, 100% 100%, ${notch}px 100%, 0 50%)`,
        borderRadius: `0 ${size * 0.12}px ${size * 0.12}px 0`,
        position: "relative",
        transformOrigin: "0% 50%",
        transform: `rotate(${rot}deg) scale(${interpolate(appear, [0, 1], [0.6, 1])})`,
        opacity: appear,
        boxShadow: "0 20px 40px -20px rgba(42,26,21,.5)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: notch * 0.85,
          top: "50%",
          width: size * 0.22,
          height: size * 0.22,
          marginTop: -size * 0.11,
          borderRadius: "50%",
          background: C.paper,
        }}
      />
      {children}
    </div>
  );
};

/** Концовка: логотип с девушкой, призыв и контакты */
export const EndCard: React.FC<{ lang: Lang; start?: number }> = ({ lang, start = 0 }) => {
  const t = T[lang];
  const a = useIn(start, 20);
  const b = useIn(start + 10, 20);
  const c = useIn(start + 18, 20);
  return (
    <AbsoluteFill style={{ background: C.paper, alignItems: "center", justifyContent: "center", opacity: a }}>
      <Img
        src={img(LOGO)}
        style={{
          width: 760,
          height: 760,
          borderRadius: 56,
          transform: `scale(${interpolate(a, [0, 1], [0.94, 1])})`,
          boxShadow: "0 50px 90px -50px rgba(42,26,21,.45)",
        }}
      />
      <div
        style={{
          marginTop: 80,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "26px 46px",
          borderRadius: 999,
          background: C.ink,
          color: C.paper,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 36,
          whiteSpace: "nowrap",
          opacity: b,
          transform: `translateY(${interpolate(b, [0, 1], [30, 0])}px)`,
        }}
      >
        <TelegramGlyph size={38} />
        {t.order}: {MANAGER}
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: sans,
          fontSize: 34,
          color: C.cocoa,
          opacity: c,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        {t.stores}
        <br />
        {t.site}
      </div>
    </AbsoluteFill>
  );
};

export const TelegramGlyph: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.4 4.2 2.9 11.3c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.8.8.4 0 .6-.2.9-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.4-1.5ZM9.7 14.3l-.4 4-1.5-4.8L18.4 7l-8.7 7.3Z" />
  </svg>
);

/** Медленный наезд камеры на фото (Ken Burns) */
export const PhotoPan: React.FC<{ src: string; from?: number; dur: number; zoom?: [number, number] }> = ({
  src,
  from = 0,
  dur,
  zoom = [1.04, 1.16],
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [from, from + dur], zoom, clamp);
  return (
    <Img
      src={img(src)}
      style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${s})` }}
    />
  );
};
