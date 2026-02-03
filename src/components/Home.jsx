import { useEffect, useRef } from 'react';
import HeadlineNews from './HeadlineNews';
import NewsCard from './NewsCard';
import { getHeadlineArticle, getRegularArticles } from '../data/articles';

const Home = ({ onArticleClick, selectedCategory }) => {
  const headline = getHeadlineArticle();
  let regularArticles = getRegularArticles();

  // 카테고리 필터링
  if (selectedCategory) {
    regularArticles = regularArticles.filter(
      article => article.category === selectedCategory
    );
  }

  const scrollRef = useRef(null);
  const animationRef = useRef(null);

  // 자동 스크롤 애니메이션
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || regularArticles.length <= 3) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      scrollPosition += scrollSpeed;

      // 스크롤이 끝에 도달하면 처음으로
      if (scrollPosition >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollPosition = 0;
      }

      scrollContainer.scrollLeft = scrollPosition;
      animationRef.current = requestAnimationFrame(animate);
    };

    // 마우스 호버 시 애니메이션 정지
    const handleMouseEnter = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    const handleMouseLeave = () => {
      animationRef.current = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [regularArticles.length]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤드라인 뉴스 - 카테고리 필터가 없을 때만 표시 */}
      {!selectedCategory && headline && (
        <HeadlineNews article={headline} onClick={onArticleClick} />
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

      {/* 뉴스 그리드 - 일반 모드 */}
      {!selectedCategory && regularArticles.length > 3 ? (
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollBehavior: 'auto' }}
        >
          {regularArticles.map((article) => (
            <div key={article.id} className="flex-shrink-0 w-[calc(33.333%-16px)] min-w-[300px]">
              <NewsCard article={article} onClick={onArticleClick} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularArticles.map((article) => (
            <NewsCard key={article.id} article={article} onClick={onArticleClick} />
          ))}
        </div>
      )}

      {regularArticles.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          해당 카테고리의 뉴스가 없습니다.
        </div>
      )}
    </main>
  );
};

export default Home;
