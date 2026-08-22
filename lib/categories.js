// 카테고리 slug <-> 표시명 매핑 (SEO 실경로용)
// seoDescription: 카테고리 페이지 메타 설명 (타겟 독자별 검색의도 반영)
export const CATEGORIES = [
  {
    slug: 'policy',
    name: '정책',
    seoDescription:
      '수가·의료법·보건복지부 정책 동향 등 의료정책 뉴스. 개원가와 병원 경영진이 알아야 할 제도 변화를 신속히 전합니다.',
  },
  {
    slug: 'academic',
    name: '학술',
    seoDescription:
      '학회·논문·연구 동향 등 의학 학술 뉴스. 임상 현장에 필요한 최신 의학 지견을 정리합니다.',
  },
  {
    slug: 'hospital',
    name: '병의원',
    seoDescription:
      '병원 경영·개원가·전공의·인사 소식 등 병의원 뉴스. 대학병원부터 동네 의원까지 의료 현장을 취재합니다.',
  },
  {
    slug: 'industry',
    name: '산업',
    seoDescription:
      '헬스케어 산업·의료기기·디지털 헬스 뉴스. 의료 산업의 투자와 기술 흐름을 짚습니다.',
  },
  {
    slug: 'ai',
    name: '문화AI',
    seoDescription:
      '의료 AI·디지털 전환·의료계 문화 뉴스. 기술과 문화가 바꾸는 진료 현장을 다룹니다.',
  },
  {
    slug: 'pharma-bio',
    name: '제약·바이오',
    seoDescription:
      '제약사 실적·신약·임상·바이오 뉴스. 제약바이오 업계 종사자를 위한 산업 소식입니다.',
  },
  {
    slug: 'global',
    name: '해외뉴스',
    seoDescription:
      '글로벌 의료 정책·해외 학술·산업 뉴스. 세계 의료계 흐름을 국내 시각으로 전합니다.',
  },
  {
    slug: 'opinion',
    name: '오피니언',
    seoDescription:
      '의료계 전문가 칼럼·기고·사설. 현장의 목소리와 정책 제언을 싣습니다.',
  },
];

// slug로 카테고리 조회 (없으면 undefined)
export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}

// 표시명으로 slug 조회 (없으면 undefined)
export function getSlugByName(name) {
  return CATEGORIES.find((c) => c.name === name)?.slug;
}
