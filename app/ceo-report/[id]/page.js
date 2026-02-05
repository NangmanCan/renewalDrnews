import Image from 'next/image';
import Link from 'next/link';
import { ceoReports } from '@/data/ceoReports';

export async function generateStaticParams() {
  return ceoReports.map((report) => ({
    id: report.id.toString(),
  }));
}

export default async function CeoReportPage({ params }) {
  const { id } = await params;
  const report = ceoReports.find((r) => r.id === parseInt(id));

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">리포트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 이전/다음 리포트
  const currentIndex = ceoReports.findIndex((r) => r.id === report.id);
  const prevReport = currentIndex < ceoReports.length - 1 ? ceoReports[currentIndex + 1] : null;
  const nextReport = currentIndex > 0 ? ceoReports[currentIndex - 1] : null;

  // 다른 리포트 목록
  const otherReports = ceoReports.filter((r) => r.id !== report.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
          {/* 브레드크럼 */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  홈
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-amber-400">CEO 리포트</li>
            </ol>
          </nav>

          {/* 메타 정보 */}
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
              {report.category}
            </span>
            <span className="text-gray-400 text-sm">
              {report.date} · 제{report.weekNumber}주차
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {report.title}
          </h1>
          <p className="text-xl text-gray-300 italic mb-8">
            "{report.subtitle}"
          </p>

          {/* 저자 정보 */}
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-3 ring-amber-400/30">
              <Image
                src={report.authorImage}
                alt={report.author}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-lg font-semibold">{report.author}</p>
              <p className="text-gray-400">{report.authorTitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 본문 */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        <div className="prose prose-lg prose-slate max-w-none">
          {report.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed mb-6 text-lg">
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
                  src={report.authorImage}
                  alt={report.author}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{report.author}</p>
                <p className="text-sm text-gray-500">{report.authorTitle}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">{report.date}</p>
              <p className="text-sm text-amber-600 font-medium">제{report.weekNumber}주차 리포트</p>
            </div>
          </div>
        </div>

        {/* 이전/다음 리포트 네비게이션 */}
        <div className="mt-12 grid grid-cols-2 gap-4">
          {prevReport ? (
            <Link
              href={`/ceo-report/${prevReport.id}`}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-xs text-gray-400 block mb-1">이전 리포트</span>
              <span className="text-sm font-medium text-gray-800 line-clamp-1">
                {prevReport.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextReport ? (
            <Link
              href={`/ceo-report/${nextReport.id}`}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-right"
            >
              <span className="text-xs text-gray-400 block mb-1">다음 리포트</span>
              <span className="text-sm font-medium text-gray-800 line-clamp-1">
                {nextReport.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </article>

      {/* 다른 CEO 리포트 */}
      {otherReports.length > 0 && (
        <section className="bg-slate-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">다른 CEO 리포트</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {otherReports.map((r) => (
                <Link
                  key={r.id}
                  href={`/ceo-report/${r.id}`}
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="text-xs text-amber-600 font-medium">{r.category}</span>
                  <h3 className="font-semibold text-gray-800 mt-1 line-clamp-2">{r.title}</h3>
                  <p className="text-xs text-gray-400 mt-2">{r.date}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 하단 CTA */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            메인으로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
