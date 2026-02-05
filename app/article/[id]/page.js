import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsCard from '@/components/NewsCard';
import SidebarAd from '@/components/SidebarAd';
import { articles } from '@/data/articles';
import { initialBanners } from '@/data/banners';

export async function generateStaticParams() {
  return articles.map((article) => ({
    id: article.id.toString(),
  }));
}

export async function generateMetadata({ params }) {
  const article = articles.find((a) => a.id === parseInt(params.id));

  if (!article) {
    return {
      title: '기사를 찾을 수 없습니다 - Dr.News',
    };
  }

  return {
    title: `${article.title} - Dr.News`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      images: [article.image],
    },
  };
}

export default function ArticlePage({ params }) {
  const article = articles.find((a) => a.id === parseInt(params.id));

  // 사이드바 배너 가져오기
  const sidebarBanners = initialBanners.filter(
    (b) => b.type === 'sidebar' && b.isActive && (!b.positions || b.positions.sidebarPC)
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

  const relatedArticles = articles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  return (
    <>
      <Header />
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
            <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-lg">
              <Image
                src={article.image}
                alt={article.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          </header>

          {/* 기사 요약 */}
          <div className="bg-gray-50 border-l-4 border-sky-600 p-4 mb-8 rounded-r-lg">
            <p className="text-gray-700 font-medium">{article.summary}</p>
          </div>

          {/* 기사 본문 */}
          <div className="prose prose-lg max-w-none mb-12">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-gray-800 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* 공유 버튼 */}
          <div className="flex items-center gap-4 py-6 border-t border-b border-gray-200">
            <span className="text-gray-600 font-medium">공유하기</span>
            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
            </button>
            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>
        </article>

        {/* 사이드바 - PC에서만 표시 */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <SidebarAd banners={sidebarBanners} sticky={true} showInquiry={true} />
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
