'use client';

import Image from 'next/image';
import Link from 'next/link';

const NewsListItem = ({ article }) => {
  if (!article) return null;

  return (
    <Link
      href={`/article/${article.id}`}
      className="flex gap-3 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors group"
    >
      {/* 좌측 썸네일 (소형) */}
      <div className="relative w-20 h-14 flex-shrink-0">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover rounded"
        />
      </div>

      {/* 우측 텍스트 */}
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-medium text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
            {article.category}
          </span>
          <span className="text-[10px] text-gray-400">
            {article.date.slice(5)}
          </span>
        </div>
        <h4 className="text-sm font-medium text-gray-800 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
          {article.title}
        </h4>
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
