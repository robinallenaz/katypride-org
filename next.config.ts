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
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://katypride-org.onrender.com'
    return [
      {
        source: '/admin/:path*',
        destination: `${strapiUrl}/admin/:path*`,
      },
      {
        source: '/api/strapi/:path*',
        destination: `${strapiUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${strapiUrl}/uploads/:path*`,
      },
    ]
  },
};

export default nextConfig;
