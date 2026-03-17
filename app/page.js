import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import HeadlineSlider from '@/components/HeadlineSlider';
import SubHeadline from '@/components/SubHeadline';
import CeoReport from '@/components/CeoReport';
import NewsList, { NewsListItem } from '@/components/NewsListItem';
import PopularNews from '@/components/PopularNews';
import Opinion from '@/components/Opinion';
import BioPharmNews from '@/components/BioPharmNews';
import SidebarAd from '@/components/SidebarAd';
import NativeAd from '@/components/NativeAd';
import MobileTopCards from '@/components/MobileTopCards';
import StripBanner from '@/components/StripBanner';
import NewsTicker from '@/components/NewsTicker';
import { getArticles, getHeadlineArticles, getSubHeadlineArticles, getPopularArticles, getArticlesByCategory } from '@/lib/articles';
import { getLatestCeoReport } from '@/lib/ceoReports';
import { getLatestOpinions, getOpinions } from '@/lib/opinions';
import { getBanners, getStripBanners, getBannersByType } from '@/lib/banners';

// ISR: 60초 캐시 후 자동 갱신 (CMS 변경 1분 내 반영)
export const revalidate = 60;
export const runtime = 'edge';

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;

  // Supabase에서 데이터 가져오기 (모든 쿼리 병렬 실행)
  const [allArticles, headlineArticles, subHeadlineArticles, popularArticles, latestCeoReport, latestOpinions, allBanners, stripBanners, gnbBanners] = await Promise.all([
    getArticles(),
    getHeadlineArticles(2),
    getSubHeadlineArticles(1),
    getPopularArticles(8),
    getLatestCeoReport(),
    getLatestOpinions(3),
    getBanners(),
    getStripBanners(),
    getBannersByType('gnb')
  ]);

  // GNB 배너 (첫 번째 활성화된 것만)
  const gnbBanner = gnbBanners[0] || null;

  // 닥터포커스 기사 (placement='focus' 또는 기존 category='닥터포커스')
  const focusArticlesList = allArticles.filter(a => a.placement === 'focus' || a.category === '닥터포커스');

  // 미배치(placement: 'none') 및 닥터포커스 제외
  const visibleArticles = allArticles.filter(a => a.placement !== 'none' && a.placement !== 'focus' && a.category !== '닥터포커스');

  let regularArticles = visibleArticles.filter((a) => !a.isHeadline && !a.is_headline);

  // 서브 헤드라인 (최신 1개)
  const subHeadlineArticle = subHeadlineArticles[0];

  // 서브 헤드라인 제외한 나머지 기사 (목록용)
  let listArticles = regularArticles.filter(a => a.id !== subHeadlineArticle?.id);

  // 바이오/제약/AI 속보 (산업, AI 카테고리) - 5개로 확대
  const bioPharmArticles = visibleArticles
    .filter(a => a.category === '산업' || a.category === 'AI' || a.category === '제약·바이오')
    .slice(0, 5);

  if (category) {
    if (category === '오피니언') {
      const allOpinions = await getOpinions();
      regularArticles = allOpinions;
      listArticles = allOpinions;
    } else if (category === '전체') {
      // 전체 기사 (헤드라인 제외한 모든 기사)
      listArticles = visibleArticles.filter(a => !a.isHeadline && !a.is_headline);
    } else {
      const categoryArticles = await getArticlesByCategory(category);
      regularArticles = categoryArticles;
      listArticles = categoryArticles;
    }
  }

  // 활성화된 배너 필터링
  const headlineBanners = allBanners
    .filter((b) => b.type === 'headline' && b.isActive)
    .sort((a, b) => a.order - b.order);

  // 사이드바 광고 (통합 - positions 필터 없이 전체 사용)
  const allSidebarBanners = allBanners
    .filter((b) => b.type === 'sidebar' && b.isActive)
    .sort((a, b) => a.order - b.order);

  // 사이드바 광고는 positions 구분 없이 통합 사용
  const sidebarBanners = allSidebarBanners;

  return (
    <>
      <Header gnbBanner={gnbBanner} />
      
      {/* 알림 티커 - 모바일만 Header 바로 아래 */}
      <div className="lg:hidden">
        {focusArticlesList.length > 0 && <NewsTicker articles={focusArticlesList} />}
      </div>
      
      <main className="max-w-7xl mx-auto px-0 lg:px-4 lg:py-8 py-0">
        {/* 카테고리 타이틀 */}
        {category && (
          <h1 className="text-2xl font-bold text-navy mb-8 px-4 lg:px-0">{category} 뉴스</h1>
        )}

        {/* PC 레이아웃 */}
        <div className="hidden lg:block">
          {!category && (
              <div className="flex gap-6">
                {/* 좌측: 메인 콘텐츠 */}
                <div className="flex-1 min-w-0 space-y-6">
                  {/* 헤드라인 슬라이더 */}
                  {headlineArticles.length > 0 && (
                    <HeadlineSlider articles={headlineArticles} banners={headlineBanners} />
                  )}

                  {/* 서브 헤드라인 */}
                  {subHeadlineArticle && (
                    <SubHeadline article={subHeadlineArticle} />
                  )}

                  {/* 닥터포커스 + 띠배너 (PC, 간격 없이 붙임) */}
                  {(focusArticlesList.length > 0 || stripBanners.length > 0) && (
                    <div className="space-y-0">
                      {focusArticlesList.length > 0 && (
                        <NewsTicker articles={focusArticlesList} />
                      )}
                      {stripBanners.length > 0 && (
                        <StripBanner banners={stripBanners} />
                      )}
                    </div>
                  )}

                  {/* CEO 리포트 */}
                  {latestCeoReport && (
                    <CeoReport report={latestCeoReport} />
                  )}

                  {/* 제약·바이오 속보 + 최신뉴스 */}
                  <div className="flex gap-6">
                    <div className="w-72 flex-shrink-0">
                      <BioPharmNews articles={bioPharmArticles} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <NewsList articles={listArticles.slice(0, 15)} />
                      {listArticles.length > 15 && (
                        <div className="border border-t-0 border-gray-200 py-4 text-center bg-white">
                          <Link
                            href="/news"
                            className="text-sm font-bold text-gray-600 hover:text-navy transition-colors"
                          >
                            더보기 +
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 우측 사이드바 */}
                <aside className="w-72 flex-shrink-0 flex flex-col gap-4">
                  <PopularNews articles={popularArticles} matchHeadline />
                  <Opinion opinions={latestOpinions} fillHeight />
                  {sidebarBanners.length > 0 && (
                    <SidebarAd banners={sidebarBanners} sticky={false} />
                  )}
                </aside>
              </div>
          )}

          {/* 카테고리 필터 적용 시 */}
          {category && (
            <div className="flex flex-col lg:flex-row gap-6">
              <section className="flex-1 min-w-0">
                <NewsList articles={listArticles} />
              </section>
              <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6">
                <PopularNews articles={popularArticles} />
                {sidebarBanners.length > 0 && (
                  <SidebarAd banners={sidebarBanners} />
                )}
              </aside>
            </div>
          )}
        </div>

        {/* 모바일/태블릿 레이아웃 */}
        <div className="lg:hidden space-y-4">
          {!category && (
            <>
              {/* 헤드라인 슬라이더 - 풀와이드 */}
              {headlineArticles.length > 0 && (
                <HeadlineSlider articles={headlineArticles} banners={headlineBanners} />
              )}

              {/* 최신 뉴스: 헤드라인 바로 밑 - 상단 2열 썸네일 + 텍스트 목록 (10개 제한) */}
              {listArticles.length > 0 && (
                <div>
                  {listArticles.length >= 2 && (
                    <MobileTopCards articles={listArticles.slice(0, 2)} />
                  )}
                  <div className="bg-white px-4">
                    {listArticles.slice(listArticles.length >= 2 ? 2 : 0, 10).map((article, index) => (
                      <div key={article.id}>
                        <NewsListItem article={article} compact />
                        {(index + 1) % 6 === 0 && sidebarBanners.length > 0 && (
                          <div className="py-3 border-b border-gray-100">
                            <NativeAd banners={sidebarBanners} />
                          </div>
                        )}
                      </div>
                    ))}
                    {listArticles.length > 10 && (
                      <div className="border-t border-gray-200 py-4 text-center">
                        <a href="/?category=전체" className="text-sm font-bold text-gray-600 hover:text-navy transition-colors">
                          MORE +
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 띠배너 광고 (모바일) */}
              {stripBanners.length > 0 && (
                <StripBanner banners={stripBanners} />
              )}

              {/* 서브 헤드라인 - 풀와이드 */}
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

              {/* 네이티브 광고 - 랜덤 롤링 */}
              {sidebarBanners.length > 0 && (
                <NativeAd banners={sidebarBanners} />
              )}

              {/* 제약·바이오 속보 */}
              <BioPharmNews articles={bioPharmArticles} />
            </>
          )}

          {/* 카테고리 필터 시 전체 목록 */}
          {category && listArticles.length > 0 && (
            <div className="bg-white px-4">
              {listArticles.map((article, index) => (
                <div key={article.id}>
                  <NewsListItem article={article} compact />
                  {(index + 1) % 6 === 0 && sidebarBanners.length > 0 && (
                    <div className="py-3 border-b border-gray-100">
                      <NativeAd banners={sidebarBanners} />
                    </div>
                  )}
                </div>
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
