'use client';

import Image from 'next/image';
import Link from 'next/link';

const CeoReport = ({ report }) => {
  if (!report) return null;

  return (
    <div className="bg-white sm:border sm:border-gray-200 overflow-hidden">
      {/* 타이틀 헤더 */}
      <div className="bg-navy px-5 py-3">
        <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          CEO 리포트
        </h2>
      </div>

      {/* 콘텐츠 영역 */}
      <Link href={`/ceo-report/${report.id}`} className="block">
        <div className="p-5">
          {/* 상단: 카테고리 + 날짜 */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1">
              {report.category}
            </span>
            <span className="text-xs text-gray-400">
              {report.date} · 제{report.weekNumber}주차
            </span>
          </div>

          {/* 제목 + 부제목 */}
          <h3 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-1 leading-[1.4] hover:underline transition-colors">
            {report.title}
          </h3>
          <p className="text-[14px] text-gray-500 mb-4 italic">
            &ldquo;{report.subtitle}&rdquo;
          </p>

          {/* 본문 미리보기 - 인용문 스타일 */}
          <div className="relative pl-4 border-l-4 border-amber-400 bg-gray-50 py-3 pr-4 mb-4">
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {report.content}
            </p>
          </div>

          {/* 저자 정보 */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200">
              <Image
                src={report.authorImage}
                alt={report.author}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{report.author}</p>
              <p className="text-xs text-gray-500">{report.authorTitle}</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs text-navy hover:underline font-medium flex items-center gap-1">
                전문 읽기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CeoReport;
