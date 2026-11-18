import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["ru", "uz"];

// Ссылки без языка (/, /p/...) ведут на нужную версию: узбекскую, если браузер на узбекском, иначе русскую
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;

  const accept = request.headers.get("accept-language")?.toLowerCase() ?? "";
  const lang = accept.startsWith("uz") ? "uz" : "ru";
  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|products/|brand/|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|.*\\..*).*)"],
};
