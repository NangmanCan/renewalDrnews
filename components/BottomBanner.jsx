'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const BottomBanner = ({ banners = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 자동 롤링
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const current = banners[currentIndex];

  return (
    <div className="bg-gradient-to-r from-navy to-slate-800 rounded-xl overflow-hidden shadow-lg">
      <a
        href={current.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center p-4 gap-4 hover:bg-white/5 transition-colors"
      >
        {/* 썸네일 */}
        <div className="w-20 h-20 md:w-24 md:h-24 relative rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={current.image}
            alt={current.title}
            fill
            className="object-cover"
            unoptimized={current.image?.endsWith('.gif')}
          />
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <span className="inline-block px-2 py-0.5 bg-yellow-500 text-black text-xs font-semibold rounded mb-2">
            AD
          </span>
          <h3 className="text-white font-bold text-lg md:text-xl mb-1 truncate">
            {current.title}
          </h3>
          <p className="text-gray-300 text-sm truncate">{current.description}</p>
        </div>

        {/* 인디케이터 */}
        {banners.length > 1 && (
          <div className="flex flex-col gap-1">
            {banners.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-sky-400' : 'bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}

        {/* 화살표 아이콘 */}
        <svg
          className="w-6 h-6 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </a>
    </div>
  );
};

export default BottomBanner;
