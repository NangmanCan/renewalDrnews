import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeadlineNews from '@/components/HeadlineNews';
import PopularArticles from '@/components/PopularArticles';
import SubArticleCard from '@/components/SubArticleCard';
import AdScrollStrip from '@/components/AdScrollStrip';
import ArticleListItem from '@/components/ArticleListItem';
import SidebarAd from '@/components/SidebarAd';
import { articles, bioPharmBreakingNews } from '@/data/articles';
import { initialBanners } from '@/data/banners';

export const runtime = 'edge';

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;

  const headline = articles.find((a) => a.isHeadline);
  let regularArticles = articles.filter((a) => !a.isHeadline);

  if (category) {
    regularArticles = articles.filter((a) => a.category === category);
  }

  // 관련 기사: 일반 기사 첫 3개
  const subArticles = regularArticles.slice(0, 3);

  // 배너 필터링
  const headlineBanners = initialBanners
    .filter((b) => b.type === 'headline' && b.isActive)
    .sort((a, b) => a.order - b.order);

  const sidebarBanners = initialBanners
    .filter((b) => b.type === 'sidebar' && b.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* ===== 큐레이션: 헤드라인(좌) + 많이 본 기사(우) ===== */}
        {!category && headline && (
          <section className="mb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 헤드라인 기사 (좌측 2/3) */}
              <div className="lg:w-2/3">
                <HeadlineNews article={headline} />
              </div>
              {/* 많이 본 기사 (우측 1/3) */}
              <div className="lg:w-1/3">
                <PopularArticles />
              </div>
            </div>
          </section>
        )}

        {/* ===== 관련 기사 3개 (PC: 가로 3열, 모바일: 세로) ===== */}
        {!category && (
          <section className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {subArticles.map((article) => (
                <SubArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* ===== 가로 스크롤 광고 슬롯 ===== */}
        {!category && headlineBanners.length > 0 && (
          <section className="mb-8">
            <AdScrollStrip banners={headlineBanners} />
          </section>
        )}

        {/* ===== 카테고리 필터 모드: 직사각형 기사 리스트 ===== */}
        {category && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-2xl font-bold text-navy">{category} 뉴스</h1>
              <span className="text-gray-500 text-sm">총 {regularArticles.length}건</span>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              {regularArticles.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
              {regularArticles.length === 0 && (
                <div className="text-center py-16 text-gray-500">해당 카테고리의 뉴스가 없습니다.</div>
              )}
            </div>
          </section>
        )}

        {/* ===== 바이오·제약 속보 (좌측) + 배너광고 (우측) ===== */}
        {!category && (
          <section>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 좌측: 바이오·제약 속보 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-navy">바이오·제약 속보</h2>
                  <span className="text-[10px] text-white bg-red-600 px-2 py-0.5 rounded font-bold animate-pulse">
                    LIVE
                  </span>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4">
                  {bioPharmBreakingNews.map((article) => (
                    <ArticleListItem key={article.id} article={article} />
                  ))}
                </div>
              </div>

              {/* 우측: 배너광고 */}
              <aside className="lg:w-72 flex-shrink-0">
                <SidebarAd banners={sidebarBanners} />
              </aside>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
