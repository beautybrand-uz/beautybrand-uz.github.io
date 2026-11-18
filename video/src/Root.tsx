import { Composition } from "remotion";
import { LogoIntro, type LogoIntroProps } from "./LogoIntro";

// Все тексты и цвета меняются здесь или на панели Props в Remotion Studio.
const defaultProps: LogoIntroProps = {
  brandName: "BEAUTYBRAND UZ",
  tagline: "Красота в каждой детали",
  // Положите файл логотипа в папку public/ и укажите имя, например "logo.png".
  // Пустая строка — показывается только название бренда.
  logoFile: "",
  backgroundColor: "#F7EDE6",
  accentColor: "#D9A79A",
  textColor: "#3B2A26",
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LogoIntro"
      component={LogoIntro}
      durationInFrames={120}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  );
};
