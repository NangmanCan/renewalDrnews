import { useState } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import ArticleDetail from './components/ArticleDetail';
import AdminLayout from './components/admin/AdminLayout';
import { articles as initialArticles } from './data/articles';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 기사 상태 관리 (관리자에서 수정 가능)
  const [articles, setArticles] = useState(initialArticles);

  // 메인 페이지 슬롯 상태
  const [mainSlots, setMainSlots] = useState({
    headline: initialArticles.find((a) => a.isHeadline) || null,
    sub: initialArticles.filter((a) => !a.isHeadline).slice(0, 3),
  });

  const handleArticleClick = (articleId) => {
    setSelectedArticleId(articleId);
    setCurrentPage('detail');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentPage('home');
    setSelectedArticleId(null);
  };

  const handleAdminExit = () => {
    setCurrentPage('home');
  };

  // 관리자 페이지
  if (currentPage === 'admin') {
    return (
      <AdminLayout
        onExit={handleAdminExit}
        articles={articles}
        setArticles={setArticles}
        mainSlots={mainSlots}
        setMainSlots={setMainSlots}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setSelectedCategory={setSelectedCategory}
      />

      {currentPage === 'home' && (
        <Home
          onArticleClick={handleArticleClick}
          selectedCategory={selectedCategory}
          articles={articles}
          mainSlots={mainSlots}
        />
      )}

      {currentPage === 'detail' && (
        <ArticleDetail
          articleId={selectedArticleId}
          onArticleClick={handleArticleClick}
          onBack={handleBack}
          articles={articles}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#0f172a] text-gray-400 py-8 mt-16">
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
    </div>
  );
}

export default App;
