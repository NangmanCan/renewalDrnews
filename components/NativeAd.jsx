'use client';

import Image from 'next/image';

const NativeAd = ({ banner }) => {
  if (!banner) return null;

  return (
    <a
      href={banner.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-sky-100"
    >
      <div className="flex gap-4 p-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            className="object-cover rounded-lg"
            unoptimized={banner.image?.endsWith('.gif')}
          />
        </div>
        <div className="flex flex-col justify-center flex-1 min-w-0">
          <span className="inline-flex items-center gap-1 text-[10px] text-sky-600 font-semibold mb-1 w-fit">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9h2v4h-2V7zm0 5h2v2h-2v-2z"/>
            </svg>
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
