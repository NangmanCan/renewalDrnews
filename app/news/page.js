import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsList from '@/components/NewsListItem';
import { getArticles } from '@/lib/articles';

export const revalidate = 60;
export const runtime = 'edge';

function getDateString(date) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
}

function getRecentDateFilters() {
  return Array.from({ length: 7 }, (_, offset) => {
    const target = new Date();
    target.setDate(target.getDate() - offset);

    return {
      value: getDateString(target),
      label: offset === 0 ? '오늘' : `${offset}일전`,
    };
  });
}

export default async function NewsPage({ searchParams }) {
  const params = await searchParams;
  const selectedDate = params?.date || 'all';

  const allArticles = await getArticles();
  const visibleArticles = allArticles.filter((article) => article.placement !== 'none');
  const listArticles = visibleArticles.filter((article) => !article.isHeadline && !article.is_headline);

  const dateFilters = getRecentDateFilters();
  const filteredArticles = selectedDate === 'all'
    ? listArticles
    : listArticles.filter((article) => article.date?.split('T')[0] === selectedDate);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-navy mb-6">최신 뉴스</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/news"
            className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
              selectedDate === 'all'
                ? 'bg-navy text-white border-navy'
                : 'bg-white text-gray-700 border-gray-300 hover:border-navy hover:text-navy'
            }`}
          >
            전체
          </Link>
          {dateFilters.map((filter) => (
            <Link
              key={filter.value}
              href={`/news?date=${filter.value}`}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                selectedDate === filter.value
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-navy hover:text-navy'
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>

        {filteredArticles.length > 0 ? (
          <NewsList articles={filteredArticles} />
        ) : (
          <div className="text-center py-20 text-gray-500">
            선택한 날짜의 뉴스가 없습니다.
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
