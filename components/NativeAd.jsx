'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const NativeAd = ({ banner, banners }) => {
  // banners 배열이 있으면 랜덤 선택, 없으면 단일 banner 사용
  const [selectedBanner, setSelectedBanner] = useState(banner);

  useEffect(() => {
    if (banners && banners.length > 0) {
      const randomIndex = Math.floor(Math.random() * banners.length);
      setSelectedBanner(banners[randomIndex]);
    }
  }, [banners]);

  if (!selectedBanner) return null;

  return (
    <a
      href={selectedBanner.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden border-b border-gray-200 hover:opacity-90 transition-opacity my-2"
    >
      <div className="relative w-full h-20 bg-gray-100">
        {selectedBanner.image && (
          <Image
            src={selectedBanner.image}
            alt={selectedBanner.title || 'AD'}
            fill
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
