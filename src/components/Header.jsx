const Header = ({ currentPage, setCurrentPage, setSelectedCategory }) => {
  const categories = ['정책', '학술', '병원', '산업'];

  const handleLogoClick = () => {
    setCurrentPage('home');
    setSelectedCategory(null);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage('home');
  };

  return (
    <header className="bg-[#0f172a] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl font-bold text-white">Dr.News</span>
          </button>

          {/* GNB Menu */}
          <nav className="hidden md:flex items-center gap-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                {category}
              </button>
            ))}
          </nav>

          {/* Admin Button */}
          <button className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-md font-medium transition-colors">
            관리자
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <nav className="md:hidden border-t border-slate-700">
        <div className="flex justify-around py-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              {category}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;
