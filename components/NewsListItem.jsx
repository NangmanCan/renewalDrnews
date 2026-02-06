'use client';

import Image from 'next/image';
import Link from 'next/link';

const NewsListItem = ({ article, compact = false }) => {
  if (!article) return null;

  const isOpinion = article.category === '칼럼' || article.category === '기고' || article.authorTitle || article.author_title;
  const href = isOpinion ? `/opinion/${article.id}` : `/article/${article.id}`;
  const thumbnail = article.image || article.authorImage || article.author_image;

  // 모바일 텍스트 전용 모드 (compact)
  if (compact) {
    return (
      <Link
        href={href}
        className="block py-2.5 border-b border-gray-100 hover:bg-gray-50/50 transition-colors group"
      >
        <h4 className="text-[14px] font-bold text-gray-900 group-hover:underline leading-snug line-clamp-1">
          {article.title}
        </h4>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="block py-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors group"
    >
      {/* 상단: 날짜 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-400">
          {article.date}
        </span>
      </div>
      <h4 className="font-headline text-base font-bold text-gray-900 group-hover:underline transition-colors mb-2 leading-snug">
        {article.title}
      </h4>

      {/* 하단: 사진(좌) + 텍스트(우) */}
      <div className="flex items-start gap-3 sm:gap-4">
        {thumbnail && (
          <div className={`relative flex-shrink-0 overflow-hidden ${
            isOpinion ? 'w-12 h-12 sm:w-16 sm:h-16 rounded-full' : 'w-24 h-16 sm:w-32 sm:h-20'
          }`}>
            <Image
              src={thumbnail}
              alt={article.title}
              fill
              className="object-cover"
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
    <div className="bg-white border border-gray-200">
      {title && (
        <h3 className="font-headline text-base font-bold text-gray-900 px-4 pt-4 pb-2 border-b border-gray-200">
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
