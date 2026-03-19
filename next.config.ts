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
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: `${process.env.NEXT_PUBLIC_STRAPI_URL || 'https://katypride-strapi.onrender.com'}/admin/:path*`,
      },
      {
        source: '/api/strapi/:path*',
        destination: `${process.env.NEXT_PUBLIC_STRAPI_URL || 'https://katypride-strapi.onrender.com'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
