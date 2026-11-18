import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { C, EndCard, PhotoPan, PriceTag, T, clamp, display, ease, getProduct, price, sans, useIn, type Lang } from "./brand";

export type ProductPromoProps = { slug: string; lang: Lang };

export const PRODUCT_PROMO_FRAMES = 240;
const END_AT = 165;

/** 1. Ролик на один товар, 9:16, 8 секунд */
export const ProductPromo: React.FC<ProductPromoProps> = ({ slug, lang }) => {
  const p = getProduct(slug);
  if (!p) throw new Error(`Нет товара ${slug}`);
  const t = T[lang];
  const frame = useCurrentFrame();

  const reveal = interpolate(frame, [0, 22], [100, 0], { ...clamp, easing: ease });
  const brandIn = useIn(14);
  const nameIn = useIn(22);
  const metaIn = useIn(70);
  const out = interpolate(frame, [END_AT - 10, END_AT + 8], [1, 0], clamp);
  const photos = p.images.slice(0, 2);
  const swap = photos.length > 1 ? interpolate(frame, [92, 108], [0, 1], clamp) : 0;

  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <AbsoluteFill style={{ opacity: out }}>
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto 0",
            height: 1200,
            overflow: "hidden",
            borderRadius: "0 0 64px 64px",
            clipPath: `inset(0 0 ${reveal}% 0 round 0 0 64px 64px)`,
            background: C.well,
          }}
        >
          <AbsoluteFill>
            <PhotoPan src={photos[0]} dur={END_AT} />
          </AbsoluteFill>
          {photos[1] ? (
            <AbsoluteFill style={{ opacity: swap }}>
              <PhotoPan src={photos[1]} from={92} dur={END_AT - 92} zoom={[1.08, 1.16]} />
            </AbsoluteFill>
          ) : null}
          {p.oldPrice ? (
            <div
              style={{
                position: "absolute",
                top: 64,
                left: 64,
                padding: "14px 30px",
                borderRadius: 999,
                background: C.paper,
                color: C.rose,
                fontFamily: display,
                fontWeight: 600,
                fontSize: 48,
                opacity: metaIn,
              }}
            >
              −{Math.round((1 - p.price / p.oldPrice) * 100)}%
            </div>
          ) : null}
        </div>

        <div style={{ position: "absolute", left: 80, right: 80, top: 1270 }}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 42,
              color: C.cocoa,
              opacity: brandIn,
              transform: `translateY(${interpolate(brandIn, [0, 1], [24, 0])}px)`,
            }}
          >
            {p.brand}
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: display,
              fontWeight: 500,
              fontSize: p.name.length > 28 ? 62 : 76,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: C.ink,
              opacity: nameIn,
              transform: `translateY(${interpolate(nameIn, [0, 1], [30, 0])}px)`,
            }}
          >
            {p.name}
          </div>
          <div style={{ marginTop: 48, display: "flex", alignItems: "center", gap: 28 }}>
            <PriceTag size={58} start={46}>
              {price(p.price, lang)}
            </PriceTag>
            {p.oldPrice ? (
              <span style={{ fontFamily: sans, fontSize: 40, color: C.cocoa, textDecoration: "line-through", opacity: metaIn }}>
                {price(p.oldPrice, lang)}
              </span>
            ) : null}
          </div>
          <div style={{ marginTop: 44, fontFamily: sans, fontSize: 36, color: C.cocoa, opacity: metaIn }}>
            {p.variants ? p.variants.map((v) => v.label).join("  /  ") : t.original}
          </div>
        </div>
      </AbsoluteFill>

      <Sequence from={END_AT}>
        <EndCard lang={lang} />
      </Sequence>
    </AbsoluteFill>
  );
};
