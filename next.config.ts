import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'e.snmc.io' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => [
    {
      // Cache the albums JSON at the CDN edge
      source: '/_next/static/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    },
    {
      // Cache OG images for 1 hour
      source: '/api/og',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' }],
    },
  ],
};

export default nextConfig;