import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCeoReports } from '@/lib/ceoReports';
import { getBannersByType } from '@/lib/banners';

// ISR: 60초 캐시 후 자동 갱신
export const revalidate = 60;
export const runtime = 'edge';

export const metadata = {
  title: 'CEO 리포트',
  description: '의료계 리더들의 경영 인사이트와 경험을 담은 Dr.News CEO 리포트 시리즈. 매주 깊이 있는 리포트를 만나보세요.',
  alternates: {
    canonical: 'https://drnews.co.kr/ceo-report',
  },
  openGraph: {
    type: 'website',
    url: 'https://drnews.co.kr/ceo-report',
    title: 'CEO 리포트',
    description: '의료계 리더들의 경영 인사이트와 경험을 담은 Dr.News CEO 리포트 시리즈.',
    locale: 'ko_KR',
    siteName: 'Dr.News',
  },
};

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

export default async function CeoReportIndexPage() {
  const [reports, gnbBanners] = await Promise.all([
    getCeoReports(100),
    getBannersByType('gnb'),
  ]);
  const gnbBanner = gnbBanners[0] || null;

  return (
    <>
      <Header gnbBanner={gnbBanner} />

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* 페이지 헤더 */}
        <header className="mb-8 md:mb-12 border-b-2 border-navy pb-6">
          <nav className="text-sm text-gray-500 mb-3">
            <Link href="/" className="hover:text-brand-600">홈</Link>
            <span className="mx-2">/</span>
            <span className="text-navy font-semibold">CEO 리포트</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold text-navy tracking-tight">CEO 리포트</h1>
          <p className="text-base text-gray-600 mt-3 leading-relaxed">
            의료계 리더들의 경영 인사이트와 경험을 담은 시리즈. 매주 한 편의 깊이 있는 리포트를 만나보세요.
          </p>
        </header>

        {/* 리포트 목록 */}
        {reports.length === 0 ? (
          <div className="text-center text-gray-500 py-20">아직 등록된 CEO 리포트가 없습니다.</div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/ceo-report/${report.id}`}
                className="group flex flex-col md:flex-row gap-5 p-5 border border-gray-200 rounded-lg hover:border-brand-300 hover:shadow-md transition-all bg-white"
              >
                {/* 작성자 사진 + 메타 */}
                <div className="flex md:flex-col items-start md:items-center md:w-40 flex-shrink-0 gap-3 md:gap-2">
                  <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                    {report.authorImage && (
                      <Image
                        src={report.authorImage}
                        alt={report.author}
                        fill
                        sizes="(max-width: 768px) 64px, 96px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="md:text-center">
                    <div className="text-sm font-bold text-navy">{report.author}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{report.authorTitle}</div>
                  </div>
                </div>

                {/* 본문 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {report.category && (
                      <span className="text-xs font-bold text-brand-600 tracking-wide">
                        {report.category}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{report.date}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-navy leading-tight mb-2 group-hover:text-brand-600 transition-colors">
                    {report.title}
                  </h2>
                  {report.subtitle && (
                    <p className="text-base text-gray-600 italic mb-3 leading-snug">
                      &ldquo;{report.subtitle}&rdquo;
                    </p>
                  )}
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                    {stripHtml(report.content)}
                  </p>
                  <div className="mt-3 text-sm font-semibold text-brand-600 group-hover:underline">
                    전체 읽기 →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
