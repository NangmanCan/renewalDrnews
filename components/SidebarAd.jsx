'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const SidebarAd = ({ banners = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 자동 롤링 (10초마다)
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const current = banners[currentIndex];

  return (
    <div className="sticky top-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-navy to-slate-700 px-4 py-2">
          <span className="text-white text-sm font-medium">광고</span>
        </div>

        {/* 광고 이미지 */}
        <a
          href={current.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={current.image}
              alt={current.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
            {/* 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* 텍스트 콘텐츠 */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                {current.title}
              </h3>
              <p className="text-gray-200 text-sm line-clamp-2">
                {current.description}
              </p>
            </div>
          </div>
        </a>

        {/* 인디케이터 */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-2 py-3 bg-gray-50">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex
                    ? 'bg-sky-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 추가 작은 배너 공간 */}
      <div className="mt-4 bg-gradient-to-br from-sky-50 to-blue-100 rounded-xl p-4 border border-sky-200">
        <div className="text-center">
          <span className="inline-block px-2 py-0.5 bg-sky-500 text-white text-xs rounded mb-2">
            AD
          </span>
          <p className="text-navy font-medium text-sm">
            Dr.News와 함께하는
          </p>
          <p className="text-sky-600 font-bold">
            광고 문의
          </p>
          <p className="text-gray-500 text-xs mt-2">
            ads@drnews.co.kr
          </p>
        </div>
      </div>
    </div>
  );
};

export default SidebarAd;
