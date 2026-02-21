import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
  },
  async redirects() {
    return [
      {
        source: '/production-orders',
        destination: '/production?tab=orders',
        permanent: false,
      },
      {
        source: '/production-orders/:id',
        destination: '/production/orders/:id',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
