'use client';

import Image from 'next/image';

const NativeAd = ({ banner }) => {
  if (!banner) return null;

  return (
    <a
      href={banner.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-50 overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors"
    >
      <div className="flex gap-4 p-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            className="object-cover"
            unoptimized={banner.image?.endsWith('.gif')}
          />
        </div>
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-semibold mb-1 w-fit">
            Sponsored
          </span>
          <p className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
            {banner.title}
          </p>
          <p className="text-xs text-gray-500 line-clamp-1">
            {banner.description}
          </p>
        </div>
      </div>
    </a>
  );
};

export default NativeAd;
