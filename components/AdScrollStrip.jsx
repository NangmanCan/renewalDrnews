'use client';

import { useRef } from 'react';
import Image from 'next/image';

const AdScrollStrip = ({ banners = [] }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction * 300,
      behavior: 'smooth',
    });
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative group">
      {/* 좌 스크롤 버튼 */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/90 hover:bg-white shadow-md rounded-full border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 우 스크롤 버튼 */}
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/90 hover:bg-white shadow-md rounded-full border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 가로 스크롤 영역 */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {banners.map((banner) => (
          <a
            key={banner.id}
            href={banner.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-72 bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="relative h-36">
              <Image src={banner.image} alt={banner.title} fill sizes="288px" className="object-cover" />
              <span className="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                광고
              </span>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-navy text-sm line-clamp-1">{banner.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{banner.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default AdScrollStrip;
