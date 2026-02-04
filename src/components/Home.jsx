import HeadlineNews from './HeadlineNews';
import SubArticleCard from './SubArticleCard';
import ArticleListItem from './ArticleListItem';
import BannerAd from './BannerAd';
import { getHeadlineArticle, getRegularArticles, bioPharmBreakingNews } from '../data/articles';

const Home = ({ onArticleClick, selectedCategory }) => {
  const headline = getHeadlineArticle();
  let regularArticles = getRegularArticles();

  if (selectedCategory) {
    regularArticles = regularArticles.filter(
      article => article.category === selectedCategory
    );
  }

  // 서브기사: 일반 기사 중 첫 3개
  const subArticles = regularArticles.slice(0, 3);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      {/* ===== 큐레이션 섹션: 헤드라인 1개 + 서브기사 3개 ===== */}
      {!selectedCategory && headline && (
        <section className="mb-10">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 헤드라인 기사 (좌측 큰 영역) */}
            <div className="lg:w-2/3">
              <HeadlineNews article={headline} onClick={onArticleClick} />
            </div>

            {/* 서브기사 3개 (우측 패널) */}
            <div className="lg:w-1/3 bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
                  관련 기사
                </h3>
                <div className="flex flex-col gap-1">
                  {subArticles.map((article) => (
                    <SubArticleCard key={article.id} article={article} onClick={onArticleClick} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== 카테고리 필터 모드: 직사각형 기사 리스트 ===== */}
      {selectedCategory && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-[#0f172a]">{selectedCategory} 뉴스</h2>
            <span className="text-gray-500 text-sm">총 {regularArticles.length}건</span>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            {regularArticles.map((article) => (
              <ArticleListItem key={article.id} article={article} onClick={onArticleClick} />
            ))}
            {regularArticles.length === 0 && (
              <div className="text-center py-16 text-gray-500">해당 카테고리의 뉴스가 없습니다.</div>
            )}
          </div>
        </section>
      )}

      {/* ===== 바이오·제약 속보 (좌측) + 배너광고 (우측) ===== */}
      {!selectedCategory && (
        <section>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 좌측: 바이오·제약 속보 — 직사각형 이미지-글 레이아웃 */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-[#0f172a]">바이오·제약 속보</h2>
                <span className="text-[10px] text-white bg-red-600 px-2 py-0.5 rounded font-bold animate-pulse">
                  LIVE
                </span>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4">
                {bioPharmBreakingNews.map((article) => (
                  <ArticleListItem key={article.id} article={article} onClick={onArticleClick} />
                ))}
              </div>
            </div>

            {/* 우측: 배너광고 */}
            <aside className="lg:w-72 flex-shrink-0">
              <BannerAd />
            </aside>
          </div>
        </section>
      )}
    </main>
  );
};

export default Home;
