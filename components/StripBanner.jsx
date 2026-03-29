'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const StripBanner = ({ banners = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const trackedImpressionsRef = useRef(new Set());

  const trackBanner = async (bannerId, type) => {
    if (!bannerId) return;
    fetch(`/api/banners/${bannerId}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    }).catch(() => {});
  };

  // 자동 롤링 (여러 배너가 있을 경우)
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const current = banners[currentIndex];

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

  if (banners.length === 0) return null;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="max-w-7xl mx-auto relative">
        <a
          href={current.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackBanner(current.id, 'click')}
          className="block w-full"
        >
          <div className="relative w-full overflow-hidden">
            {current.image && (
              <Image
                src={current.image}
                alt={current.title || '광고'}
                width={1200}
                height={90}
                className="w-full h-auto"
                priority
                unoptimized={current.image?.endsWith('.gif')}
              />
            )}
          </div>
        </a>

        {/* 인디케이터 (배너 2개 이상일 때) */}
        {banners.length > 1 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`배너 ${idx + 1}로 이동`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StripBanner;
