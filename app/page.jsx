import HeadlineNews from '@/components/HeadlineNews';
import NewsList from '@/components/NewsList';
import { getHeadlineArticles, getRegularArticles, getPopularArticles } from '@/data/articles';

export default function Home() {
  const headlines = getHeadlineArticles(3);
  const regularArticles = getRegularArticles();
  const popularArticles = getPopularArticles(5);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤드라인 뉴스 + 우측 인기뉴스 */}
      {headlines.length > 0 && (
        <HeadlineNews articles={headlines} popularArticles={popularArticles} />
      )}

      {/* 최신 뉴스 섹션 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#0f172a]">최신 뉴스</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 뉴스 리스트 - 왼쪽 2/3 */}
          <div className="lg:col-span-2">
            <NewsList articles={regularArticles} />
          </div>

          {/* 사이드 광고 - 오른쪽 1/3 */}
          <aside className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-sm flex items-center justify-center h-[300px] border-2 border-dashed border-gray-300 sticky top-24">
              <div className="text-center p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">ADVERTISEMENT</div>
                <div className="text-gray-500 text-lg font-semibold">광고 지면</div>
                <div className="text-gray-400 text-xs mt-1">문의: ad@drnews.kr</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
