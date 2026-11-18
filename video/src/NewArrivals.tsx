import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { C, EndCard, PhotoPan, PriceTag, T, clamp, display, ease, getProduct, price, sans, script, useIn, type Lang } from "./brand";

export type NewArrivalsProps = { slugs: string[]; lang: Lang };

const INTRO = 54;
const PER = 54;
const OVERLAP = 12;
const END = 96;

export const newArrivalsFrames = (n: number) => INTRO + n * (PER - OVERLAP) + OVERLAP + END;

/** 2. «Новое поступление»: несколько товаров подряд, 9:16 */
export const NewArrivals: React.FC<NewArrivalsProps> = ({ slugs, lang }) => {
  const t = T[lang];
  const items = slugs.map((s) => getProduct(s)).filter((p): p is NonNullable<typeof p> => !!p);
  const endAt = INTRO + items.length * (PER - OVERLAP) + OVERLAP;

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Sequence durationInFrames={INTRO + OVERLAP}>
        <Title text={t.newIn} count={items.length} />
      </Sequence>
      {items.map((p, i) => (
        <Sequence key={p.slug} from={INTRO + i * (PER - OVERLAP)} durationInFrames={PER}>
          <Slide
            photo={p.images[0]}
            brand={p.brand}
            name={p.name}
            priceText={price(p.price, lang)}
            index={i + 1}
            total={items.length}
          />
        </Sequence>
      ))}
      <Sequence from={endAt}>
        <EndCard lang={lang} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Title: React.FC<{ text: string; count: number }> = ({ text }) => {
  const a = useIn(0, 20);
  const b = useIn(10, 22);
  return (
    <AbsoluteFill style={{ background: C.paper, alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div style={{ fontFamily: script, fontSize: 150, color: C.ink, opacity: a, lineHeight: 1 }}>Beautybrand</div>
      <div
        style={{
          marginTop: 50,
          fontFamily: display,
          fontWeight: 500,
          fontSize: 92,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          textAlign: "center",
          color: C.rose,
          opacity: b,
          transform: `translateY(${interpolate(b, [0, 1], [40, 0])}px)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const Slide: React.FC<{ photo: string; brand: string; name: string; priceText: string; index: number; total: number }> = ({
  photo,
  brand,
  name,
  priceText,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  // въезд справа, уход — лёгкое уменьшение под следующий слайд
  const enter = interpolate(frame, [0, OVERLAP], [1080, 0], { ...clamp, easing: ease });
  const leave = interpolate(frame, [PER - OVERLAP, PER], [1, 0.92], clamp);
  const textIn = useIn(8, 16);
  return (
    <AbsoluteFill style={{ transform: `translateX(${enter}px) scale(${leave})`, overflow: "hidden", background: C.well }}>
      <PhotoPan src={photo} dur={PER} zoom={[1.02, 1.1]} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(42,26,21,0) 52%, rgba(42,26,21,.82) 100%)" }} />
      <div
        style={{
          position: "absolute",
          top: 70,
          right: 70,
          fontFamily: display,
          fontSize: 34,
          color: C.paper,
          background: "rgba(42,26,21,.45)",
          padding: "10px 24px",
          borderRadius: 999,
        }}
      >
        {index} / {total}
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 120, color: C.paper }}>
        <div style={{ fontFamily: sans, fontSize: 40, opacity: 0.85 * textIn }}>{brand}</div>
        <div
          style={{
            marginTop: 10,
            fontFamily: display,
            fontWeight: 500,
            fontSize: name.length > 28 ? 58 : 70,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            opacity: textIn,
            transform: `translateY(${interpolate(textIn, [0, 1], [30, 0])}px)`,
          }}
        >
          {name}
        </div>
        <div style={{ marginTop: 36 }}>
          <PriceTag size={52} start={16}>
            {priceText}
          </PriceTag>
        </div>
      </div>
    </AbsoluteFill>
  );
};
