import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeadlineSlider from '@/components/HeadlineSlider';
import SubHeadline from '@/components/SubHeadline';
import NewsList from '@/components/NewsListItem';
import PopularNews from '@/components/PopularNews';
import SidebarAd from '@/components/SidebarAd';
import NativeAd from '@/components/NativeAd';
import { articles, getPopularArticles, getSubHeadlineArticles } from '@/data/articles';
import { initialBanners } from '@/data/banners';

export const runtime = 'edge';

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;

  const headline = articles.find((a) => a.isHeadline);
  let regularArticles = articles.filter((a) => !a.isHeadline);

  // 서브 헤드라인 (최신 2개)
  const subHeadlineArticles = getSubHeadlineArticles(2);

  // 서브 헤드라인 제외한 나머지 기사 (목록용)
  const subHeadlineIds = subHeadlineArticles.map(a => a.id);
  let listArticles = regularArticles.filter(a => !subHeadlineIds.includes(a.id));

  // 많이 본 뉴스
  const popularArticles = getPopularArticles(5);

  if (category) {
    regularArticles = articles.filter((a) => a.category === category);
    listArticles = regularArticles;
  }

  // 활성화된 배너 필터링
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
        {/* 헤드라인 슬라이더 (기사 + 광고) */}
        {!category && headline && (
          <section className="mb-8">
            <HeadlineSlider article={headline} banners={headlineBanners} />
          </section>
        )}

        {/* 카테고리 타이틀 */}
        {category && (
          <h1 className="text-3xl font-bold text-navy mb-8">{category} 뉴스</h1>
        )}

        {/* 서브 헤드라인 (중형, 가로형 피드 2개) - 카테고리 필터 없을 때만 */}
        {!category && subHeadlineArticles.length > 0 && (
          <section className="mb-8">
            <SubHeadline articles={subHeadlineArticles} />
          </section>
        )}

        {/* PC 레이아웃: 메인 콘텐츠 + 사이드바 */}
        <div className="hidden lg:flex gap-8">
          {/* 좌측: 목록형 뉴스 */}
          <section className="flex-1">
            <NewsList
              articles={listArticles}
              title={category ? null : "최신 뉴스"}
            />
          </section>

          {/* 우측 사이드바: 많이본 뉴스 + 배너 광고 */}
          <aside className="w-80 flex-shrink-0 space-y-6">
            {/* 많이 본 뉴스 */}
            {!category && (
              <PopularNews articles={popularArticles} />
            )}

            {/* 배너 광고 */}
            {sidebarBanners.length > 0 && (
              <SidebarAd banners={sidebarBanners} />
            )}
          </aside>
        </div>

        {/* 모바일/태블릿 레이아웃 */}
        <div className="lg:hidden space-y-6">
          {/* 많이 본 뉴스 */}
          {!category && (
            <PopularNews articles={popularArticles} />
          )}

          {/* 목록형 뉴스 */}
          <NewsList
            articles={listArticles}
            title={category ? null : "최신 뉴스"}
          />

          {/* 사이드바 광고 (모바일) */}
          {sidebarBanners.length > 0 && (
            <div className="space-y-4">
              {sidebarBanners.map((banner) => (
                <NativeAd key={banner.id} banner={banner} />
              ))}
            </div>
          )}
        </div>

        {listArticles.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            해당 카테고리의 뉴스가 없습니다.
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
