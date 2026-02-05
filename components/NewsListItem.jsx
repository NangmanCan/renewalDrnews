'use client';

import Image from 'next/image';
import Link from 'next/link';

const NewsListItem = ({ article }) => {
  if (!article) return null;

  return (
    <Link
      href={`/article/${article.id}`}
      className="block py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group"
    >
      {/* 상단: 카테고리 + 타이틀 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
          {article.category}
        </span>
        <span className="text-xs text-gray-400">
          {article.date}
        </span>
      </div>
      <h4 className="text-base font-bold text-gray-900 group-hover:text-sky-600 transition-colors mb-3 leading-snug">
        {article.title}
      </h4>

      {/* 하단: 사진(좌) + 텍스트(우) */}
      <div className="flex gap-3 sm:gap-4">
        <div className="relative w-24 h-16 sm:w-32 sm:h-20 flex-shrink-0">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed flex-1 line-clamp-3 sm:line-clamp-none">
          {article.content}
        </p>
      </div>
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
