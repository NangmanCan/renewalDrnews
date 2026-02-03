const Footer = () => {
  return (
    <footer className="bg-navy text-gray-400 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">Dr.News</span>
            <span className="text-sm">| 의료 전문 뉴스</span>
          </div>
          <p className="text-sm text-center md:text-right">
            &copy; 2026 Dr.News. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
