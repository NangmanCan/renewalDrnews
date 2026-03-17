/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54331',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: '*.kmpnews.co.kr',
      },
      {
        protocol: 'http',
        hostname: '*.kmpnews.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'cdn.kmpnews.co.kr',
      },
      {
        protocol: 'http',
        hostname: 'www.kmpnews.co.kr',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  turbopack: {
    root: '/home/user/renewalDrnews',
  },
};

module.exports = nextConfig;
