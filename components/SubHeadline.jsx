'use client';

import Image from 'next/image';
import Link from 'next/link';

const SubHeadline = ({ article }) => {
  if (!article) return null;

  return (
    <Link
      href={`/article/${article.id}`}
      className="block bg-white sm:border sm:border-gray-200 hover:bg-gray-50 sm:hover:border-gray-300 transition-colors overflow-hidden"
    >
      {/* 모바일: 이미지 풀와이드 */}
      <div className="sm:hidden">
        <div className="relative w-full aspect-video">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-[18px] font-bold text-gray-900 line-clamp-2 mb-2 leading-[1.4]">
            {article.title}
          </h3>
          <p className="text-[14px] text-gray-600 line-clamp-2 leading-[1.6]">
            {article.content}
          </p>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">{article.author}</span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-gray-400">{article.date}</span>
          </div>
        </div>
      </div>

      {/* 데스크탑: 기존 레이아웃 */}
      <div className="hidden sm:flex flex-row gap-5 p-5">
        <div className="relative w-64 aspect-[16/11] flex-shrink-0">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="text-[22px] font-bold text-gray-900 line-clamp-2 mb-2 leading-[1.4] hover:underline">
            {article.title}
          </h3>
          <p className="text-[15px] text-gray-600 line-clamp-3 leading-[1.7] flex-1">
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
