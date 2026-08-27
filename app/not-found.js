import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '페이지를 찾을 수 없습니다',
  description: '요청하신 페이지를 찾을 수 없습니다. Dr.News(닥터뉴스) 주요 지면으로 이동해 주세요.',
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: '/', label: '홈', desc: '최신 의료 뉴스 헤드라인' },
  { href: '/about', label: '회사소개', desc: '매체 정보·취재 분야·편집 원칙' },
  { href: '/contact', label: '문의·제보', desc: '기사 제보와 광고·제휴 문의' },
  { href: '/category/policy', label: '정책', desc: '수가·의료법·복지부 정책 동향' },
  { href: '/category/hospital', label: '병의원', desc: '병원 경영·개원가·전공의 소식' },
  { href: '/category/pharma-bio', label: '제약·바이오', desc: '제약사 실적·신약·임상 소식' },
];

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-sm font-bold text-brand-600 mb-2">404</p>
        <h1 className="text-2xl font-bold text-navy mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          주소가 바뀌었거나 삭제된 기사일 수 있습니다. 아래 지면에서 원하시는 소식을 찾아보세요.
        </p>

        <ul className="space-y-3 border-t border-gray-200 pt-6">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm font-bold text-navy hover:underline">
                {link.label}
              </Link>
              <p className="text-sm text-gray-600 leading-relaxed">{link.desc}</p>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
