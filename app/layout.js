import './globals.css';

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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
