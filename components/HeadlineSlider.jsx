'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const HeadlineSlider = ({ article, banners = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 슬라이드 아이템 구성: 헤드라인 기사 + 광고 배너
  const slides = [];

  if (article) {
    slides.push({
      type: 'article',
      id: article.id,
      title: article.title,
      summary: article.summary,
      image: article.image,
      category: article.category,
      author: article.author,
      date: article.date,
      link: `/article/${article.id}`,
    });
  }

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
    <div className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl group">
      {/* 슬라이드 이미지 */}
      <div className="relative w-full h-full">
        {current.type === 'article' ? (
          <Link href={current.link} className="block w-full h-full">
            <Image
              src={current.image}
              alt={current.title}
              fill
              priority
              className="object-cover transition-transform duration-700"
            />
          </Link>
        ) : (
          <a href={current.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <Image
              src={current.image}
              alt={current.title}
              fill
              priority
              className="object-cover transition-transform duration-700"
            />
          </a>
        )}
      </div>

      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* 콘텐츠 */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="flex items-center gap-2 mb-4">
          <span
            className={`inline-block px-3 py-1 text-sm font-semibold rounded ${
              current.type === 'ad' ? 'bg-yellow-500 text-black' : 'bg-sky-600 text-white'
            }`}
          >
            {current.type === 'ad' ? '광고' : current.category}
          </span>
        </div>
        {current.type === 'article' ? (
          <Link href={current.link}>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight hover:text-sky-300 transition-colors">
              {current.title}
            </h2>
          </Link>
        ) : (
          <a href={current.link} target="_blank" rel="noopener noreferrer">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight hover:text-sky-300 transition-colors">
              {current.title}
            </h2>
          </a>
        )}
        <p className="text-gray-200 text-base md:text-lg mb-4 line-clamp-2 max-w-3xl">
          {current.summary}
        </p>
        {current.type === 'article' && (
          <div className="flex items-center gap-4 text-gray-300 text-sm">
            <span>{current.author}</span>
            <span>|</span>
            <time>{current.date}</time>
          </div>
        )}
      </div>

      {/* 좌우 화살표 */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* 인디케이터 */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-6 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
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
