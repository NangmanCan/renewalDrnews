import HeadlineNews from './HeadlineNews';
import NewsCard from './NewsCard';
import { getHeadlineArticles, getRegularArticles } from '../data/articles';

const Home = ({ onArticleClick, selectedCategory }) => {
  const headlines = getHeadlineArticles(3);
  let regularArticles = getRegularArticles();

  // 카테고리 필터링
  if (selectedCategory) {
    regularArticles = regularArticles.filter(
      article => article.category === selectedCategory
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤드라인 뉴스 - 카테고리 필터가 없을 때만 표시 */}
      {!selectedCategory && headlines.length > 0 && (
        <HeadlineNews articles={headlines} onClick={onArticleClick} />
      )}

      {/* 섹션 타이틀 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0f172a]">
          {selectedCategory ? `${selectedCategory} 뉴스` : '일반 뉴스'}
        </h2>
        {selectedCategory && (
          <span className="text-gray-500 text-sm">
            총 {regularArticles.length}건
          </span>
        )}
      </div>

      {/* 뉴스 리스트 - 텍스트 기반 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {regularArticles.map((article) => (
          <NewsCard key={article.id} article={article} onClick={onArticleClick} />
        ))}
      </div>

      {regularArticles.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          해당 카테고리의 뉴스가 없습니다.
        </div>
      )}
    </main>
  );
};

export default Home;
