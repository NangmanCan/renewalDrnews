'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

const NewsTicker = ({ articles = [] }) => {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(30);

  // 기사 수에 따라 애니메이션 속도 조절
  // PC: 1.2배, 모바일: 1.5배 빠르게 (CSS에서 처리)
  useEffect(() => {
    const baseSpeed = 25; // 기본 25초 (PC 1.2배 기준: 30/1.2)
    const perItemSpeed = 4; // 기사당 4초 추가
    setAnimationDuration(baseSpeed + articles.length * perItemSpeed);
  }, [articles.length]);

  if (articles.length === 0) return null;

  // 무한 스크롤을 위해 기사 복제
  const duplicatedArticles = [...articles, ...articles];

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="marquee"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center h-8 md:h-10 bg-slate-800 overflow-hidden">
          {/* 라벨 */}
          <div className="flex-shrink-0 px-2 md:px-3 h-full flex items-center bg-sky-600">
            <span className="text-white text-[10px] md:text-xs font-bold italic whitespace-nowrap">
              DR.Focus
            </span>
          </div>

          {/* 티커 영역 */}
          <div 
            ref={containerRef}
            className="flex-1 overflow-hidden relative"
          >
            <div 
              className="flex items-center gap-8 md:gap-12 whitespace-nowrap ticker-scroll"
              style={{
                '--duration': `${animationDuration}s`,
                animationDuration: `${animationDuration}s`,
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              {duplicatedArticles.map((article, index) => (
                <Link
                  key={`${article.id}-${index}`}
                  href={`/article/${article.id}`}
                  className="inline-flex items-center gap-2 text-gray-200 hover:text-white transition-colors"
                >
                  {article.subcategory && (
                    <span className="text-sky-400 text-[10px] md:text-xs font-medium">
                      [{article.subcategory}]
                    </span>
                  )}
                  <span className="text-xs md:text-sm">
                    {article.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        .ticker-scroll {
          animation: ticker linear infinite;
        }
        
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        /* 모바일: 더 빠르게 (duration 0.6배) */
        @media (max-width: 1023px) {
          .ticker-scroll {
            animation-duration: calc(var(--duration) * 0.6) !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-scroll {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;
