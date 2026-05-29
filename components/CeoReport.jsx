'use client';

import Image from 'next/image';
import Link from 'next/link';

// HTML 태그 제거 (미리보기용)
const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

const CeoReport = ({ report }) => {
  if (!report) return null;

  return (
    <div className="bg-white sm:border sm:border-gray-200 overflow-hidden">
      {/* 타이틀 헤더 (상단 실선 + 검정 텍스트) */}
      <div className="border-t-2 border-navy px-5 py-4">
        <h2 className="text-2xl font-extrabold text-navy tracking-tight">
          CEO 리포트
        </h2>
      </div>

      {/* 콘텐츠 영역 */}
      <Link href={`/ceo-report/${report.id}`} className="block">
        <div className="p-5">
          {/* 상단: 카테고리 + 날짜 */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-1">
              {report.category}
            </span>
            <span className="text-xs text-gray-400">
              {report.date}
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
          <div className="relative pl-4 border-l-4 border-brand-400 bg-gray-50 py-3 pr-4 mb-4">
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {stripHtml(report.content)}
            </p>
          </div>

          {/* 저자 정보 */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200">
              {report.authorImage ? (
                <Image
                  src={report.authorImage}
                  alt={`${report.author} ${report.authorTitle} 프로필 사진`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-lg font-bold">
                  {report.author?.charAt(0) || 'C'}
                </div>
              )}
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
