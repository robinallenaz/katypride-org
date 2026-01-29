import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: isStaticExport,
  },
  basePath: isStaticExport ? process.env.NEXT_PUBLIC_BASE_PATH || "" : "",
  assetPrefix: isStaticExport ? process.env.NEXT_PUBLIC_BASE_PATH || "" : "",
};

export default nextConfig;
