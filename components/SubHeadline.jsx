'use client';

import Image from 'next/image';
import Link from 'next/link';

const SubHeadline = ({ article }) => {
  if (!article) return null;

  return (
    <Link
      href={`/article/${article.id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5">
        {/* 썸네일 */}
        <div className="relative w-full sm:w-64 aspect-video sm:aspect-[16/11] flex-shrink-0">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        {/* 텍스트 */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs font-medium text-sky-600 mb-2">
            {article.category}
          </span>
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-3 leading-tight">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed flex-1">
            {article.content}
          </p>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">{article.author}</span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-gray-400">{article.date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SubHeadline;
