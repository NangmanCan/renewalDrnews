import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getArticleById, getRelatedArticles } from '@/data/articles';
import NewsCard from '@/components/NewsCard';

export async function generateMetadata({ params }) {
  const article = getArticleById(params.id);
  if (!article) return { title: '기사를 찾을 수 없습니다' };

  return {
    title: `${article.title} - Dr.News`,
    description: article.summary,
  };
}

export default function ArticleDetail({ params }) {
  const article = getArticleById(params.id);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(params.id, article.category, 3);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-sky-600 mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로 돌아가기
      </Link>

      {/* 기사 헤더 */}
      <article>
        <header className="mb-8">
          <span className="inline-block px-3 py-1 bg-sky-600 text-white text-sm font-medium rounded-full mb-4">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4 leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
            <span>{article.author}</span>
            <span>|</span>
            <span>{article.date}</span>
          </div>
          <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </header>

        {/* 기사 요약 */}
        <div className="bg-gray-100 rounded-xl p-6 mb-8">
          <p className="text-gray-700 text-lg leading-relaxed">{article.summary}</p>
        </div>

        {/* 기사 본문 */}
        <div className="prose prose-lg max-w-none mb-12">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        {/* 공유 버튼 */}
        <div className="flex items-center gap-4 py-6 border-t border-gray-200">
          <span className="text-gray-600 font-medium">공유하기</span>
          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
            </svg>
          </button>
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </article>

      {/* 관련 기사 */}
      {relatedArticles.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-[#0f172a] mb-6">관련 기사</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {relatedArticles.map((relatedArticle) => (
              <NewsCard key={relatedArticle.id} article={relatedArticle} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
