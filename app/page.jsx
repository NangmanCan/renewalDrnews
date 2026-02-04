import HeadlineNews from '@/components/HeadlineNews';
import NewsList from '@/components/NewsList';
import PopularNews from '@/components/PopularNews';
import { getHeadlineArticles, getRegularArticles, getPopularArticles } from '@/data/articles';

export default function Home() {
  const headlines = getHeadlineArticles(3);
  const regularArticles = getRegularArticles();
  const popularArticles = getPopularArticles(5);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤드라인 뉴스 */}
      {headlines.length > 0 && <HeadlineNews articles={headlines} />}

      {/* 메인 콘텐츠 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 일반 뉴스 - 왼쪽 2/3 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#0f172a]">최신 뉴스</h2>
          </div>
          <NewsList articles={regularArticles} />
        </div>

        {/* 사이드바 - 오른쪽 1/3 */}
        <aside className="lg:col-span-1">
          {/* 많이 조회된 뉴스 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <h3 className="text-lg font-bold text-[#0f172a] mb-4 pb-2 border-b border-gray-200">
              많이 조회된 뉴스
            </h3>
            <PopularNews articles={popularArticles} />
          </div>

          {/* 사이드 광고 */}
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-sm flex items-center justify-center h-[250px] border-2 border-dashed border-gray-300">
            <div className="text-center p-4">
              <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">ADVERTISEMENT</div>
              <div className="text-gray-500 text-lg font-semibold">광고 지면</div>
              <div className="text-gray-400 text-xs mt-1">문의: ad@drnews.kr</div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
