// 카테고리 slug <-> 표시명 매핑 (SEO 실경로용)
export const CATEGORIES = [
  { slug: 'policy', name: '정책' },
  { slug: 'academic', name: '학술' },
  { slug: 'hospital', name: '병원' },
  { slug: 'industry', name: '산업' },
  { slug: 'ai', name: 'AI' },
  { slug: 'pharma-bio', name: '제약·바이오' },
  { slug: 'global', name: '해외뉴스' },
  { slug: 'opinion', name: '오피니언' },
];

// slug로 카테고리 조회 (없으면 undefined)
export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}

// 표시명으로 slug 조회 (없으면 undefined)
export function getSlugByName(name) {
  return CATEGORIES.find((c) => c.name === name)?.slug;
}
