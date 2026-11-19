import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/48hrproject',
  async redirects() {
    return [
      {source: '/dashboard', destination: '/home', permanent: false},
      {source: '/discover', destination: '/explore', permanent: false},
      {source: '/connections', destination: '/inbox', permanent: false},
      {source: '/crews', destination: '/teams', permanent: false},
      {source: '/crews/:path*', destination: '/teams/:path*', permanent: false},
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
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
