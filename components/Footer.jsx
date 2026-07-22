import Link from 'next/link';

// 신문법상 인터넷신문 필수 표기 (등록증 기준)
const PUBLICATION = {
  name: '닥터뉴스 (Dr.News)',
  address: '서울특별시 강남구 강남대로44길 22 (도곡동 우정빌딩)',
  tel: '02-529-1873',
  registrationNo: '서울, 아00310',
  registrationDate: '2007.01.08',
  publisher: '김영학',
  youthOfficer: '김영학',
  adEmail: 'kyh6384@hanmail.com',
};

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 mt-12">
      {/* 상단 정책 링크 줄 */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px] text-gray-600">
          <a href={`mailto:${PUBLICATION.adEmail}`} className="hover:text-navy">광고 안내</a>
          <Link href="/privacy" className="font-bold text-navy hover:underline">개인정보 처리방침</Link>
          <Link href="/youth-policy" className="hover:text-navy">청소년 보호정책</Link>
        </div>
      </div>

      {/* 하단: 로고 + 등록정보 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-10">
          <div className="flex-shrink-0">
            <div className="text-xl font-extrabold text-navy leading-tight">Dr.News</div>
            <div className="text-xs text-gray-400">닥터뉴스</div>
          </div>

          <div className="text-xs text-gray-500 leading-relaxed space-y-1">
            <p>
              주소 : {PUBLICATION.address} <span className="text-gray-300">|</span> 전화 : {PUBLICATION.tel}{' '}
              <span className="text-gray-300">|</span> 등록번호 : {PUBLICATION.registrationNo}{' '}
              <span className="text-gray-300">|</span> 등록일 : {PUBLICATION.registrationDate}
            </p>
            <p>
              발행인 : {PUBLICATION.publisher} <span className="text-gray-300">|</span> 청소년보호책임자 : {PUBLICATION.youthOfficer}{' '}
              <span className="text-gray-300">|</span> 광고 문의 : {PUBLICATION.adEmail}
            </p>
            <p>
              닥터뉴스의 모든 콘텐츠(기사)는 저작권법의 보호를 받은바, 무단 전재, 복사, 배포 등을 금합니다.
            </p>
            <p className="font-semibold text-gray-600 pt-1">
              Copyright &copy; Dr.News. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
