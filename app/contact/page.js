import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PUBLICATION } from '@/lib/publication';

export const metadata = {
  title: '문의·제보',
  description:
    '의료 전문 뉴스·저널 Dr.News(닥터뉴스) 기사 제보와 광고·제휴 문의 안내. 전화와 이메일로 의료계 현장의 제보를 받습니다.',
  alternates: { canonical: 'https://drnews.co.kr/contact' },
  openGraph: {
    type: 'website',
    url: 'https://drnews.co.kr/contact',
    title: '문의·제보',
    description: 'Dr.News(닥터뉴스) 기사 제보·광고 문의 연락처 안내.',
    locale: 'ko_KR',
    siteName: 'Dr.News',
  },
};

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

const contactPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Dr.News 문의·제보',
  description:
    '의료 전문 뉴스·저널 Dr.News(닥터뉴스)의 기사 제보, 광고·제휴 문의, 독자 의견 접수 안내.',
  url: 'https://drnews.co.kr/contact',
  inLanguage: 'ko-KR',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Dr.News',
    url: 'https://drnews.co.kr',
  },
  mainEntity: {
    '@type': 'NewsMediaOrganization',
    name: 'Dr.News',
    alternateName: '닥터뉴스',
    url: 'https://drnews.co.kr',
    logo: 'https://drnews.co.kr/logo.png',
    telephone: PUBLICATION.tel,
    email: PUBLICATION.adEmail,
    address: {
      '@type': 'PostalAddress',
      streetAddress: PUBLICATION.address,
      addressLocality: '서울',
      addressCountry: 'KR',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: PUBLICATION.tel,
        email: PUBLICATION.adEmail,
        availableLanguage: 'Korean',
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: PUBLICATION.tel,
        email: PUBLICATION.adEmail,
        availableLanguage: 'Korean',
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-navy mb-2">문의·제보</h1>
        <p className="text-sm text-gray-500 mb-8">
          Dr.News(닥터뉴스)에 기사를 제보하거나 광고·제휴를 문의하실 수 있습니다.
        </p>

        <div className="space-y-8">
          {/* 1. 기사 제보 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">기사 제보</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              의료계 현장의 제보를 기다립니다. 정책 시행 과정에서 겪은 문제, 병원과 개원가의 현안,
              학회·연구 성과, 제약바이오 업계 소식 등 기사로 다뤄야 할 사안이 있다면 언제든 알려주십시오.
              전화 또는 이메일로 접수하며, 취재가 필요하다고 판단되면 담당 기자가 직접 연락드립니다.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              제보자의 신원과 제보 내용은 취재 목적 외에는 사용하지 않으며, 요청하시면 익명으로
              처리합니다. 제보 시 사실 관계 확인에 도움이 되는 자료(공문·사진·녹취 등)를 함께
              보내주시면 보도까지의 시간을 줄일 수 있습니다.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-gray-600">
              <li>
                <span className="font-medium text-gray-900">전화</span>{' '}
                <a href={`tel:${PUBLICATION.tel.replace(/-/g, '')}`} className="text-navy hover:underline">
                  {PUBLICATION.tel}
                </a>
              </li>
              <li>
                <span className="font-medium text-gray-900">이메일</span>{' '}
                <a href={`mailto:${PUBLICATION.adEmail}`} className="text-navy hover:underline">
                  {PUBLICATION.adEmail}
                </a>
              </li>
            </ul>
          </section>

          {/* 2. 광고·제휴 문의 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">광고·제휴 문의</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              배너 광고, 기획 기사, 세미나·학술행사 협찬, 콘텐츠 제휴 등을 상담해 드립니다.
              희망하시는 노출 지면과 기간, 예산 범위를 함께 알려주시면 매체 소개서와 단가표를
              보내드립니다. 광고와 기사는 분리해 운영하며, 광고성 콘텐츠에는 광고 표기를 명시합니다.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-gray-600">
              <li>
                <span className="font-medium text-gray-900">광고 문의</span>{' '}
                <a href={`mailto:${PUBLICATION.adEmail}`} className="text-navy hover:underline">
                  {PUBLICATION.adEmail}
                </a>
              </li>
              <li>
                <span className="font-medium text-gray-900">전화</span>{' '}
                <a href={`tel:${PUBLICATION.tel.replace(/-/g, '')}`} className="text-navy hover:underline">
                  {PUBLICATION.tel}
                </a>
              </li>
            </ul>
          </section>

          {/* 3. 독자 의견 */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">독자 의견</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              기사에 대한 의견, 오류 정정 요청, 반론 보도 요청도 같은 연락처로 받습니다.
              사실과 다른 내용이 확인되면 지체 없이 정정하고 그 경위를 기사에 밝힙니다.
              칼럼·기고를 보내주시면 편집 방향과 지면 사정을 검토해 오피니언 지면에 싣습니다.
              편집 원칙은{' '}
              <Link href="/about" className="text-navy font-bold hover:underline">
                회사소개
              </Link>{' '}
              페이지에서 확인하실 수 있습니다.
            </p>
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
