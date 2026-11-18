import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Фото товаров и логотип берём прямо из магазина
Config.setPublicDir("../shop/public");
