import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '개인정보 처리방침',
  description: '닥터뉴스(Dr.News) 개인정보 처리방침',
  alternates: { canonical: 'https://drnews.co.kr/privacy' },
  robots: { index: false },
};

const SECTIONS = [
  {
    h: '1. 수집하는 개인정보와 수집 방법',
    body: [
      '닥터뉴스(이하 "본지")는 회원제를 운영하지 않으며, 서비스 이용 과정에서 다음 정보가 자동으로 생성·수집될 수 있습니다.',
      '· 방문 기록: 방문 일시, 열람한 페이지 주소, 유입 경로(리퍼러), 브라우저·기기 정보(User-Agent)',
      '· 방문자 구분값: 통계 목적의 무작위 식별자(쿠키가 아닌 브라우저 저장소에 저장되며, 이름·연락처 등 신원 정보와 연결되지 않습니다)',
      '· 광고·제보 문의 시: 이용자가 이메일로 직접 제공한 정보(이메일 주소, 문의 내용)',
    ],
  },
  {
    h: '2. 수집 목적',
    body: [
      '· 서비스 이용 통계 분석 및 품질 개선 (방문자 수, 인기 기사, 유입 경로 집계)',
      '· 광고 게재 성과(노출·클릭 수) 집계',
      '· 문의 응대',
    ],
  },
  {
    h: '3. 보유 및 이용 기간',
    body: [
      '· 방문 기록·통계 데이터: 수집일로부터 통계 목적 달성 시까지 보관하며, 이용자는 브라우저 저장소를 삭제하여 방문자 구분값을 언제든 초기화할 수 있습니다.',
      '· 이메일 문의: 응대 완료 후 지체 없이 파기합니다.',
    ],
  },
  {
    h: '4. 제3자 제공 및 처리 위탁',
    body: [
      '본지는 개인정보를 제3자에게 판매·제공하지 않습니다. 서비스 운영을 위해 다음 인프라 사업자에게 데이터 보관·처리를 위탁합니다.',
      '· Cloudflare, Inc. (웹사이트 호스팅·보안)',
      '· Supabase, Inc. (데이터베이스 호스팅)',
    ],
  },
  {
    h: '5. 이용자의 권리',
    body: [
      '이용자는 자신의 정보에 대한 열람·정정·삭제를 아래 연락처로 요청할 수 있으며, 본지는 지체 없이 조치합니다.',
    ],
  },
  {
    h: '6. 개인정보 보호책임자',
    body: [
      '· 책임자: 김영학 (발행인)',
      '· 전화: 02-529-1873',
      '· 이메일: kyh6384@hanmail.com',
    ],
  },
  {
    h: '7. 고지 의무',
    body: [
      '본 방침의 내용이 변경되는 경우 시행 7일 전부터 본 페이지를 통해 고지합니다.',
      '· 시행일: 2026년 7월 22일',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-navy mb-2">개인정보 처리방침</h1>
        <p className="text-sm text-gray-500 mb-8">
          닥터뉴스(Dr.News)는 「개인정보 보호법」 등 관계 법령을 준수하며, 이용자의 개인정보를 다음과 같이 처리합니다.
        </p>
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="text-base font-bold text-gray-900 mb-2">{s.h}</h2>
              {s.body.map((line, i) => (
                <p key={i} className="text-sm text-gray-600 leading-relaxed mb-1">{line}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
