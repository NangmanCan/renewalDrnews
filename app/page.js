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
import { getArticles, getHeadlineArticles, getSubHeadlineArticles, getPopularArticles, getArticlesByCategory } from '@/lib/articles';
import { getLatestCeoReport } from '@/lib/ceoReports';
import { getLatestOpinions, getOpinions } from '@/lib/opinions';
import { getBanners } from '@/lib/banners';

// ISR: 60초 캐시 후 자동 갱신 (CMS 변경 1분 내 반영)
export const revalidate = 60;
export const runtime = 'edge';

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;

  // Supabase에서 데이터 가져오기 (모든 쿼리 병렬 실행)
  const [allArticles, headlineArticles, subHeadlineArticles, popularArticles, latestCeoReport, latestOpinions, allBanners] = await Promise.all([
    getArticles(),
    getHeadlineArticles(2),
    getSubHeadlineArticles(1),
    getPopularArticles(5),
    getLatestCeoReport(),
    getLatestOpinions(3),
    getBanners()
  ]);

  // 미배치(placement: 'none') 기사는 프론트엔드에서 제외
  const visibleArticles = allArticles.filter(a => a.placement !== 'none');

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
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 카테고리 타이틀 */}
        {category && (
          <h1 className="font-headline text-2xl font-bold text-navy mb-8">{category} 뉴스</h1>
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
                      <NewsList articles={listArticles} />
                    </div>
                  </div>
                </div>

                {/* 우측 사이드바 (sticky) */}
                <aside className="w-72 flex-shrink-0">
                  <div className="sticky top-24 space-y-4">
                    <Opinion opinions={latestOpinions} />
                    <PopularNews articles={popularArticles} />
                    {sidebarBanners.length > 0 && (
                      <SidebarAd banners={sidebarBanners} sticky={false} />
                    )}
                  </div>
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
        <div className="lg:hidden space-y-6">
          {!category && (
            <>
              {/* 헤드라인 슬라이더 */}
              {headlineArticles.length > 0 && (
                <HeadlineSlider articles={headlineArticles} banners={headlineBanners} />
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
              {sidebarBanners.length > 0 && (
                <NativeAd banner={sidebarBanners[0]} />
              )}

              {/* 제약·바이오 속보 */}
              <BioPharmNews articles={bioPharmArticles} />
            </>
          )}

          {/* 최신 뉴스 목록 - 텍스트 헤드라인 전용 */}
          <div className="bg-white border border-gray-200">
            <div className="px-4 py-2">
              {listArticles.map((article, index) => (
                <div key={article.id}>
                  <NewsListItem article={article} compact />
                  {/* 6개마다 네이티브 광고 삽입 (등록된 광고 롤링) */}
                  {(index + 1) % 6 === 0 && sidebarBanners.length > 0 && (
                    <div className="py-3 border-b border-gray-100">
                      <NativeAd banner={sidebarBanners[Math.floor(index / 6) % sidebarBanners.length]} />
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
