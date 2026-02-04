'use client';

import Image from 'next/image';
import Link from 'next/link';

const SubHeadline = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/article/${article.id}`}
          className="flex gap-4 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          {/* 좌측 썸네일 */}
          <div className="relative w-32 h-24 md:w-40 md:h-28 flex-shrink-0">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>

          {/* 우측 텍스트 */}
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <span className="text-xs font-medium text-sky-600 mb-1">
              {article.category}
            </span>
            <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 mb-2 leading-tight">
              {article.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 hidden md:block">
              {article.summary}
            </p>
            <span className="text-xs text-gray-400 mt-auto pt-1">
              {article.date}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SubHeadline;
