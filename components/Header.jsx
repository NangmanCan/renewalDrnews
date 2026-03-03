'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { initialBanners } from '@/data/banners';

const Header = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
      {/* 상단 로고 영역 */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* 왼쪽: 날짜 */}
            <div className="hidden md:flex flex-col items-start min-w-[180px]">
              <span className="text-xs text-gray-500 font-medium tracking-wide">
                {dateStr}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                대한민국 의료 전문 미디어
              </span>
            </div>

            {/* 모바일: 햄버거 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col justify-center items-center w-12 h-12 gap-1.5"
              aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={mobileMenuOpen}
            >
              <span className={`block w-6 h-0.5 bg-navy transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-navy transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-navy transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>

            {/* 가운데: 로고 */}
            <Link href="/" className="hover:opacity-80 transition-opacity">
              {/* 모바일: 높이 44px */}
              <Image
                src="/logo.jpg"
                alt="닥터뉴스 DR.NEWS"
                width={95}
                height={44}
                className="md:hidden"
                priority
              />
              {/* PC: 높이 60px */}
              <Image
                src="/logo.jpg"
                alt="닥터뉴스 DR.NEWS"
                width={130}
                height={60}
                className="hidden md:block"
                priority
              />
            </Link>

            {/* 오른쪽: 배너 광고 영역 */}
            <div className="hidden md:flex items-center min-w-[250px] justify-end">
              {gnbBanner ? (
                <a
                  href={gnbBanner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-[234px] h-[60px] overflow-hidden hover:opacity-90 transition-opacity"
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
                <div className="w-[234px] h-[60px] bg-gray-50 border border-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-400">AD 234x60</span>
                </div>
              )}
            </div>

            {/* 모바일: 관리자 버튼 */}
            <Link
              href="/admin"
              className="md:hidden px-3 py-1.5 bg-navy text-white text-sm font-medium transition-colors"
            >
              관리자
            </Link>
          </div>
        </div>
      </div>

      {/* 하단 카테고리 바 (데스크탑) */}
      <div className="hidden md:block bg-navy">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* 카테고리 메뉴 */}
            <nav className="flex items-center">
              {categories.map((category, index) => (
                <Link
                  key={category}
                  href={category === '오피니언' ? '/?category=오피니언' : `/?category=${encodeURIComponent(category)}`}
                  className={`
                    px-5 py-3 text-sm font-medium transition-colors relative
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
              className="hidden md:block px-4 py-1.5 border border-gray-400 text-gray-300 hover:text-white hover:border-white text-sm font-medium transition-colors"
            >
              관리자
            </Link>
          </div>
        </div>
      </div>

      {/* 모바일 카테고리 (드롭다운) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy border-t border-slate-700">
          <nav className="flex flex-col">
            {categories.map((category) => (
              <Link
                key={category}
                href={category === '오피니언' ? '/?category=오피니언' : `/?category=${encodeURIComponent(category)}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  px-4 py-3 text-sm font-medium transition-colors border-b border-slate-700
                  ${category === '오피니언'
                    ? 'text-amber-400'
                    : 'text-gray-300 active:bg-slate-700'
                  }
                `}
              >
                {category}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
