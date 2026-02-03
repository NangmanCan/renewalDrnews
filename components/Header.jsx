'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();
  const categories = ['정책', '학술', '병원', '산업'];

  return (
    <header className="bg-navy text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-white">Dr.News</span>
          </Link>

          {/* GNB Menu */}
          <nav className="hidden md:flex items-center gap-8">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/?category=${encodeURIComponent(category)}`}
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                {category}
              </Link>
            ))}
          </nav>

          {/* Admin Button */}
          <Link
            href="/admin"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-md font-medium transition-colors"
          >
            관리자
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <nav className="md:hidden border-t border-slate-700">
        <div className="flex justify-around py-3">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/?category=${encodeURIComponent(category)}`}
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              {category}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
