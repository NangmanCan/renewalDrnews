'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/categories';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* GNB 하단 구분선 (max-w-7xl 안쪽만) */}
        <div className="flex items-center justify-between h-[72px] lg:h-[116px] gap-6 border-b-2 border-gray-300">
          {/* 좌: 로고 */}
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            {/* 모바일: 비율 2:1 */}
            <Image
              src="/logo.webp"
              alt="닥터뉴스 Dr.News"
              width={140}
              height={70}
              className="lg:hidden"
              priority
              quality={95}
            />
            {/* PC: 비율 2:1 */}
            <Image
              src="/logo.webp"
              alt="닥터뉴스 Dr.News"
              width={180}
              height={90}
              className="hidden lg:block"
              priority
              quality={95}
            />
          </Link>

          {/* 우: PC 카테고리 GNB (헤더 하단 쪽으로 정렬) */}
          <nav className="hidden lg:flex items-center flex-1 justify-end gap-1 self-end pb-3">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="px-3.5 py-2 text-[17px] font-semibold text-navy hover:text-brand-600 transition-colors whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* 모바일 햄버거 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex flex-col justify-center items-center w-12 h-12 gap-1.5"
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
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-semibold text-navy border-b border-gray-100 active:bg-brand-50 hover:text-brand-600"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
