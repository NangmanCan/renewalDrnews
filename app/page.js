import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeadlineSlider from '@/components/HeadlineSlider';
import NewsCard from '@/components/NewsCard';
import BottomBanner from '@/components/BottomBanner';
import SidebarAd from '@/components/SidebarAd';
import NativeAd from '@/components/NativeAd';
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

  // 모바일용: 기사와 광고를 섞어서 배열 생성
  const getMobileContentWithAds = () => {
    const result = [];
    const adsToInsert = [...bottomBanners, ...sidebarBanners].slice(0, 3);
    let adIndex = 0;

    regularArticles.forEach((article, index) => {
      result.push({ type: 'article', data: article, key: `article-${article.id}` });

      // 2번째, 4번째, 6번째 기사 후에 광고 삽입
      if ((index === 1 || index === 3 || index === 5) && adIndex < adsToInsert.length) {
        result.push({ type: 'ad', data: adsToInsert[adIndex], key: `ad-${adsToInsert[adIndex].id}` });
        adIndex++;
      }
    });

    return result;
  };

  const mobileContent = getMobileContentWithAds();

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

        {/* PC 레이아웃: 메인 콘텐츠 + 사이드바 */}
        <div className="hidden lg:flex gap-8">
          {/* 일반 뉴스 그리드 */}
          <section className="flex-1">
            {!category && (
              <h2 className="text-2xl font-bold text-navy mb-6">최신 뉴스</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* 사이드바 광고 영역 (PC) - 가로로 긴 직사각형 */}
          {!category && sidebarBanners.length > 0 && (
            <aside className="w-72 flex-shrink-0">
              <SidebarAd banners={sidebarBanners} />
            </aside>
          )}
        </div>

        {/* 모바일/태블릿 레이아웃: 기사 사이에 네이티브 광고 */}
        <div className="lg:hidden">
          {!category && (
            <h2 className="text-2xl font-bold text-navy mb-6">최신 뉴스</h2>
          )}
          <div className="flex flex-col gap-4">
            {mobileContent.map((item) => (
              item.type === 'article' ? (
                <NewsCard key={item.key} article={item.data} />
              ) : (
                <NativeAd key={item.key} banner={item.data} />
              )
            ))}
          </div>

          {/* 하단 롤링 광고 배너 (모바일) */}
          {!category && bottomBanners.length > 0 && (
            <div className="mt-8">
              <BottomBanner banners={bottomBanners} />
            </div>
          )}
        </div>

        {regularArticles.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            해당 카테고리의 뉴스가 없습니다.
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
