'use client';

import Image from 'next/image';

const SidebarAd = ({ banners = [] }) => {
  if (banners.length === 0) return null;

  return (
    <div className="sticky top-24">
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
        <span className="text-sm font-semibold text-gray-500">광고</span>
      </div>

      {/* 가로형 배너 리스트 */}
      <div className="space-y-4">
        {banners.map((banner) => (
          <a
            key={banner.id}
            href={banner.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100"
          >
            {/* 가로로 긴 이미지 */}
            <div className="relative">
              <div className="relative w-full h-24">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  AD
                </span>
              </div>
            </div>

            {/* 텍스트 콘텐츠 */}
            <div className="p-3">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                {banner.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-1">
                {banner.description}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* 광고 문의 */}
      <div className="mt-4 bg-gradient-to-br from-sky-50 to-blue-100 rounded-lg p-4 border border-sky-200">
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
