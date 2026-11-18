import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadSans } from "@remotion/google-fonts/Manrope";

const { fontFamily: serif } = loadSerif("normal", {
  weights: ["500"],
  subsets: ["latin", "cyrillic"],
});
const { fontFamily: sans } = loadSans("normal", {
  weights: ["400"],
  subsets: ["latin", "cyrillic"],
});

export type LogoIntroProps = {
  brandName: string;
  tagline: string;
  logoFile: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.22, 1, 0.36, 1);

// Тайминг (кадры при 30 fps)
const LETTERS_START = 10;
const LETTER_STAGGER = 3;
const LINE_START = 44;
const TAGLINE_START = 54;
const SHIMMER_START = 78;
const SHIMMER_DURATION = 26;

export const LogoIntro: React.FC<LogoIntroProps> = ({
  brandName,
  tagline,
  logoFile,
  backgroundColor,
  accentColor,
  textColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const letters = Array.from(brandName.toUpperCase());
  // Подгоняем кегль так, чтобы название влезло в ширину кадра с полями.
  const fontSize = Math.min(170, Math.floor((width * 0.84) / (letters.length * 0.78)));
  const letterSpacing = "0.12em";

  // Мягкое «дыхание» фона на всю длительность
  const bloomScale = interpolate(frame, [0, 120], [0.85, 1.15], clamp);
  const bloomOpacity = interpolate(frame, [0, 30], [0, 0.55], { ...clamp, easing: easeOut });

  const logoIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });

  const lineWidth = interpolate(frame, [LINE_START, LINE_START + 24], [0, 260], {
    ...clamp,
    easing: easeOut,
  });

  const taglineIn = interpolate(frame, [TAGLINE_START, TAGLINE_START + 22], [0, 1], {
    ...clamp,
    easing: easeOut,
  });

  const shimmerPos = interpolate(
    frame,
    [SHIMMER_START, SHIMMER_START + SHIMMER_DURATION],
    [-60, 160],
    { ...clamp, easing: Easing.inOut(Easing.quad) },
  );
  const showShimmer = frame >= SHIMMER_START && frame <= SHIMMER_START + SHIMMER_DURATION;

  const wordmarkStyle: React.CSSProperties = {
    fontFamily: serif,
    fontWeight: 500,
    fontSize,
    letterSpacing,
    lineHeight: 1,
    whiteSpace: "pre",
    // компенсируем letter-spacing у последней буквы, чтобы текст был по центру
    paddingLeft: letterSpacing,
  };

  return (
    <AbsoluteFill style={{ backgroundColor, overflow: "hidden" }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 1400,
            height: 1400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor} 0%, ${backgroundColor}00 65%)`,
            opacity: bloomOpacity,
            transform: `scale(${bloomScale})`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          color: textColor,
        }}
      >
        {logoFile ? (
          <Img
            src={staticFile(logoFile)}
            style={{
              width: 260,
              height: 260,
              objectFit: "contain",
              marginBottom: 70,
              opacity: logoIn,
              transform: `scale(${interpolate(logoIn, [0, 1], [0.85, 1])})`,
            }}
          />
        ) : null}

        <div style={{ position: "relative" }}>
          <div style={{ ...wordmarkStyle, display: "flex" }}>
            {letters.map((char, i) => {
              const p = spring({
                frame: frame - LETTERS_START - i * LETTER_STAGGER,
                fps,
                config: { damping: 200 },
                durationInFrames: 26,
              });
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    opacity: p,
                    transform: `translateY(${interpolate(p, [0, 1], [36, 0])}px)`,
                    filter: `blur(${interpolate(p, [0, 1], [14, 0])}px)`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {showShimmer ? (
            <div
              aria-hidden
              style={{
                ...wordmarkStyle,
                position: "absolute",
                inset: 0,
                display: "flex",
                color: "transparent",
                backgroundImage:
                  "linear-gradient(105deg, transparent 0%, transparent 40%, rgba(255,255,255,0.85) 50%, transparent 60%, transparent 100%)",
                backgroundSize: "250% 100%",
                backgroundPosition: `${100 - shimmerPos}% 0`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              {letters.join("")}
            </div>
          ) : null}
        </div>

        <div
          style={{
            width: lineWidth,
            height: 2,
            backgroundColor: accentColor,
            marginTop: 56,
            marginBottom: 44,
          }}
        />

        <div
          style={{
            fontFamily: sans,
            fontSize: 34,
            textTransform: "uppercase",
            letterSpacing: `${interpolate(taglineIn, [0, 1], [0.5, 0.3])}em`,
            opacity: taglineIn,
            transform: `translateY(${interpolate(taglineIn, [0, 1], [20, 0])}px)`,
            textAlign: "center",
            maxWidth: width * 0.8,
          }}
        >
          {tagline}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
