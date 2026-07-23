'use client';

import Image from 'next/image';
import Link from 'next/link';

const OpinionCard = ({ opinion }) => {
  if (!opinion) return null;

  // 닥터인터뷰 항목은 전용 상세 경로로 연결
  const isInterview = opinion.type === 'doctor_interview';
  const href = isInterview ? `/doctor-interview/${opinion.id}` : `/opinion/${opinion.id}`;

  return (
    <Link
      href={href}
      className="block p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-start gap-3">
        {/* 저자 이미지 */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200">
          {opinion.authorImage ? (
            <Image
              src={opinion.authorImage}
              alt={`${opinion.author} ${opinion.authorTitle} 프로필 사진`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-lg font-bold">
              {opinion.author?.charAt(0) || '?'}
            </div>
          )}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isInterview && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-600 text-white">
                닥터인터뷰
              </span>
            )}
            <span className="text-xs text-gray-400">{opinion.date}</span>
          </div>
          <h4 className="text-[15px] font-bold text-gray-900 line-clamp-1 mb-1 hover:underline">
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

const Opinion = ({ opinions, fillHeight = false }) => {
  if (!opinions || opinions.length === 0) return null;

  // fillHeight: 서브헤드라인(~216px) + 닥터포커스(40px) + 띠배너(~96px) + 간격(48px) ≈ 400px
  return (
    <div className={`bg-white sm:border sm:border-gray-200 overflow-hidden ${fillHeight ? 'lg:h-[400px] flex flex-col' : ''}`}>
      {/* 타이틀 헤더 */}
      <div className="border-t-2 border-navy px-4 py-3">
        <h2 className="text-base font-extrabold text-navy tracking-tight">
          오피니언
        </h2>
      </div>

      {/* 오피니언 목록 */}
      <div className={fillHeight ? 'flex-1' : ''}>
        {opinions.map((opinion) => (
          <OpinionCard key={`${opinion.type || 'opinion'}-${opinion.id}`} opinion={opinion} />
        ))}
      </div>

      {/* 더보기 */}
      <div className="px-4 py-3 border-t border-gray-100">
        <Link
          href="/category/opinion"
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
