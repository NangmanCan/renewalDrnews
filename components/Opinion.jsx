'use client';

import Image from 'next/image';
import Link from 'next/link';

const OpinionCard = ({ opinion }) => {
  if (!opinion) return null;

  return (
    <Link
      href={`/opinion/${opinion.id}`}
      className="block p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-start gap-3">
        {/* 저자 이미지 */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200">
          <Image
            src={opinion.authorImage}
            alt={opinion.author}
            fill
            className="object-cover"
          />
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">{opinion.date}</span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1 hover:underline">
            {opinion.title}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-1 mb-1">
            {opinion.summary}
          </p>
          <p className="text-xs text-gray-400">
            {opinion.author} · {opinion.authorTitle}
          </p>
        </div>
      </div>
    </Link>
  );
};

const Opinion = ({ opinions }) => {
  if (!opinions || opinions.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      {/* 타이틀 헤더 */}
      <div className="bg-navy px-4 py-3">
        <h2 className="font-headline text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          오피니언
        </h2>
      </div>

      {/* 오피니언 목록 */}
      <div>
        {opinions.map((opinion) => (
          <OpinionCard key={opinion.id} opinion={opinion} />
        ))}
      </div>

      {/* 더보기 */}
      <div className="px-4 py-3 border-t border-gray-100">
        <Link
          href="/?category=오피니언"
          className="text-xs text-navy hover:underline font-medium flex items-center justify-center gap-1"
        >
          오피니언 더보기
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default Opinion;
