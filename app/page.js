import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeadlineSlider from '@/components/HeadlineSlider';
import SubHeadline from '@/components/SubHeadline';
import CeoReport from '@/components/CeoReport';
import NewsList from '@/components/NewsListItem';
import PopularNews from '@/components/PopularNews';
import BioPharmNews from '@/components/BioPharmNews';
import SidebarAd from '@/components/SidebarAd';
import NativeAd from '@/components/NativeAd';
import { articles, getPopularArticles, getSubHeadlineArticles } from '@/data/articles';
import { getLatestCeoReport } from '@/data/ceoReports';
import { initialBanners } from '@/data/banners';

export const runtime = 'edge';

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;

  const headline = articles.find((a) => a.isHeadline);
  let regularArticles = articles.filter((a) => !a.isHeadline);

  // 서브 헤드라인 (최신 1개)
  const subHeadlineArticle = getSubHeadlineArticles(1)[0];

  // 서브 헤드라인 제외한 나머지 기사 (목록용)
  let listArticles = regularArticles.filter(a => a.id !== subHeadlineArticle?.id);

  // 많이 본 뉴스
  const popularArticles = getPopularArticles(5);

  // 바이오/제약/AI 속보 (산업, AI 카테고리)
  const bioPharmArticles = articles
    .filter(a => a.category === '산업' || a.category === 'AI' || a.category === '제약·바이오')
    .slice(0, 3);

  // CEO 리포트
  const latestCeoReport = getLatestCeoReport();

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
        {/* 카테고리 타이틀 */}
        {category && (
          <h1 className="text-3xl font-bold text-navy mb-8">{category} 뉴스</h1>
        )}

        {/* PC 레이아웃 */}
        <div className="hidden lg:block">
          {!category && (
            <>
              {/* 상단 영역: 헤드라인 + 서브헤드 | 많이본뉴스 + 배너 */}
              <div className="flex gap-6 mb-8">
                {/* 좌측: 헤드라인 슬라이더 + 서브헤드 */}
                <div className="flex-1 space-y-6">
                  {/* 헤드라인 슬라이더 */}
                  {headline && (
                    <HeadlineSlider article={headline} banners={headlineBanners} />
                  )}

                  {/* 서브 헤드라인 */}
                  {subHeadlineArticle && (
                    <SubHeadline article={subHeadlineArticle} />
                  )}

                  {/* CEO 리포트 */}
                  {latestCeoReport && (
                    <CeoReport report={latestCeoReport} />
                  )}
                </div>

                {/* 우측 사이드바: 많이본뉴스 + 배너광고 */}
                <aside className="w-72 flex-shrink-0 space-y-6">
                  <PopularNews articles={popularArticles} />
                  {sidebarBanners.length > 0 && (
                    <SidebarAd banners={sidebarBanners} />
                  )}
                </aside>
              </div>

              {/* 하단 영역: 바이오속보 | 최신뉴스 | 배너광고 */}
              <div className="flex gap-6">
                {/* 바이오/제약 속보 */}
                <div className="w-64 flex-shrink-0">
                  <BioPharmNews articles={bioPharmArticles} />
                </div>

                {/* 최신 뉴스 목록 */}
                <div className="flex-1">
                  <NewsList articles={listArticles} />
                </div>

                {/* 배너 광고 */}
                {sidebarBanners.length > 0 && (
                  <div className="w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                      <h3 className="text-sm font-bold text-gray-500 mb-3">광고</h3>
                      <div className="space-y-4">
                        {sidebarBanners.map((banner) => (
                          <a
                            key={banner.id}
                            href={banner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={banner.image}
                              alt={banner.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <p className="text-xs text-gray-600 mt-2 line-clamp-1">
                              {banner.title}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 카테고리 필터 적용 시 */}
          {category && (
            <div className="flex gap-6">
              <section className="flex-1">
                <NewsList articles={listArticles} />
              </section>
              <aside className="w-72 flex-shrink-0 space-y-6">
                <PopularNews articles={popularArticles} />
                {sidebarBanners.length > 0 && (
                  <SidebarAd banners={sidebarBanners} />
                )}
              </aside>
            </div>
          )}
        </div>

        {/* 모바일/태블릿 레이아웃 */}
        <div className="lg:hidden space-y-6">
          {!category && (
            <>
              {/* 헤드라인 슬라이더 */}
              {headline && (
                <HeadlineSlider article={headline} banners={headlineBanners} />
              )}

              {/* 서브 헤드라인 */}
              {subHeadlineArticle && (
                <SubHeadline article={subHeadlineArticle} />
              )}

              {/* CEO 리포트 */}
              {latestCeoReport && (
                <CeoReport report={latestCeoReport} />
              )}

              {/* 많이 본 뉴스 */}
              <PopularNews articles={popularArticles} />

              {/* 바이오/제약 속보 */}
              <BioPharmNews articles={bioPharmArticles} />
            </>
          )}

          {/* 최신 뉴스 목록 */}
          <NewsList articles={listArticles} />

          {/* 광고 (모바일) */}
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
