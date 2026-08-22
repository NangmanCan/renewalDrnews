import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getArticlesByAuthor } from '@/lib/articles';

// ISR: 60초 캐시 후 자동 갱신
export const revalidate = 60;
export const runtime = 'edge';

const AUTHOR_NAME = '김영학';
const AUTHOR_TITLE = 'Dr.News 발행인 · 대기자';
const AUTHOR_BIO =
  '2007년 Dr.News를 창간한 발행인이자 대기자로, 20년 가까이 의료 전문지 기자로 정책·병원·제약 분야를 취재해왔다.';
const CANONICAL_URL = 'https://drnews.co.kr/author/kim-young-hak';

export const metadata = {
  title: '김영학 기자',
  description: 'Dr.News 발행인 김영학 대기자의 기사 모음',
  alternates: { canonical: CANONICAL_URL },
  openGraph: {
    type: 'profile',
    url: CANONICAL_URL,
    title: '김영학 기자',
    description: 'Dr.News 발행인 김영학 대기자의 기사 모음',
    locale: 'ko_KR',
    siteName: 'Dr.News',
  },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: AUTHOR_NAME,
  jobTitle: '발행인·대기자',
  description: AUTHOR_BIO,
  url: CANONICAL_URL,
  worksFor: {
    '@type': 'NewsMediaOrganization',
    name: 'Dr.News',
    alternateName: '닥터뉴스',
    url: 'https://drnews.co.kr',
    logo: 'https://drnews.co.kr/logo.png',
  },
};

export default async function AuthorPage() {
  const articles = await getArticlesByAuthor(AUTHOR_NAME, 20);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-navy mb-1">{AUTHOR_NAME}</h1>
        <p className="text-sm font-medium text-gray-500 mb-4">{AUTHOR_TITLE}</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-10">{AUTHOR_BIO}</p>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">최근 기사</h2>
          {articles.length > 0 ? (
            <ul className="border-t border-gray-200">
              {articles.map((article) => (
                <li key={article.id} className="border-b border-gray-100 py-3">
                  <Link
                    href={`/article/${article.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-navy hover:underline"
                  >
                    {article.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    {article.category && <span>{article.category}</span>}
                    {article.category && article.date && (
                      <span className="text-gray-300">|</span>
                    )}
                    {article.date && <time dateTime={article.date}>{article.date}</time>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 py-6">등록된 기사가 없습니다.</p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
