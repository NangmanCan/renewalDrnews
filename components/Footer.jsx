import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-gray-400 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              Dr.<span className="text-sky-400">News</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              홈
            </Link>
            <Link href="/category/정책" className="hover:text-white transition-colors">
              정책
            </Link>
            <Link href="/category/학술" className="hover:text-white transition-colors">
              학술
            </Link>
            <Link href="/category/병원" className="hover:text-white transition-colors">
              병원
            </Link>
            <Link href="/category/산업" className="hover:text-white transition-colors">
              산업
            </Link>
          </div>
          <p className="text-sm">© 2026 Dr.News. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
