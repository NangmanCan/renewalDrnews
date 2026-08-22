import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CATEGORIES } from '@/lib/categories';
import { PUBLICATION } from '@/lib/publication';

export const metadata = {
  title: '회사소개',
  description:
    '2007년 창간한 의료 전문 뉴스·저널 Dr.News(닥터뉴스) 소개. 취재 분야, 편집 원칙, 발행 정보를 안내합니다.',
  alternates: { canonical: 'https://drnews.co.kr/about' },
  openGraph: {
    type: 'website',
    url: 'https://drnews.co.kr/about',
    title: '회사소개',
    description: '2007년 창간한 의료 전문 뉴스·저널 Dr.News(닥터뉴스) 소개.',
    locale: 'ko_KR',
    siteName: 'Dr.News',
  },
};

// 취재 분야 (오피니언은 취재 카테고리가 아니라 기고 지면이므로 제외)
const COVERAGE = CATEGORIES.filter((c) => c.slug !== 'opinion');

const PRINCIPLES = [
  {
    h: '사실 확인 우선',
    body: '보도 전 취재원과 자료를 통해 사실 관계를 확인하며, 확인되지 않은 내용은 싣지 않습니다.',
  },
  {
    h: '출처 명시',
    body: '통계·논문·발표 자료를 인용할 때는 출처와 발표 시점을 함께 밝힙니다.',
  },
  {
    h: '의료계 현장 중심 보도',
    body: '정책 발표문에 머무르지 않고 개원가·병원·산업 현장의 목소리를 직접 취재해 전합니다.',
  },
  {
    h: '오류 정정 원칙',
    body: '오보나 사실과 다른 내용이 확인되면 지체 없이 정정하고 그 경위를 기사에 밝힙니다.',
  },
];

const PUBLICATION_ROWS = [
  { label: '매체명', value: PUBLICATION.name },
  { label: '등록번호', value: PUBLICATION.registrationNo },
  { label: '등록일', value: PUBLICATION.registrationDate },
  { label: '발행인', value: PUBLICATION.publisher },
  { label: '청소년보호책임자', value: PUBLICATION.youthOfficer },
  { label: '연락처', value: PUBLICATION.tel },
  { label: '주소', value: PUBLICATION.address },
  { label: '이메일', value: PUBLICATION.adEmail },
];

const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Dr.News 회사소개',
  description:
    '2007년 창간한 의료 전문 뉴스·저널 Dr.News(닥터뉴스)의 매체 소개, 취재 분야, 편집 원칙, 발행 정보.',
  url: 'https://drnews.co.kr/about',
  inLanguage: 'ko-KR',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Dr.News',
    url: 'https://drnews.co.kr',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: 'Dr.News',
  alternateName: '닥터뉴스',
  url: 'https://drnews.co.kr',
  logo: 'https://drnews.co.kr/logo.png',
  description:
    'Dr.News(닥터뉴스)는 2007년 창간한 대한민국 의료 전문 뉴스이자 의료 전문 저널로, 정책·학술·병의원·산업·문화AI·제약바이오 분야를 취재 보도합니다.',
  foundingDate: '2007-01-08',
  knowsAbout: ['의료 정책', '의학 학술', '병의원 경영', '제약·바이오 산업', '의료 AI', '헬스케어'],
  publishingPrinciples: 'https://drnews.co.kr/about',
  address: {
    '@type': 'PostalAddress',
    streetAddress: PUBLICATION.address,
    addressLocality: '서울',
    addressCountry: 'KR',
  },
  telephone: PUBLICATION.tel,
  email: PUBLICATION.adEmail,
  founder: {
    '@type': 'Person',
    name: PUBLICATION.publisher,
    url: 'https://drnews.co.kr/author/kim-young-hak',
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-navy mb-2">회사소개</h1>
        <p className="text-sm text-gray-500 mb-8">
          의료 전문 뉴스·저널 Dr.News(닥터뉴스)의 매체 소개와 발행 정보입니다.
        </p>

        <div className="space-y-8">
          {/* 1. 매체 소개 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">매체 소개</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Dr.News(닥터뉴스)는 2007년 1월 8일 창간한 의료 전문 뉴스이자 의료 전문 저널입니다.
              정책·학술·병의원·산업·문화AI·제약바이오 분야를 취재하며, 의사·병원 경영진·제약업계
              종사자에게 신속하고 정확한 의료계 소식을 전달합니다.
            </p>
          </section>

          {/* 2. 취재 분야 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">취재 분야</h2>
            <ul className="space-y-3">
              {COVERAGE.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm font-bold text-navy hover:underline"
                  >
                    {category.name}
                  </Link>
                  <p className="text-sm text-gray-600 leading-relaxed">{category.seoDescription}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. 편집 원칙 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">편집 원칙</h2>
            <ul className="space-y-3">
              {PRINCIPLES.map((p) => (
                <li key={p.h}>
                  <span className="text-sm font-bold text-gray-900">{p.h}</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* 4. 발행 정보 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">발행 정보</h2>
            <table className="w-full text-sm text-left border-t border-gray-200">
              <tbody>
                {PUBLICATION_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-gray-100 align-top">
                    <th scope="row" className="py-2 pr-4 w-36 font-medium text-gray-900 whitespace-nowrap">
                      {row.label}
                    </th>
                    <td className="py-2 text-gray-600 leading-relaxed">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
