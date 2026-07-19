import './globals.css';
import PageViewTracker from '@/components/PageViewTracker';

export const metadata = {
  metadataBase: new URL('https://drnews.co.kr'),
  title: {
    default: 'Dr.News - 의료 전문 뉴스',
    template: '%s | Dr.News',
  },
  description: 'Dr.News는 정책, 학술, 병원, 산업 분야의 의료 전문 뉴스를 제공합니다. 대한민국 의료계의 가장 신속하고 정확한 정보를 전달합니다.',
  keywords: ['의료뉴스', '의료정책', '병원뉴스', '의학', '헬스케어', '제약산업', 'Dr.News'],
  authors: [{ name: 'Dr.News' }],
  creator: 'Dr.News',
  publisher: 'Dr.News',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://drnews.co.kr',
    title: 'Dr.News - 의료 전문 뉴스',
    description: 'Dr.News는 정책, 학술, 병원, 산업 분야의 의료 전문 뉴스를 제공합니다.',
    siteName: 'Dr.News',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dr.News',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr.News - 의료 전문 뉴스',
    description: 'Dr.News는 정책, 학술, 병원, 산업 분야의 의료 전문 뉴스를 제공합니다.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    types: {
      'application/rss+xml': '/feed',
    },
  },
  // 파비콘: public/ 정적 파일 (app/ 메타데이터 라우트는 Cloudflare Pages edge 제약으로 미사용)
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  verification: {
    // 구글은 DNS TXT로 인증 완료 — env는 추가 인증 필요 시 사용
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : {}),
    other: {
      'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || '96481ae2e3cf414bd65e52afc7daed5d4ce76d70',
    },
  },
};

// 사이트 전역 JSON-LD (Organization + WebSite)
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dr.News',
  url: 'https://drnews.co.kr',
  logo: 'https://drnews.co.kr/logo.png',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Dr.News',
  url: 'https://drnews.co.kr',
  inLanguage: 'ko-KR',
  publisher: {
    '@type': 'Organization',
    name: 'Dr.News',
    url: 'https://drnews.co.kr',
    logo: 'https://drnews.co.kr/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
