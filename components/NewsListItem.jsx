'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const NewsListItem = ({ article, compact = false }) => {
  const [imgError, setImgError] = useState(false);
  
  if (!article) return null;

  const isOpinion = article.category === '칼럼' || article.category === '기고' || article.authorTitle || article.author_title;
  const href = isOpinion ? `/opinion/${article.id}` : `/article/${article.id}`;
  const thumbnail = article.image || article.authorImage || article.author_image;
  const isBase64 = thumbnail?.startsWith('data:');

  // 모바일 텍스트 전용 모드 (compact) - 시사저널 스타일
  if (compact) {
    const summary = article.content || article.summary || '';
    return (
      <Link
        href={href}
        className="block py-3.5 border-b border-gray-200 hover:bg-gray-50 transition-colors group min-h-[44px]"
      >
        <h4 className="text-[16px] font-bold text-gray-800 leading-[1.5] tracking-[-0.01em] line-clamp-2 mb-0.5">
          {article.title}
        </h4>
        {summary && (
          <p className="text-[13px] text-gray-500 leading-[1.5] line-clamp-1">
            {summary}
          </p>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="block py-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors group"
    >
      <h4 className="text-base font-bold text-gray-900 group-hover:underline transition-colors mb-2 leading-snug">
        {article.title}
      </h4>

      {/* 하단: 사진(좌) + 텍스트(우) */}
      <div className="flex items-start gap-3 sm:gap-4">
        {thumbnail && !imgError && (
          <div className={`relative flex-shrink-0 overflow-hidden bg-gray-100 ${
            isOpinion ? 'w-12 h-12 sm:w-16 sm:h-16 rounded-full' : 'w-24 h-16 sm:w-32 sm:h-20'
          }`}>
            <Image
              src={thumbnail}
              alt={article.title}
              fill
              className="object-cover"
              unoptimized={isBase64}
              onError={() => setImgError(true)}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {isOpinion && (
            <p className="text-xs text-gray-400 mb-1">{article.author} · {article.authorTitle || article.author_title}</p>
          )}
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
            {article.content || article.summary}
          </p>
        </div>
      </div>
    </Link>
  );
};

const NewsList = ({ articles, title }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-white sm:border sm:border-gray-200">
      {title && (
        <h3 className="text-base font-bold text-gray-900 px-4 pt-4 pb-2 border-b border-gray-200">
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
