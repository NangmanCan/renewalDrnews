import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SidebarAd from '@/components/SidebarAd';
import { opinions } from '@/data/opinions';
import { initialBanners } from '@/data/banners';

export async function generateStaticParams() {
  return opinions.map((opinion) => ({
    id: opinion.id.toString(),
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const opinion = opinions.find((o) => o.id === parseInt(id));

  if (!opinion) {
    return {
      title: '오피니언을 찾을 수 없습니다 - Dr.News',
    };
  }

  return {
    title: `${opinion.title} - Dr.News 오피니언`,
    description: opinion.summary,
    openGraph: {
      title: opinion.title,
      description: opinion.summary,
      type: 'article',
      publishedTime: opinion.date,
      authors: [opinion.author],
    },
  };
}

export default async function OpinionPage({ params }) {
  const { id } = await params;
  const opinion = opinions.find((o) => o.id === parseInt(id));

  // 사이드바 배너 가져오기 (상단 + 하단 모두)
  const sidebarBanners = initialBanners.filter(
    (b) => b.type === 'sidebar' && b.isActive && (b.positions?.sidebarTop || b.positions?.sidebarBottom)
  );

  if (!opinion) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">오피니언을 찾을 수 없습니다</h2>
          <Link href="/" className="text-sky-600 hover:text-sky-700 font-medium">
            홈으로 돌아가기
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // 다른 오피니언 목록
  const otherOpinions = opinions.filter((o) => o.id !== opinion.id).slice(0, 3);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 뒤로가기 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-navy mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 오피니언 본문 */}
          <article className="flex-1 max-w-4xl">
            {/* 헤더 */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-violet-600 text-white text-sm font-medium rounded">
                  {opinion.category}
                </span>
                <span className="text-gray-500 text-sm">{opinion.date}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {opinion.title}
              </h1>

              <p className="text-lg text-gray-600 mb-6 italic">
                "{opinion.summary}"
              </p>

              {/* 저자 정보 */}
              <div className="flex items-center gap-4 p-4 bg-violet-50 rounded-lg">
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-3 ring-violet-200">
                  <Image
                    src={opinion.authorImage}
                    alt={opinion.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{opinion.author}</p>
                  <p className="text-gray-600">{opinion.authorTitle}</p>
                </div>
              </div>
            </header>

            {/* 본문 */}
            <div className="prose prose-lg max-w-none mb-12">
              {opinion.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-gray-800 leading-relaxed mb-6 text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* 서명 영역 */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={opinion.authorImage}
                      alt={opinion.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{opinion.author}</p>
                    <p className="text-sm text-gray-500">{opinion.authorTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{opinion.date}</p>
                  <p className="text-sm text-violet-600 font-medium">{opinion.category}</p>
                </div>
              </div>
            </div>

            {/* 공유 버튼 */}
            <div className="flex items-center gap-4 py-6 border-t border-b border-gray-200 mt-8">
              <span className="text-gray-600 font-medium">공유하기</span>
              <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
              </button>
              <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </button>
            </div>
          </article>

          {/* 사이드바 - PC에서만 표시 */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <SidebarAd banners={sidebarBanners} sticky={true} showInquiry={true} />
          </aside>
        </div>

        {/* 다른 오피니언 */}
        {otherOpinions.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">다른 오피니언</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherOpinions.map((o) => (
                <Link
                  key={o.id}
                  href={`/opinion/${o.id}`}
                  className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={o.authorImage}
                        alt={o.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{o.author}</p>
                      <p className="text-xs text-gray-500">{o.authorTitle}</p>
                    </div>
                  </div>
                  <span className="text-xs text-violet-600 font-medium">{o.category}</span>
                  <h3 className="font-bold text-gray-900 mt-1 line-clamp-2">{o.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{o.summary}</p>
                  <p className="text-xs text-gray-400 mt-3">{o.date}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
