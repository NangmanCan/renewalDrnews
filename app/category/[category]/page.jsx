import { notFound } from 'next/navigation';
import NewsList from '@/components/NewsList';
import { articles } from '@/data/articles';

export const runtime = 'edge';

const validCategories = ['정책', '학술', '병원', '산업'];

export async function generateMetadata({ params }) {
  const category = decodeURIComponent(params.category);
  if (!validCategories.includes(category)) {
    return { title: '카테고리를 찾을 수 없습니다' };
  }

  return {
    title: `${category} 뉴스 - Dr.News`,
    description: `${category} 분야의 최신 의료 뉴스`,
  };
}

export default function CategoryPage({ params }) {
  const category = decodeURIComponent(params.category);

  if (!validCategories.includes(category)) {
    notFound();
  }

  const filteredArticles = articles.filter(
    (article) => article.category === category
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* 섹션 타이틀 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0f172a]">{category} 뉴스</h2>
        <span className="text-gray-500 text-sm">총 {filteredArticles.length}건</span>
      </div>

      {/* 뉴스 리스트 */}
      {filteredArticles.length > 0 ? (
        <NewsList articles={filteredArticles} />
      ) : (
        <div className="text-center py-20 text-gray-500">
          해당 카테고리의 뉴스가 없습니다.
        </div>
      )}
    </main>
  );
}
