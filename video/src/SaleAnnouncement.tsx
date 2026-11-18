import { AbsoluteFill, Img, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EndCard, PriceTag, T, clamp, display, ease, getProduct, img, price, sans, useIn, type Lang } from "./brand";

export type SaleProps = { slug: string; lang: Lang };

export const SALE_FRAMES = 240;
const END_AT = 168;

/** 3. Анонс скидки, 9:16, 8 секунд */
export const SaleAnnouncement: React.FC<SaleProps> = ({ slug, lang }) => {
  const p = getProduct(slug);
  if (!p) throw new Error(`Нет товара ${slug}`);
  const t = T[lang];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const old = p.oldPrice ?? Math.round(p.price * 1.1);
  const pct = Math.round((1 - p.price / old) * 100);

  const pop = spring({ frame: frame - 4, fps, config: { damping: 11, stiffness: 140 } });
  const labelIn = useIn(0, 16);
  // большой процент уезжает вверх и уменьшается, освобождая место товару
  const shrink = interpolate(frame, [44, 66], [0, 1], { ...clamp, easing: ease });
  const cardIn = useIn(52, 22);
  const strike = interpolate(frame, [88, 104], [0, 100], { ...clamp, easing: ease });
  const oldIn = useIn(76, 14);
  const variantsIn = useIn(120, 16);
  const out = interpolate(frame, [END_AT - 10, END_AT + 8], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ background: C.rose }}>
      <AbsoluteFill style={{ opacity: out, alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            top: interpolate(shrink, [0, 1], [560, 110]),
            width: "100%",
            textAlign: "center",
            color: C.paper,
          }}
        >
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: interpolate(shrink, [0, 1], [64, 44]), opacity: labelIn }}>
            {t.sale}
          </div>
          <div
            style={{
              fontFamily: display,
              fontWeight: 600,
              fontSize: interpolate(shrink, [0, 1], [400, 170]),
              lineHeight: 1,
              letterSpacing: "-0.04em",
              transform: `scale(${pop})`,
            }}
          >
            −{pct}%
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 470,
            left: 80,
            right: 80,
            borderRadius: 56,
            background: C.paper,
            overflow: "hidden",
            opacity: cardIn,
            transform: `translateY(${interpolate(cardIn, [0, 1], [160, 0])}px)`,
            boxShadow: "0 60px 100px -50px rgba(42,26,21,.6)",
          }}
        >
          <div style={{ height: 760, overflow: "hidden", background: C.well }}>
            <Img
              src={img(p.images[0])}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `scale(${interpolate(frame, [52, END_AT], [1.04, 1.14], clamp)})`,
              }}
            />
          </div>
          <div style={{ padding: "44px 56px 56px" }}>
            <div style={{ fontFamily: sans, fontSize: 38, color: C.cocoa }}>{p.brand}</div>
            <div style={{ marginTop: 8, fontFamily: display, fontWeight: 500, fontSize: 60, lineHeight: 1.1, color: C.ink }}>
              {p.name}
            </div>
            <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 30 }}>
              <div style={{ position: "relative", fontFamily: sans, fontSize: 44, color: C.cocoa, opacity: oldIn }}>
                {price(old, lang)}
                <div
                  style={{
                    position: "absolute",
                    left: -6,
                    top: "52%",
                    height: 5,
                    width: `calc(${strike}% + 12px)`,
                    background: C.rose,
                    borderRadius: 4,
                  }}
                />
              </div>
              <PriceTag size={54} start={104}>
                {price(p.price, lang)}
              </PriceTag>
            </div>
            {p.variants ? (
              <div style={{ marginTop: 34, fontFamily: sans, fontSize: 34, color: C.cocoa, opacity: variantsIn }}>
                {p.variants.map((v) => v.label).join("  /  ")}
              </div>
            ) : null}
          </div>
        </div>
      </AbsoluteFill>
      <Sequence from={END_AT}>
        <EndCard lang={lang} />
      </Sequence>
    </AbsoluteFill>
  );
};
