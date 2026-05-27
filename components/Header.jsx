'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const categories = ['정책', '학술', '병원', '산업', 'AI', '제약·바이오', '해외뉴스', '오피니언'];

const Header = ({ gnbBanner }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* GNB 하단 구분선 (max-w-7xl 안쪽만) */}
        <div className="flex items-center justify-between h-16 md:h-[72px] gap-6 border-b-2 border-gray-300">
          {/* 좌: 로고 */}
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            {/* 모바일: 비율 2:1 */}
            <Image
              src="/logo.webp"
              alt="닥터뉴스 Dr.News"
              width={120}
              height={60}
              className="md:hidden"
              priority
              quality={95}
            />
            {/* PC: 비율 2:1, 헤더 72px 안에 들어가도록 */}
            <Image
              src="/logo.webp"
              alt="닥터뉴스 Dr.News"
              width={140}
              height={70}
              className="hidden md:block"
              priority
              quality={95}
            />
          </Link>

          {/* 우: PC 카테고리 GNB */}
          <nav className="hidden md:flex items-center flex-1 justify-end gap-1">
            {categories.map((category) => (
              <Link
                key={category}
                href={category === '오피니언' ? '/?category=오피니언' : `/?category=${encodeURIComponent(category)}`}
                className="px-3 py-2 text-[15px] font-semibold text-navy hover:text-brand-600 transition-colors whitespace-nowrap"
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* 우 끝: GNB 배너 광고 (PC) */}
          {gnbBanner && gnbBanner.image && (
            <a
              href={gnbBanner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:block flex-shrink-0 relative w-[180px] h-[48px] overflow-hidden hover:opacity-90 transition-opacity"
            >
              <Image
                src={gnbBanner.image}
                alt={gnbBanner.title}
                fill
                quality={95}
                sizes="180px"
                className="object-cover"
                unoptimized={gnbBanner.image?.endsWith('.gif')}
              />
            </a>
          )}

          {/* 모바일 햄버거 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-12 h-12 gap-1.5"
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileMenuOpen}
          >
            <span className={`block w-6 h-0.5 bg-navy transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-navy transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-navy transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* 모바일 카테고리 드롭다운 */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col">
            {categories.map((category) => (
              <Link
                key={category}
                href={category === '오피니언' ? '/?category=오피니언' : `/?category=${encodeURIComponent(category)}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-navy border-b border-gray-100 active:bg-brand-50 hover:text-brand-600"
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
