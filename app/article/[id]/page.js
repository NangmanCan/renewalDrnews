import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsCard from '@/components/NewsCard';
import SidebarAd from '@/components/SidebarAd';
import LatestNews from '@/components/LatestNews';
import PopularNews from '@/components/PopularNews';
import ViewTracker from '@/components/ViewTracker';
import ShareButtons from '@/components/ShareButtons';
import { getArticleById, getRelatedArticles, getArticles, getPopularArticles } from '@/lib/articles';
import { getBanners } from '@/lib/banners';

// ISR: 60초 캐시 후 자동 갱신
export const revalidate = 60;
export const runtime = 'edge';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    return {
      title: '기사를 찾을 수 없습니다',
    };
  }

  return {
    title: article.title,
    description: article.summary,
    authors: [{ name: article.author }],
    openGraph: {
      type: 'article',
      url: `https://drnews.co.kr/article/${id}`,
      title: article.title,
      description: article.summary,
      publishedTime: article.date,
      modifiedTime: article.modifiedDate || article.date,
      authors: [article.author],
      section: article.category,
      tags: article.tags || [article.category],
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: [article.image],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { id } = await params;
  // cache()로 generateMetadata와 중복 호출 제거됨
  const [article, allBanners, latestArticles, popularArticles] = await Promise.all([
    getArticleById(id),
    getBanners(),
    getArticles(),
    getPopularArticles(5)
  ]);

  // 사이드바 배너 (통합 - positions 필터 없이 전체 사용)
  const sidebarBanners = allBanners.filter(
    (b) => b.type === 'sidebar' && b.isActive
  );

  if (!article) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">기사를 찾을 수 없습니다</h2>
          <Link href="/" className="text-sky-600 hover:text-sky-700 font-medium">
            홈으로 돌아가기
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const relatedArticles = await getRelatedArticles(id, article.category, 3);

  // JSON-LD 구조화 데이터
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    image: article.image,
    datePublished: article.date,
    dateModified: article.modifiedDate || article.date,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dr.News',
      logo: {
        '@type': 'ImageObject',
        url: 'https://drnews.co.kr/logo.png',
      },
    },
    description: article.summary,
    articleSection: article.category,
    articleBody: article.content,
    url: `https://drnews.co.kr/article/${id}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://drnews.co.kr/article/${id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <ViewTracker articleId={id} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 뒤로가기 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-navy mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
        {/* 기사 */}
        <article className="flex-1 max-w-4xl">
          <header className="mb-8">
            <span className="inline-block px-3 py-1 bg-navy text-white text-sm font-medium rounded mb-4">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
              <span className="font-medium">{article.author}</span>
              <span>|</span>
              <time>{article.date}</time>
            </div>

            {/* 대표 이미지 */}
            {article.image && (
              <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            )}
          </header>

          {/* 기사 요약 */}
          <div className="bg-gray-50 border-l-4 border-sky-600 p-4 mb-8 rounded-r-lg">
            <p className="text-gray-700 font-medium">{article.summary}</p>
          </div>

          {/* 기사 본문 */}
          <div className="max-w-none mb-12">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-[18px] text-gray-800 leading-[1.9] mb-6">
                {paragraph}
              </p>
            ))}
          </div>

          <ShareButtons
            title={article.title}
            summary={article.summary}
            url={`https://drnews.co.kr/article/${id}`}
          />
        </article>

        {/* 사이드바 - PC에서만 표시 */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-4">
            <LatestNews articles={latestArticles} currentArticleId={parseInt(id)} />
            <PopularNews articles={popularArticles} />
            <SidebarAd banners={sidebarBanners} sticky={false} showInquiry={true} />
          </div>
        </aside>
        </div>

        {/* 관련 기사 */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-navy mb-6">관련 기사</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <NewsCard key={relatedArticle.id} article={relatedArticle} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
