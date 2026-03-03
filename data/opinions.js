export const opinions = [
  {
    id: 1,
    title: "의료 AI, 규제와 혁신 사이의 균형점을 찾아서",
    summary: "인공지능 의료기기 인허가 제도의 현실과 개선 방향에 대한 제언",
    content: `최근 의료 AI 기술이 빠르게 발전하면서 규제 당국도 새로운 도전에 직면하고 있다. 기존의 의료기기 인허가 체계로는 지속적으로 학습하고 진화하는 AI 기반 소프트웨어를 적절히 평가하기 어렵기 때문이다.

미국 FDA는 이미 '사전승인(Pre-Cert)' 프로그램을 통해 AI 의료기기에 대한 새로운 규제 패러다임을 실험하고 있다. 우리나라도 식약처를 중심으로 적응형 AI 의료기기에 대한 가이드라인을 마련 중이지만, 아직 갈 길이 멀다.

중요한 것은 규제가 혁신을 막아서는 안 된다는 점이다. 동시에 환자 안전이라는 대원칙도 양보할 수 없다. 이 두 가치 사이에서 균형점을 찾는 것이 우리 시대 규제 당국의 숙제다.`,
    author: "박규제",
    authorTitle: "前 식품의약품안전처 의료기기심사부장",
    authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    date: "2026-02-03",
    category: "칼럼",
    isFeatured: true
  },
  {
    id: 2,
    title: "병원 경영, 데이터가 답이다",
    summary: "빅데이터 기반 병원 경영 혁신의 성공 사례와 시사점",
    content: `많은 병원들이 경영 악화로 어려움을 겪고 있다. 인건비 상승, 의료수가 동결, 환자 감소 등 복합적인 요인이 작용하고 있지만, 근본적인 문제는 '감'에 의존하는 경영 관행에 있다.

선진 병원들은 이미 데이터 기반 의사결정으로 전환했다. 환자 동선 분석을 통한 외래 대기시간 단축, 재고 예측 알고리즘을 통한 의약품 관리, AI 기반 인력 배치 최적화 등이 대표적이다.

데이터 경영은 더 이상 선택이 아닌 필수다. 지금 시작하지 않으면 5년 후에는 따라잡을 수 없는 격차가 벌어질 것이다.`,
    author: "이경영",
    authorTitle: "의료경영학 박사 / 헬스케어 컨설턴트",
    authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    date: "2026-02-01",
    category: "기고",
    isFeatured: true
  },
  {
    id: 3,
    title: "의사-환자 관계의 재정립이 필요한 때",
    summary: "정보 비대칭 해소 시대, 새로운 신뢰 구축 방안",
    content: `인터넷과 AI의 발달로 환자들의 의료 정보 접근성이 크게 높아졌다. 과거에는 의사만이 알 수 있었던 전문 지식을 이제 누구나 검색할 수 있게 되었다.

이러한 변화는 의사-환자 관계에도 영향을 미치고 있다. 일부 환자들은 자가 진단 후 처방까지 요구하기도 하고, 의료진의 판단을 의심하는 경우도 늘었다.

하지만 이를 위기가 아닌 기회로 봐야 한다. 정보를 아는 환자와 더 깊이 있는 대화를 나눌 수 있고, 치료 순응도도 높일 수 있다. 핵심은 권위에 기반한 관계에서 신뢰에 기반한 파트너십으로 전환하는 것이다.`,
    author: "김의료",
    authorTitle: "서울대학교 의과대학 교수",
    authorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop",
    date: "2026-01-28",
    category: "칼럼",
    isFeatured: true
  }
];

export const getLatestOpinions = (limit = 2) => {
  return opinions.slice(0, limit);
};

export const getOpinionById = (id) => {
  return opinions.find(opinion => opinion.id === parseInt(id));
};
