'use client';

import Link from 'next/link';

const PopularNews = ({ articles, matchHeadline = false }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className={`bg-white sm:border sm:border-gray-200 ${matchHeadline ? 'lg:h-[380px] lg:overflow-hidden' : ''}`}>
      <h3 className="text-base font-extrabold text-navy px-4 py-3 border-t-2 border-navy tracking-tight">
        많이 본 뉴스
      </h3>
      <div className={`px-4 ${matchHeadline ? 'py-1' : 'py-2'}`}>
        {articles.map((article, index) => (
          <Link
            key={article.id}
            href={`/article/${article.id}`}
            className={`flex items-center gap-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors group ${matchHeadline ? 'py-[11px]' : 'py-3'}`}
          >
            {/* 순위 번호 */}
            <span className={`text-sm font-bold flex-shrink-0 w-5 text-center ${
              index < 3 ? 'text-red-500' : 'text-gray-400'
            }`}>
              {index + 1}
            </span>

            {/* 기사 제목 */}
            <h4 className="text-sm font-medium text-gray-800 group-hover:underline transition-colors line-clamp-1 flex-1">
              {article.title}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularNews;
