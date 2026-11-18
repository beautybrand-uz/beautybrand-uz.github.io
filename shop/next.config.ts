import type { NextConfig } from "next";

// GITHUB_PAGES=1 — статическая сборка для malik-alaska2.github.io/beautybrand
const pages = process.env.GITHUB_PAGES === "1";
const basePath = pages ? "/beautybrand" : "";

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
