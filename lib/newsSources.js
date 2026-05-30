// 의료 뉴스 RSS 소스 목록
export const NEWS_SOURCES = [
  // 국내
  {
    name: '메디게이트뉴스',
    region: '국내',
    url: 'https://www.medigatenews.com/rss',
  },
  {
    name: '의학신문',
    region: '국내',
    url: 'https://www.bosa.co.kr/rss/allArticle.xml',
  },
  {
    name: '청년의사',
    region: '국내',
    url: 'https://www.docdocdoc.co.kr/rss/allArticle.xml',
  },
  {
    name: '구글뉴스 의료',
    region: '국내',
    url: 'https://news.google.com/rss/search?q=의료+건강&hl=ko&gl=KR&ceid=KR:ko',
  },
  {
    name: '의협신문',
    region: '국내',
    url: 'https://www.doctorsnews.co.kr/rss/allArticle.xml',
  },
  // 해외
  {
    name: 'WHO News',
    region: '해외',
    url: 'https://www.who.int/rss-feeds/news-english.xml',
  },
  {
    name: 'Nature Medicine',
    region: '해외',
    url: 'https://www.nature.com/nm.rss',
  },
  {
    name: 'STAT News',
    region: '해외',
    url: 'https://www.statnews.com/feed/',
  },
  {
    name: 'The Lancet',
    region: '해외',
    url: 'https://www.thelancet.com/rssfeed/lancet_online.xml',
  },
  {
    name: 'Google Health News',
    region: '해외',
    url: 'https://news.google.com/rss/search?q=medical+health&hl=en&gl=US&ceid=US:en',
  },
  // 권위 연구지 (저널)
  {
    name: 'NEJM (뉴잉글랜드 의학저널)',
    region: '저널',
    url: 'https://www.nejm.org/action/showFeed?type=etoc&feed=rss&jc=nejm',
  },
  {
    name: 'JAMA (미국의사협회지)',
    region: '저널',
    url: 'https://jamanetwork.com/rss/site_3/67.xml',
  },
  {
    name: 'Nature',
    region: '저널',
    url: 'https://www.nature.com/nature.rss',
  },
  {
    name: 'Cell',
    region: '저널',
    url: 'https://www.cell.com/cell/current.rss',
  },
  // 제약·바이오 전문
  {
    name: 'FiercePharma',
    region: '제약',
    url: 'https://www.fiercepharma.com/rss/xml',
  },
  {
    name: 'FierceBiotech',
    region: '제약',
    url: 'https://www.fiercebiotech.com/rss/xml',
  },
  {
    name: 'Pharmaceutical Technology',
    region: '제약',
    url: 'https://www.pharmaceutical-technology.com/feed/',
  },
  {
    name: '히트뉴스',
    region: '제약',
    url: 'https://www.hitnews.co.kr/rss/allArticle.xml',
  },
  // 정부 (보도자료)
  {
    name: '보건복지부',
    region: '정부',
    url: 'https://www.mohw.go.kr/rss/board.es?mid=a10503000000&bid=0027&info',
  },
  {
    name: '식품의약품안전처',
    region: '정부',
    url: 'https://www.mfds.go.kr/www/rss/brd.do?brdId=ntc0021',
  },
  {
    name: '질병관리청',
    region: '정부',
    url: 'https://www.kdca.go.kr/bbs/kdca/41/rssList.do?row=50',
  },
  {
    name: '건강보험심사평가원',
    region: '정부',
    type: 'scraper',
    scraper: 'hira_press',
    url: 'https://www.hira.or.kr/bbsDummy.do?pgmid=HIRAA020041000100',
  },
];
