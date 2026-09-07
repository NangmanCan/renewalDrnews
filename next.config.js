/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Storage 파일명이 타임스탬프라 불변 — 최적화 이미지 캐시 1년 (기본 60초는 Supabase 재타격 유발)
    minimumCacheTTL: 31536000,
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
