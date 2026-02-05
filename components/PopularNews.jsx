'use client';

import Link from 'next/link';

const PopularNews = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-sm font-bold text-gray-900 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
        </svg>
        많이 본 뉴스
      </h3>
      <div className="px-4 py-2">
        {articles.map((article, index) => (
          <Link
            key={article.id}
            href={`/article/${article.id}`}
            className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors group"
          >
            {/* 순위 번호 */}
            <span className={`text-sm font-bold flex-shrink-0 w-5 text-center ${
              index < 3 ? 'text-red-500' : 'text-gray-400'
            }`}>
              {index + 1}
            </span>

            {/* 기사 제목 */}
            <h4 className="text-xs font-medium text-gray-800 group-hover:text-sky-600 transition-colors line-clamp-1 flex-1">
              {article.title}
            </h4>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularNews;
