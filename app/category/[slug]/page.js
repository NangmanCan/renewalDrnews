import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsList, { NewsListItem } from '@/components/NewsListItem';
import PopularNews from '@/components/PopularNews';
import NativeAd from '@/components/NativeAd';
import SidebarAd from '@/components/SidebarAd';
import { getArticlesByCategory, getPopularArticles } from '@/lib/articles';
import { getOpinions } from '@/lib/opinions';
import { getBanners, getBannersByType } from '@/lib/banners';
import { getCategoryBySlug } from '@/lib/categories';

// ISR: 60초 캐시 후 자동 갱신
export const revalidate = 60;
export const runtime = 'edge';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return { title: '카테고리를 찾을 수 없습니다' };
  }

  const canonicalUrl = `https://drnews.co.kr/category/${slug}`;
  const description = `Dr.News ${category.name} 뉴스 - 의료계 ${category.name} 분야의 최신 소식과 심층 기사를 만나보세요.`;

  return {
    title: `${category.name} 뉴스`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: `${category.name} 뉴스`,
      description,
      locale: 'ko_KR',
      siteName: 'Dr.News',
    },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  // 오피니언은 오피니언 데이터를, 그 외는 기사 카테고리 데이터를 사용 (홈 분기 로직과 동일)
  const [listArticles, popularArticles, allBanners, gnbBanners] = await Promise.all([
    category.name === '오피니언' ? getOpinions() : getArticlesByCategory(category.name),
    getPopularArticles(8),
    getBanners(),
    getBannersByType('gnb'),
  ]);

  const gnbBanner = gnbBanners[0] || null;

  // 사이드바 광고 (통합 - positions 필터 없이 전체 사용)
  const sidebarBanners = allBanners
    .filter((b) => b.type === 'sidebar' && b.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <Header gnbBanner={gnbBanner} />

      <main className="max-w-7xl mx-auto px-0 lg:px-4 lg:py-8 py-0">
        {/* 카테고리 타이틀 */}
        <h1 className="text-2xl font-bold text-navy mb-8 px-4 lg:px-0">{category.name} 뉴스</h1>

        {/* PC 레이아웃 */}
        <div className="hidden lg:block">
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
        </div>

        {/* 모바일/태블릿 레이아웃 */}
        <div className="lg:hidden space-y-4">
          {listArticles.length > 0 && (
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
