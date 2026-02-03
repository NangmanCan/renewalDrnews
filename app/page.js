import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeadlineNews from '@/components/HeadlineNews';
import NewsCard from '@/components/NewsCard';
import { articles } from '@/data/articles';

export const runtime = 'edge';

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;

  const headline = articles.find((a) => a.isHeadline);
  let regularArticles = articles.filter((a) => !a.isHeadline);

  if (category) {
    regularArticles = articles.filter((a) => a.category === category);
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤드라인 뉴스 */}
        {!category && headline && (
          <section className="mb-12">
            <HeadlineNews article={headline} />
          </section>
        )}

        {/* 카테고리 타이틀 */}
        {category && (
          <h1 className="text-3xl font-bold text-navy mb-8">{category} 뉴스</h1>
        )}

        {/* 일반 뉴스 그리드 */}
        <section>
          {!category && (
            <h2 className="text-2xl font-bold text-navy mb-6">최신 뉴스</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
