import type { NextConfig } from "next";

// GITHUB_PAGES=1 — статическая сборка для malik-alaska2.github.io/beautybrand
// GITHUB_PAGES=1 — malik-alaska2.github.io/beautybrand; STATIC_EXPORT=1 — тот же сайт с корня (Vercel и др.)
const pages = process.env.GITHUB_PAGES === "1" || process.env.STATIC_EXPORT === "1";
const basePath = process.env.GITHUB_PAGES === "1" ? "/beautybrand" : "";

const nextConfig: NextConfig = {
  // частичный пререндер несовместим со статическим экспортом
  cacheComponents: !pages,
  partialPrefetching: !pages,
  ...(pages
    ? {
        output: "export",
        basePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
