export const ceoReports = [
  {
    id: 1,
    title: "의료의 본질, 다시 환자 중심으로",
    subtitle: "디지털 전환 시대, 우리가 놓치지 말아야 할 것",
    content: `최근 의료계는 AI, 빅데이터, 원격의료 등 디지털 전환의 거대한 물결 속에 있습니다. 기술의 발전은 분명 환자 치료에 혁신을 가져왔지만, 저는 오히려 이 시점에서 의료의 본질에 대해 다시 생각해 봅니다.

환자가 병원을 찾는 이유는 단순히 질병을 치료받기 위해서만이 아닙니다. 불안한 마음을 위로받고, 자신의 이야기를 들어줄 누군가를 찾아오는 것입니다. 아무리 정교한 AI가 진단을 내리더라도, 환자의 손을 잡고 "괜찮습니다"라고 말해줄 수 있는 것은 오직 사람뿐입니다.

병원 경영자로서 저는 항상 스스로에게 묻습니다. "우리 병원은 환자를 숫자가 아닌 사람으로 보고 있는가?" 이 질문에 자신 있게 "예"라고 답할 수 있는 날까지, 우리의 여정은 계속될 것입니다.`,
    author: "김의료",
    authorTitle: "Dr.News 대표",
    authorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop",
    date: "2026-02-03",
    weekNumber: 5,
    category: "경영철학"
  },
  {
    id: 2,
    title: "리더십은 경청에서 시작된다",
    subtitle: "조직 문화를 바꾸는 힘",
    content: `지난 20년간 의료계에 몸담으면서 수많은 리더들을 만났습니다. 그중 가장 인상 깊었던 분들의 공통점이 있었습니다. 바로 '듣는 힘'이었습니다.

위대한 병원장은 회의실에서 가장 먼저 말하는 사람이 아니라, 가장 나중에 말하는 사람입니다. 모든 구성원의 의견을 경청한 후에야 비로소 자신의 생각을 나눕니다. 이것이 진정한 리더십입니다.

특히 의료 현장에서는 간호사, 행정직원, 청소 직원까지 모든 목소리가 중요합니다. 환자 안전은 어느 한 사람의 영웅적 활약이 아니라, 팀 전체의 소통에서 비롯되기 때문입니다.`,
    author: "김의료",
    authorTitle: "Dr.News 대표",
    authorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop",
    date: "2026-01-27",
    weekNumber: 4,
    category: "리더십"
  },
  {
    id: 3,
    title: "변화를 두려워하지 않는 용기",
    subtitle: "100년 병원을 꿈꾸며",
    content: `얼마 전 일본의 한 100년 된 병원을 방문할 기회가 있었습니다. 그곳에서 저는 '전통'과 '혁신'이 어떻게 공존할 수 있는지 배웠습니다.

그 병원은 창립 이념만큼은 100년 전 그대로였지만, 운영 방식은 최첨단 시스템을 갖추고 있었습니다. 원장님께서 하신 말씀이 아직도 기억에 남습니다. "변하지 않기 위해 변해야 합니다."

역설적이지만 진리입니다. 우리가 지키고자 하는 가치, 즉 환자 중심의 의료를 지키기 위해서는 끊임없이 변화해야 합니다.`,
    author: "김의료",
    authorTitle: "Dr.News 대표",
    authorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop",
    date: "2026-01-20",
    weekNumber: 3,
    category: "경영철학"
  }
];

export const getLatestCeoReport = () => {
  return ceoReports[0];
};

export const getCeoReports = (limit = 3) => {
  return ceoReports.slice(0, limit);
};
