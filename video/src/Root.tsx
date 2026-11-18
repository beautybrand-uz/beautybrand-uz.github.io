import { Composition, Folder } from "remotion";
import { LOGO, products } from "./brand";
import { LogoIntro, type LogoIntroProps } from "./LogoIntro";
import { NewArrivals, newArrivalsFrames, type NewArrivalsProps } from "./NewArrivals";
import { PRODUCT_PROMO_FRAMES, ProductPromo } from "./ProductPromo";
import { SALE_FRAMES, SaleAnnouncement } from "./SaleAnnouncement";

const V = { fps: 30, width: 1080, height: 1920 } as const;

// Все тексты и цвета меняются здесь или на панели Props в Remotion Studio.
const introProps: LogoIntroProps = {
  brandName: "BEAUTYBRAND UZ",
  tagline: "Красота в каждой детали",
  logoFile: LOGO,
  backgroundColor: "#F9F7F0",
  accentColor: "#D9A79A",
  textColor: "#2A1A15",
};

const newIn: NewArrivalsProps = {
  lang: "ru",
  slugs: [
    "makeup-forever-hd-skin-face-essentials",
    "color-wow-dream-coat-extra-strength",
    "dior-backstage-glow-maximizer-007",
    "tom-ford-highlighter-01-capri",
    "armani-blush-balm-05",
    "charlotte-tilbury-loose-setting-powder",
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="LogoIntro" component={LogoIntro} durationInFrames={120} {...V} defaultProps={introProps} />

      <Composition
        id="ProductPromo"
        component={ProductPromo}
        durationInFrames={PRODUCT_PROMO_FRAMES}
        {...V}
        defaultProps={{ slug: "dior-glow-stick-012-rosewood", lang: "ru" as const }}
      />

      <Composition
        id="NewArrivals"
        component={NewArrivals}
        {...V}
        durationInFrames={newArrivalsFrames(newIn.slugs.length)}
        defaultProps={newIn}
        calculateMetadata={({ props }) => ({ durationInFrames: newArrivalsFrames(props.slugs.length) })}
      />

      <Composition
        id="SaleAnnouncement"
        component={SaleAnnouncement}
        durationInFrames={SALE_FRAMES}
        {...V}
        defaultProps={{ slug: "bobbi-brown-extra-plump-lip-serum", lang: "ru" as const }}
      />


      {/* Ролики на каждый товар — для пакетного рендера */}
      <Folder name="Products">
        {products.filter((p) => !p.usd).map((p) => (
          <Composition
            key={p.slug}
            id={`P-${p.slug}`}
            component={ProductPromo}
            durationInFrames={PRODUCT_PROMO_FRAMES}
            {...V}
            defaultProps={{ slug: p.slug, lang: "ru" as const }}
          />
        ))}
      </Folder>
    </>
  );
};
