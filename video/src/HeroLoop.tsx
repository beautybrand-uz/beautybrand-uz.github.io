import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { C, LOGO, clamp, ease, getProduct, img } from "./brand";

export type HeroLoopProps = { slugs: string[] };

export const HERO_FRAMES = 300;

/**
 * 4. Зацикленное видео для главной сайта, 1:1, 10 секунд.
 * Логотип «дышит», посередине веером проходят 4 новинки, последний кадр совпадает с первым.
 */
export const HeroLoop: React.FC<HeroLoopProps> = ({ slugs }) => {
  const frame = useCurrentFrame();
  const phase = (frame / HERO_FRAMES) * Math.PI * 2;
  const breathe = 1.03 + 0.025 * Math.sin(phase);
  const items = slugs.map((s) => getProduct(s)).filter((p): p is NonNullable<typeof p> => !!p).slice(0, 4);

  // окно с товарами: 100–250 кадр
  const show = interpolate(frame, [100, 122, 228, 252], [0, 1, 1, 0], { ...clamp, easing: ease });

  return (
    <AbsoluteFill style={{ background: C.paper, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${breathe})` }}>
        <Img src={img(LOGO)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(249,247,240,${0.55 * show})` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {items.map((p, i) => {
          const local = interpolate(frame, [104 + i * 8, 130 + i * 8], [0, 1], { ...clamp, easing: ease });
          const k = local * show;
          const angle = (i - (items.length - 1) / 2) * 9;
          const x = (i - (items.length - 1) / 2) * 175;
          return (
            <div
              key={p.slug}
              style={{
                position: "absolute",
                width: 380,
                height: 475,
                borderRadius: 30,
                overflow: "hidden",
                background: C.well,
                border: `10px solid ${C.paper}`,
                boxShadow: "0 40px 70px -35px rgba(42,26,21,.55)",
                opacity: k,
                transform: `translate(${x * k}px, ${interpolate(k, [0, 1], [140, Math.abs(i - 1.5) * 26])}px) rotate(${
                  angle * k
                }deg)`,
              }}
            >
              <Img src={img(p.images[0])} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
