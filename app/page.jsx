import HeadlineNews from '@/components/HeadlineNews';
import NewsList from '@/components/NewsList';
import { getHeadlineArticles, getRegularArticles } from '@/data/articles';

export default function Home() {
  const headlines = getHeadlineArticles(3);
  const regularArticles = getRegularArticles();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤드라인 뉴스 */}
      {headlines.length > 0 && <HeadlineNews articles={headlines} />}

      {/* 섹션 타이틀 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0f172a]">일반 뉴스</h2>
      </div>

      {/* 뉴스 리스트 */}
      <NewsList articles={regularArticles} />
    </main>
  );
}
