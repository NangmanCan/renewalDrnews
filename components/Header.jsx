'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { initialBanners } from '@/data/banners';

const Header = () => {
  const pathname = usePathname();
  const categories = ['정책', '학술', '병원', '산업', 'AI', '제약·바이오', '해외뉴스', '오피니언'];

  // GNB 배너 가져오기
  const gnbBanner = initialBanners.find((b) => b.type === 'gnb' && b.isActive);

  // 현재 날짜 포맷
  const today = new Date();
  const dateStr = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* 상단 로고 영역 */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* 왼쪽: 날짜 */}
            <div className="hidden md:flex flex-col items-start min-w-[180px]">
              <span className="text-xs text-gray-500 font-medium tracking-wide">
                {dateStr}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                대한민국 의료 전문 미디어
              </span>
            </div>

            {/* 가운데: 로고 */}
            <Link href="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
              {/* 메인 로고 */}
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  Dr.
                </span>
                <span className="text-3xl md:text-4xl font-black text-sky-600 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  News
                </span>
              </div>
              {/* 서브 타이틀 */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="h-px w-6 bg-gray-300"></span>
                <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
                  Medical Journal
                </span>
                <span className="h-px w-6 bg-gray-300"></span>
              </div>
            </Link>

            {/* 오른쪽: 배너 광고 영역 */}
            <div className="hidden md:flex items-center min-w-[250px] justify-end">
              {gnbBanner ? (
                <a
                  href={gnbBanner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-[234px] h-[60px] rounded overflow-hidden hover:opacity-90 transition-opacity"
                >
                  <Image
                    src={gnbBanner.image}
                    alt={gnbBanner.title}
                    fill
                    className="object-cover"
                    unoptimized={gnbBanner.image?.endsWith('.gif')}
                  />
                </a>
              ) : (
                <div className="w-[234px] h-[60px] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-400">AD 234x60</span>
                </div>
              )}
            </div>

            {/* 모바일: 관리자 버튼 */}
            <Link
              href="/admin"
              className="md:hidden px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-sm font-medium transition-colors"
            >
              관리자
            </Link>
          </div>
        </div>
      </div>

      {/* 하단 카테고리 바 (데스크탑) */}
      <div className="hidden md:block bg-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* 카테고리 메뉴 */}
            <nav className="flex items-center">
              {categories.map((category, index) => (
                <Link
                  key={category}
                  href={category === '오피니언' ? '/?category=오피니언' : `/?category=${encodeURIComponent(category)}`}
                  className={`
                    px-5 py-3.5 text-base font-medium transition-colors relative
                    ${category === '오피니언'
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700'
                    }
                  `}
                >
                  {category}
                  {index < categories.length - 1 && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-slate-600"></span>
                  )}
                </Link>
              ))}
            </nav>

            {/* 관리자 버튼 (데스크탑) */}
            <Link
              href="/admin"
              className="hidden md:block px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-sm font-medium transition-colors"
            >
              관리자
            </Link>
          </div>
        </div>
      </div>

      {/* 모바일 카테고리 (스크롤) */}
      <div className="md:hidden bg-slate-800 overflow-x-auto border-t border-slate-700 scrollbar-hide">
        <nav className="flex items-center px-2">
          {categories.map((category, index) => (
            <Link
              key={category}
              href={category === '오피니언' ? '/?category=오피니언' : `/?category=${encodeURIComponent(category)}`}
              className={`
                flex-shrink-0 px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap relative
                ${category === '오피니언'
                  ? 'text-amber-400'
                  : 'text-gray-300 active:bg-slate-700'
                }
              `}
            >
              {category}
              {index < categories.length - 1 && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-slate-600"></span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
