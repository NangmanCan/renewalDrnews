import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeadlineSlider from '@/components/HeadlineSlider';
import NewsCard from '@/components/NewsCard';
import BottomBanner from '@/components/BottomBanner';
import SidebarAd from '@/components/SidebarAd';
import { articles } from '@/data/articles';
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

  // 활성화된 배너 필터링
  const headlineBanners = initialBanners
    .filter((b) => b.type === 'headline' && b.isActive)
    .sort((a, b) => a.order - b.order);
  const bottomBanners = initialBanners
    .filter((b) => b.type === 'bottom' && b.isActive)
    .sort((a, b) => a.order - b.order);
  const sidebarBanners = initialBanners
    .filter((b) => b.type === 'sidebar' && b.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤드라인 슬라이더 (기사 + 광고) */}
        {!category && headline && (
          <section className="mb-12">
            <HeadlineSlider article={headline} banners={headlineBanners} />
          </section>
        )}

        {/* 카테고리 타이틀 */}
        {category && (
          <h1 className="text-3xl font-bold text-navy mb-8">{category} 뉴스</h1>
        )}

        {/* 메인 콘텐츠 영역 (뉴스 그리드 + 사이드바) */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 일반 뉴스 그리드 */}
          <section className="flex-1">
            {!category && (
              <h2 className="text-2xl font-bold text-navy mb-6">최신 뉴스</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {regularArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>

            {/* 하단 롤링 광고 배너 */}
            {!category && bottomBanners.length > 0 && (
              <div className="mt-8">
                <BottomBanner banners={bottomBanners} />
              </div>
            )}
          </section>

          {/* 사이드바 광고 영역 */}
          {!category && sidebarBanners.length > 0 && (
            <aside className="w-full lg:w-80 flex-shrink-0">
              <SidebarAd banners={sidebarBanners} />
            </aside>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
