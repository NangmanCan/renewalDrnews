import './globals.css';

export const metadata = {
  title: 'Dr.News - 의료 전문 뉴스',
  description: 'Dr.News는 정책, 학술, 병원, 산업 분야의 의료 전문 뉴스를 제공합니다.',
  openGraph: {
    title: 'Dr.News - 의료 전문 뉴스',
    description: 'Dr.News는 정책, 학술, 병원, 산업 분야의 의료 전문 뉴스를 제공합니다.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
