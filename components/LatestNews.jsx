'use client';

import Link from 'next/link';

const LatestNews = ({ articles, currentArticleId }) => {
  if (!articles || articles.length === 0) return null;

  // 현재 보고 있는 기사 제외
  const filteredArticles = articles
    .filter(article => article.id !== currentArticleId)
    .slice(0, 5);

  if (filteredArticles.length === 0) return null;

  return (
    <div className="bg-white sm:border sm:border-gray-200">
      <h3 className="text-base font-bold text-gray-900 px-4 py-3 border-b-2 border-navy flex items-center gap-2">
        <svg className="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        최신 뉴스
      </h3>
      <div className="px-4 py-2">
        {filteredArticles.map((article, index) => (
          <Link
            key={article.id}
            href={`/article/${article.id}`}
            className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group"
          >
            {/* 번호 */}
            <span className="text-[15px] font-bold flex-shrink-0 w-5 text-center text-gray-400">
              {index + 1}
            </span>

            {/* 기사 제목 */}
            <h4 className="text-[15px] font-bold text-gray-800 group-hover:underline transition-colors line-clamp-1 flex-1">
              {article.title}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LatestNews;
