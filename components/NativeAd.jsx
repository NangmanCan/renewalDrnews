'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

const NativeAd = ({ banner, banners }) => {
  // banners 배열이 있으면 랜덤 선택, 없으면 단일 banner 사용
  const [selectedBanner, setSelectedBanner] = useState(banner);
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

  useEffect(() => {
    if (banners && banners.length > 0) {
      const randomIndex = Math.floor(Math.random() * banners.length);
      setSelectedBanner(banners[randomIndex]);
    }
  }, [banners]);

  useEffect(() => {
    if (!selectedBanner?.id || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (trackedImpressionsRef.current.has(selectedBanner.id)) return;
        trackedImpressionsRef.current.add(selectedBanner.id);
        trackBanner(selectedBanner.id, 'impression');
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [selectedBanner?.id]);

  if (!selectedBanner) return null;

  return (
    <a
      ref={containerRef}
      href={selectedBanner.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackBanner(selectedBanner.id, 'click')}
      className="block overflow-hidden border-b border-gray-200 hover:opacity-90 transition-opacity my-2"
    >
      <div className="relative w-full h-20 bg-gray-100">
        {selectedBanner.image && (
          <Image
            src={selectedBanner.image}
            alt={selectedBanner.title || 'AD'}
            fill
            quality={95}
            sizes="(max-width: 1024px) 100vw, 288px"
            className="object-contain"
            unoptimized={selectedBanner.image?.endsWith('.gif')}
          />
        )}
        <span className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
          AD
        </span>
      </div>
    </a>
  );
};

export default NativeAd;
