'use client';

import Link from 'next/link';
import { useRef } from 'react';

const HeadlineNews = ({ articles, popularArticles }) => {
  const scrollRef = useRef(null);

  if (!articles || articles.length === 0) return null;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 좌측: 헤드라인 뉴스 슬라이더 (3/4) */}
        <div className="lg:col-span-3 relative">
          {/* 스크롤 버튼 */}
          <button
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 스크롤 컨테이너 */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {/* 뉴스 카드 3개 */}
            {articles.slice(0, 3).map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="flex-shrink-0 w-[300px] group relative overflow-hidden rounded-xl shadow-lg block"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="relative w-full h-[280px]">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block px-2 py-0.5 bg-sky-600 text-white text-xs font-medium rounded mb-2">
                    {article.category}
                  </span>
                  <h2 className="text-lg font-bold text-white mb-1 leading-tight group-hover:text-sky-300 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-300 text-xs line-clamp-2">
                    {article.summary}
                  </p>
                </div>
              </Link>
            ))}

            {/* 광고 슬롯 */}
            <div
              className="flex-shrink-0 w-[300px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-lg flex items-center justify-center h-[280px] border-2 border-dashed border-gray-300"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="text-center p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">ADVERTISEMENT</div>
                <div className="text-gray-500 text-lg font-semibold">광고 지면</div>
                <div className="text-gray-400 text-xs mt-1">문의: ad@drnews.kr</div>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 많이 조회된 뉴스 (1/4) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full">
            <h3 className="text-lg font-bold text-[#0f172a] mb-4 pb-2 border-b border-gray-200">
              많이 조회된 뉴스
            </h3>
            <div className="space-y-3">
              {popularArticles?.slice(0, 5).map((article, index) => (
                <Link
                  key={article.id}
                  href={`/article/${article.id}`}
                  className="flex items-start gap-3 group"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-[#0f172a] text-white text-sm font-bold rounded flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-sky-600 transition-colors">
                      {article.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeadlineNews;
