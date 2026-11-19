import type { NextConfig } from "next";

const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gtytlzylsohpeuewqjuw.supabase.co').hostname; }
  catch { return 'gtytlzylsohpeuewqjuw.supabase.co'; }
})();

const nextConfig: NextConfig = {
  basePath: '/48hrproject',
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/crew-avatars/**'},
    ],
  },
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
