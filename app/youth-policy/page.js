import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: '청소년 보호정책',
  description: '닥터뉴스(Dr.News) 청소년 보호정책',
  alternates: { canonical: 'https://drnews.co.kr/youth-policy' },
  robots: { index: false },
};

const SECTIONS = [
  {
    h: '1. 목적',
    body: [
      '닥터뉴스(이하 "본지")는 청소년이 유해 정보에 노출되지 않고 안전하게 의료 뉴스를 이용할 수 있도록 「청소년 보호법」 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따라 본 정책을 시행합니다.',
    ],
  },
  {
    h: '2. 유해 정보에 대한 관리',
    body: [
      '· 본지는 의료 전문 보도 목적에 부합하지 않는 청소년 유해 매체물을 게재하지 않습니다.',
      '· 기사·이미지·광고는 게재 전 편집 책임자의 확인을 거치며, 유해성이 확인된 콘텐츠는 지체 없이 삭제합니다.',
      '· 의학적 사진 등 불가피하게 민감할 수 있는 자료는 보도 목적 범위에서 최소한으로 사용합니다.',
    ],
  },
  {
    h: '3. 피해 상담 및 신고',
    body: [
      '청소년 유해 정보로 인한 피해 상담 및 신고는 아래 연락처로 접수할 수 있으며, 본지는 신속히 확인 후 조치합니다.',
    ],
  },
  {
    h: '4. 청소년보호책임자',
    body: [
      '· 책임자: 김영학 (발행인)',
      '· 전화: 02-529-1873',
      '· 이메일: kyh6384@hanmail.com',
    ],
  },
];

export default function YouthPolicyPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-navy mb-8">청소년 보호정책</h1>
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
