'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HeadlineSlider = ({ articles = [], banners = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 슬라이드 아이템 구성: 헤드라인 기사들 + 광고 배너
  const slides = [];

  articles.forEach((art) => {
    slides.push({
      type: 'article',
      id: art.id,
      title: art.title,
      summary: art.summary,
      image: art.image,
      category: art.category,
      author: art.author,
      date: art.date,
      link: `/article/${art.id}`,
    });
  });

  banners.forEach((banner) => {
    slides.push({
      type: 'ad',
      id: `ad-${banner.id}`,
      title: banner.title,
      summary: banner.description,
      image: banner.image,
      link: banner.link,
    });
  });

  // 자동 슬라이드
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (index) => setCurrentIndex(index);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);

  if (slides.length === 0) return null;

  const current = slides[currentIndex];

  return (
    <div className="relative w-full h-[300px] md:h-[380px] overflow-hidden group">
      {/* 슬라이드 이미지 */}
      <div className="relative w-full h-full">
        {current.type === 'article' ? (
          <Link href={current.link} className="block w-full h-full">
            <Image
              src={current.image}
              alt={current.title}
              fill
              priority
              className="object-cover"
            />
          </Link>
        ) : (
          <a href={current.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <Image
              src={current.image}
              alt={current.title}
              fill
              priority
              className="object-cover"
            />
          </a>
        )}
      </div>

      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

      {/* 콘텐츠 */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
        {current.type === 'ad' && (
          <span className="inline-block px-2 py-0.5 bg-yellow-500 text-black text-xs font-semibold mb-3">
            광고
          </span>
        )}
        {current.type === 'article' ? (
          <Link href={current.link}>
            <h2 className="font-headline text-xl md:text-3xl font-bold text-white mb-2 leading-tight hover:underline">
              {current.title}
            </h2>
          </Link>
        ) : (
          <a href={current.link} target="_blank" rel="noopener noreferrer">
            <h2 className="font-headline text-xl md:text-3xl font-bold text-white mb-2 leading-tight hover:underline">
              {current.title}
            </h2>
          </a>
        )}
        <p className="text-gray-200 text-sm md:text-base mb-3 line-clamp-2 max-w-3xl">
          {current.summary}
        </p>
        {current.type === 'article' && (
          <div className="flex items-center gap-3 text-gray-300 text-xs">
            <span>{current.author}</span>
            <span className="text-gray-500">|</span>
            <time>{current.date}</time>
          </div>
        )}
      </div>

      {/* 좌우 화살표 */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* 인디케이터 */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 right-5 flex gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`w-2 h-2 transition-colors ${
                idx === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeadlineSlider;
