'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// HERO 우측 카테고리 카드 하단 광고 슬롯 (다중 배너 롤링 + 트래킹)
export default function HeroAdSlot({ banners = [], rolling = true, interval = 5 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const trackedImpressionsRef = useRef(new Set());

  const trackBanner = (bannerId, type) => {
    if (!bannerId) return;
    fetch(`/api/banners/${bannerId}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    }).catch(() => {});
  };

  // 자동 롤링 (rolling ON + 2개 이상)
  useEffect(() => {
    if (!rolling || banners.length <= 1) return;
    const ms = Math.max(1, interval) * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, ms);
    return () => clearInterval(timer);
  }, [rolling, interval, banners.length]);

  // 배너 수 변동 시 인덱스 범위 보정
  useEffect(() => {
    setCurrentIndex((prev) => (prev < banners.length ? prev : 0));
  }, [banners.length]);

  const current = rolling ? banners[currentIndex] : banners[0];

  useEffect(() => {
    if (!current?.id || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (trackedImpressionsRef.current.has(current.id)) return;
        trackedImpressionsRef.current.add(current.id);
        trackBanner(current.id, 'impression');
      },
      { threshold: 0.5 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [current?.id]);

  if (!banners || banners.length === 0) return null;
  if (!current || !current.image) return null;

  return (
    <div ref={containerRef} className="relative flex-shrink-0 border-t border-gray-200">
      <a
        href={current.link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackBanner(current.id, 'click')}
        className="block relative w-full h-[72px] overflow-hidden hover:opacity-90 transition-opacity"
      >
        <Image
          src={current.image}
          alt={current.title || '광고'}
          fill
          quality={95}
          sizes="(max-width: 1024px) 100vw, 288px"
          className="object-cover"
          unoptimized={current.image?.endsWith('.gif')}
        />
        <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded">AD</span>
      </a>

      {/* 인디케이터 (롤링 ON + 2개 이상) */}
      {rolling && banners.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/60'}`}
              aria-label={`광고 ${idx + 1}로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
