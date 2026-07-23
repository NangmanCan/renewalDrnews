import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import IssuePickBar from '@/components/IssuePickBar';
import HeadlineSlider from '@/components/HeadlineSlider';
import SubHeadline from '@/components/SubHeadline';
import HeroSecondary from '@/components/HeroSecondary';
import CategoryCards from '@/components/CategoryCards';
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
import { getLatestDoctorInterviews } from '@/lib/doctorInterviews';
import { getBanners, getStripBanners } from '@/lib/banners';
import { getDoctorPicks } from '@/lib/doctorPicks';
import { getAdSlotSettings } from '@/lib/adSlotSettings';
import { getSlugByName } from '@/lib/categories';
import { redirect } from 'next/navigation';

// ISR: 60초 캐시 후 자동 갱신 (CMS 변경 1분 내 반영)
export const revalidate = 60;
export const runtime = 'edge';

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;

  // 기존 /?category= 링크 호환: 실경로 /category/{slug}로 리다이렉트
  if (category) {
    const slug = getSlugByName(category);
    if (slug) {
      redirect(`/category/${slug}`);
    }
  }

  // Supabase에서 데이터 가져오기 (모든 쿼리 병렬 실행)
  const [allArticles, headlineArticles, subHeadlineArticles, popularArticles, latestCeoReport, latestOpinions, latestDoctorInterviews, allBanners, stripBanners, doctorPicks, adSlotSettings] = await Promise.all([
    getArticles(),
    getHeadlineArticles(2),
    getSubHeadlineArticles(1),
    getPopularArticles(8),
    getLatestCeoReport(),
    getLatestOpinions(3),
    getLatestDoctorInterviews(1),
    getBanners(),
    getStripBanners(),
    getDoctorPicks(3),
    getAdSlotSettings(),
  ]);

  // 오피니언 영역: 최신 닥터인터뷰 1건을 최상단에 노출, 아래는 기존 오피니언
  // 인터뷰가 없으면 기존 오피니언 그대로
  const opinionItems = latestDoctorInterviews.length > 0
    ? [{ ...latestDoctorInterviews[0], type: 'doctor_interview' }, ...latestOpinions]
    : latestOpinions;

  // 닥터포커스 기사 (placement='focus' 또는 기존 category='닥터포커스')
  const focusArticlesList = allArticles.filter(a => a.placement === 'focus' || a.category === '닥터포커스');

  // 미배치(placement: 'none') / 닥터포커스 / 카테고리카드(우측 픽) 슬롯은 일반 목록에서 제외
  const visibleArticles = allArticles.filter(a =>
    a.placement !== 'none' &&
    a.placement !== 'focus' &&
    a.placement !== 'category_card' &&
    a.category !== '닥터포커스'
  );

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

  // DOCTOR'S PICK: 어드민에서 큐레이션한 픽 (없으면 주요 카테고리 최신 기사로 자동 채움)
  let issuePicks;
  if (doctorPicks && doctorPicks.length > 0) {
    issuePicks = doctorPicks.map((p) => ({
      id: p.id,
      label: p.label,
      title: p.title || p.label,
      href: p.link,
    }));
  } else {
    const fallbackCategories = ['정책', '학술', '제약·바이오'];
    issuePicks = fallbackCategories
      .map((label) => {
        const article = visibleArticles.find((a) => a.category === label);
        if (!article) return null;
        return {
          id: article.id,
          label,
          title: article.title,
          href: `/article/${article.id}`,
        };
      })
      .filter(Boolean);
  }

  // HERO 우측: 카테고리 카드 4개
  //  - 수동 큐레이션(placement='category_card')이 있으면 그게 우선
  //  - 비어있으면 자동: visibleArticles(최신순)에서 서로 다른 카테고리 최신 1건씩 4개
  const curatedCategoryCards = allArticles
    .filter((a) => a.placement === 'category_card')
    .slice(0, 4);
  let heroCategoryCards;
  if (curatedCategoryCards.length > 0) {
    heroCategoryCards = curatedCategoryCards.map((article) => ({
      category: article.category || '기사',
      article,
    }));
  } else {
    const seen = new Set();
    const autoCards = [];
    for (const article of visibleArticles) {
      if (!article.category) continue;
      if (seen.has(article.category)) continue;
      seen.add(article.category);
      autoCards.push({ category: article.category, article });
      if (autoCards.length >= 4) break;
    }
    heroCategoryCards = autoCards;
  }

  // HERO 좌측: 보조 헤드라인(SubHeadline 1건) + 미니 헤드라인 2건
  const heroLeftMini = listArticles
    .filter((a) => a.id !== subHeadlineArticle?.id)
    .slice(0, 2);

  // HERO 좌측에 들어간 보조헤드/미니 헤드라인은 아래 NewsList에서 중복 제외
  const heroLeftIds = new Set([
    subHeadlineArticle?.id,
    ...heroLeftMini.map((a) => a.id),
  ].filter(Boolean));
  const newsListArticles = listArticles.filter((a) => !heroLeftIds.has(a.id));

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

  // HERO 우측 카테고리 카드 하단 전용 광고 (sidebar와 별도 타입)
  const heroAdBanners = allBanners
    .filter((b) => b.type === 'hero_ad' && b.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <Header />

      {/* DOCTOR'S PICK 띠 (PC + 모바일 모두 Header 바로 아래) */}
      {!category && <IssuePickBar picks={issuePicks} />}
      
      <main className="max-w-7xl mx-auto px-0 lg:px-4 lg:py-8 py-0">
        {/* 카테고리 타이틀 */}
        {category && (
          <h1 className="text-2xl font-bold text-navy mb-8 px-4 lg:px-0">{category} 뉴스</h1>
        )}

        {/* PC 레이аут */}
        <div className="hidden lg:block">
          {!category && (
              <div className="space-y-6">
                {/* HERO 3컬럼 그리드 — 좌/중/우 모두 동일 높이로 정렬 */}
                <div className="grid grid-cols-[16rem_minmax(0,1fr)_18rem] gap-6 items-stretch min-h-[420px]">
                  {/* 좌: 보조 헤드라인 + 미니 헤드 */}
                  <HeroSecondary feature={subHeadlineArticle} mini={heroLeftMini} />

                  {/* 중: 메인 헤드라인 슬라이더 */}
                  <div className="relative min-w-0 h-full">
                    {headlineArticles.length > 0 && (
                      <HeadlineSlider articles={headlineArticles} banners={headlineBanners} rolling={adSlotSettings.headline.rolling} interval={adSlotSettings.headline.interval} />
                    )}
                  </div>

                  {/* 우: 4 카테고리 카드 + 남는 공간에 광고 배너 */}
                  <CategoryCards items={heroCategoryCards} adBanners={heroAdBanners} rolling={adSlotSettings.hero_ad.rolling} interval={adSlotSettings.hero_ad.interval} />
                </div>

                {/* HERO 아래: 기존 2컬럼 (메인 + 사이드) */}
                <div className="flex gap-6">
                  {/* 좌측 메인 */}
                  <div className="flex-1 min-w-0 space-y-6">
                    {/* 닥터포커스 + 띠배너 */}
                    {(focusArticlesList.length > 0 || stripBanners.length > 0) && (
                      <div className="space-y-0">
                        {focusArticlesList.length > 0 && (
                          <NewsTicker articles={focusArticlesList} />
                        )}
                        {stripBanners.length > 0 && (
                          <StripBanner banners={stripBanners} rolling={adSlotSettings.strip.rolling} interval={adSlotSettings.strip.interval} />
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
                        <NewsList articles={newsListArticles.slice(0, 15)} />
                        {newsListArticles.length > 15 && (
                          <div className="border border-t-0 border-gray-200 py-4 text-center bg-white">
                            <Link
                              href="/news"
                              className="text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors"
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
                    <Opinion opinions={opinionItems} fillHeight />
                    {sidebarBanners.length > 0 && (
                      <SidebarAd banners={sidebarBanners} sticky={false} />
                    )}
                  </aside>
                </div>
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
                <HeadlineSlider articles={headlineArticles} banners={headlineBanners} rolling={adSlotSettings.headline.rolling} interval={adSlotSettings.headline.interval} />
              )}

              {/* 흐르는 닥터포커스 (헤드라인 슬라이더 바로 아래) */}
              {focusArticlesList.length > 0 && (
                <NewsTicker articles={focusArticlesList} />
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
                <StripBanner banners={stripBanners} rolling={adSlotSettings.strip.rolling} interval={adSlotSettings.strip.interval} />
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
              <Opinion opinions={opinionItems} />

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
