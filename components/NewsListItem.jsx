'use client';

import Link from 'next/link';

const NewsListItem = ({ article }) => {
  if (!article) return null;

  return (
    <Link
      href={`/article/${article.id}`}
      className="flex items-center gap-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors group"
    >
      {/* 카테고리 뱃지 */}
      <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded flex-shrink-0">
        {article.category}
      </span>

      {/* 제목 */}
      <h4 className="text-sm font-medium text-gray-800 group-hover:text-sky-600 transition-colors line-clamp-1 flex-1">
        {article.title}
      </h4>

      {/* 날짜 */}
      <span className="text-xs text-gray-400 flex-shrink-0">
        {article.date.slice(5)}
      </span>
    </Link>
  );
};

const NewsList = ({ articles, title }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {title && (
        <h3 className="text-lg font-bold text-gray-900 px-4 pt-4 pb-2 border-b border-gray-100">
          {title}
        </h3>
      )}
      <div className="px-4">
        {articles.map((article) => (
          <NewsListItem key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export { NewsListItem, NewsList };
export default NewsList;
