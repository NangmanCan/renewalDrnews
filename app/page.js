import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeadlineSlider from '@/components/HeadlineSlider';
import SubHeadline from '@/components/SubHeadline';
import CeoReport from '@/components/CeoReport';
import NewsList, { NewsListItem } from '@/components/NewsListItem';
import PopularNews from '@/components/PopularNews';
import Opinion from '@/components/Opinion';
import BioPharmNews from '@/components/BioPharmNews';
import SidebarAd from '@/components/SidebarAd';
import NativeAd from '@/components/NativeAd';
import { articles, getPopularArticles, getSubHeadlineArticles } from '@/data/articles';
import { getLatestCeoReport } from '@/data/ceoReports';
import { getLatestOpinions } from '@/data/opinions';
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

  // 바이오/제약/AI 속보 (산업, AI 카테고리) - 5개로 확대
  const bioPharmArticles = articles
    .filter(a => a.category === '산업' || a.category === 'AI' || a.category === '제약·바이오')
    .slice(0, 5);

  // CEO 리포트
  const latestCeoReport = getLatestCeoReport();

  // 오피니언 (3개까지)
  const latestOpinions = getLatestOpinions(3);

  if (category) {
    regularArticles = articles.filter((a) => a.category === category);
    listArticles = regularArticles;
  }

  // 활성화된 배너 필터링
  const headlineBanners = initialBanners
    .filter((b) => b.type === 'headline' && b.isActive)
    .sort((a, b) => a.order - b.order);

  // 사이드바 광고 (위치별 필터링)
  const allSidebarBanners = initialBanners
    .filter((b) => b.type === 'sidebar' && b.isActive)
    .sort((a, b) => a.order - b.order);

  // PC 사이드바 상단용
  const sidebarTopBanners = allSidebarBanners.filter(
    (b) => b.positions?.sidebarTop
  );
  // PC 사이드바 하단용
  const sidebarBottomBanners = allSidebarBanners.filter(
    (b) => b.positions?.sidebarBottom
  );
  // 모바일: 많이본뉴스-제약바이오 사이
  const mobileBetweenBanners = allSidebarBanners.filter(
    (b) => b.positions?.mobileBetween
  );
  // 모바일: 최신뉴스 목록 내
  const mobileInlineBanners = allSidebarBanners.filter(
    (b) => b.positions?.mobileInline
  );

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

                {/* 우측 사이드바: 오피니언 + 많이본뉴스 + 배너광고(상단) */}
                <aside className="w-72 flex-shrink-0 space-y-4">
                  <Opinion opinions={latestOpinions} />
                  <PopularNews articles={popularArticles} />
                  {sidebarTopBanners.length > 0 && (
                    <SidebarAd banners={sidebarTopBanners} />
                  )}
                </aside>
              </div>

              {/* 하단 영역: 바이오속보 | 최신뉴스 | 배너광고 */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* 제약·바이오 속보 */}
                <div className="w-full lg:w-72 flex-shrink-0">
                  <BioPharmNews articles={bioPharmArticles} />
                </div>

                {/* 최신 뉴스 목록 */}
                <div className="flex-1 min-w-0">
                  <NewsList articles={listArticles} />
                </div>

                {/* 사이드바 광고 (하단) */}
                {sidebarBottomBanners.length > 0 && (
                  <aside className="hidden lg:block w-72 flex-shrink-0">
                    <SidebarAd banners={sidebarBottomBanners} sticky={false} showInquiry={false} />
                  </aside>
                )}
              </div>
            </>
          )}

          {/* 카테고리 필터 적용 시 */}
          {category && (
            <div className="flex flex-col lg:flex-row gap-6">
              <section className="flex-1 min-w-0">
                <NewsList articles={listArticles} />
              </section>
              <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6">
                <PopularNews articles={popularArticles} />
                {sidebarTopBanners.length > 0 && (
                  <SidebarAd banners={sidebarTopBanners} />
                )}
                {sidebarBottomBanners.length > 0 && (
                  <SidebarAd banners={sidebarBottomBanners} sticky={false} showInquiry={false} />
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

              {/* 오피니언 */}
              <Opinion opinions={latestOpinions} />

              {/* 많이 본 뉴스 */}
              <PopularNews articles={popularArticles} />

              {/* 네이티브 광고 (많이본뉴스-제약바이오 사이) */}
              {mobileBetweenBanners.length > 0 && (
                <NativeAd banner={mobileBetweenBanners[0]} />
              )}

              {/* 제약·바이오 속보 */}
              <BioPharmNews articles={bioPharmArticles} />
            </>
          )}

          {/* 최신 뉴스 목록 (4개마다 네이티브 광고 삽입) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="px-4">
              {listArticles.map((article, index) => (
                <div key={article.id}>
                  <NewsListItem article={article} />
                  {/* 4개마다 네이티브 광고 삽입 */}
                  {(index + 1) % 4 === 0 && mobileInlineBanners.length > 0 && (
                    <div className="py-4 border-b border-gray-100">
                      <NativeAd banner={mobileInlineBanners[Math.floor(index / 4) % mobileInlineBanners.length]} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
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
