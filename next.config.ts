import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: 'admin\\..*',
            },
          ],
          destination: '/admin',
        },
        {
          source: '/login',
          has: [
            {
              type: 'host',
              value: 'admin\\..*',
            },
          ],
          destination: '/admin-login',
        },
        {
          // Match any path that isn't an API route or static file
          // The regex ensures we don't rewrite internal Next.js paths
          source: '/:path((?!api|_next/static|_next/image|favicon.ico).*)',
          has: [
            {
              type: 'host',
              value: 'admin\\..*',
            },
          ],
          destination: '/admin/:path',
        },
      ],
    }
  },
};

export default nextConfig;
