#!/usr/bin/env node
/**
 * Dr.News 기존 사이트 크롤러
 * 3월 기사 마이그레이션용
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://drnews.co.kr';
const OUTPUT_DIR = path.join(__dirname, '../data/crawled');

// EUC-KR → UTF-8 변환하며 fetch
function fetchPage(url) {
  try {
    const result = execSync(`curl -s "${url}" | iconv -f euc-kr -t utf-8 2>/dev/null`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    });
    return result;
  } catch (e) {
    console.error(`Failed to fetch: ${url}`);
    return null;
  }
}

// 메인 페이지에서 기사 링크 추출
function extractArticleLinks(html) {
  const regex = /href=["']?\/?sub2\.htm\?cate1_no=(\d+)&cate2_no=(\d+)&news_no=(\d+)["']?/g;
  const links = new Set();
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const [_, cate1, cate2, newsNo] = match;
    links.add({
      url: `${BASE_URL}/sub2.htm?cate1_no=${cate1}&cate2_no=${cate2}&news_no=${newsNo}`,
      cate1,
      cate2,
      newsNo,
    });
  }
  
  return Array.from(links);
}

// 기사 상세 파싱
function parseArticle(html, meta) {
  if (!html) return null;
  
  // 날짜 추출: 기자   / 2026-03-03 17:42:52
  const dateMatch = html.match(/기자\s*\/\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
  if (!dateMatch) return null;
  
  const dateStr = dateMatch[1];
  const timeStr = dateMatch[2];
  
  // 3월 기사만 필터링
  if (!dateStr.startsWith('2026-03')) {
    return null;
  }
  
  // 제목 추출: <td class="t2">제목</td>
  const titleMatch = html.match(/<td[^>]*class=["']?t2["']?[^>]*>([^<]+)<\/td>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;
  if (!title) return null;
  
  // 기자명 추출
  const authorMatch = html.match(/([가-힣]+)\s*\(<a[^>]*href=["']?mailto:[^"']+["']?[^>]*>[^<]+<\/a>\)\s*기자/);
  const author = authorMatch ? authorMatch[1] + ' 기자' : '닥터뉴스';
  
  // 본문 추출: <br /> 로 연결된 본문 찾기
  // 기자 날짜 라인 이후부터 파싱
  const contentStart = html.indexOf(dateMatch[0]);
  if (contentStart === -1) return null;
  
  // 본문 영역 추출 (날짜 라인 이후 ~ 광고 전)
  let contentHtml = html.substring(contentStart + dateMatch[0].length);
  
  // 광고나 footer 전까지만
  const endMarkers = ['<form', '<!-- 광고', '기사제보', '관련기사', '<table', '저작권'];
  let endIdx = contentHtml.length;
  for (const marker of endMarkers) {
    const idx = contentHtml.indexOf(marker);
    if (idx > 100 && idx < endIdx) endIdx = idx;
  }
  contentHtml = contentHtml.substring(0, endIdx);
  
  // HTML → 텍스트 변환
  let content = contentHtml
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
  
  // 너무 짧으면 스킵
  if (content.length < 50) return null;
  
  // 이미지 추출
  const imageMatch = html.match(/<img[^>]*src=["']([^"']*(?:news_photo|upload)[^"']*)["']/i);
  const image = imageMatch 
    ? (imageMatch[1].startsWith('http') ? imageMatch[1] : `${BASE_URL}${imageMatch[1]}`) 
    : null;
  
  return {
    id: meta.newsNo,
    title,
    content,
    author,
    date: `${dateStr}T${timeStr}`,
    category: getCategoryName(meta.cate2),
    image,
    originalUrl: meta.url,
  };
}

// 카테고리 매핑
function getCategoryName(cate2) {
  const categories = {
    '7': '정책',
    '6': '병원',
    '9': '학술',
    '10': '산업',
    '12': 'AI',
    '13': '제약·바이오',
    '14': '해외뉴스',
    '15': '인터뷰',
    '16': '화제',
    '17': '사설',
    '18': '칼럼',
    '19': '신제품',
    '32': '메디포토',
    '33': '닥터빅라운지',
  };
  return categories[cate2] || '기타';
}

// 전체 기사 목록 페이지 탐색 (페이지네이션)
async function crawlAllPages() {
  console.log('📰 Dr.News 크롤링 시작...\n');
  
  // 출력 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const allLinks = new Set();
  
  // 메인 페이지에서 링크 수집
  console.log('1️⃣ 메인 페이지 스캔...');
  const mainHtml = fetchPage(`${BASE_URL}/main.htm`);
  if (mainHtml) {
    extractArticleLinks(mainHtml).forEach(link => {
      allLinks.add(JSON.stringify(link));
    });
  }
  
  // 카테고리별 목록 페이지 스캔 (여러 페이지)
  const categories = [
    { cate1: 14, cate2: 6 },  // 병원
    { cate1: 14, cate2: 7 },  // 정책
    { cate1: 14, cate2: 9 },  // 학술
    { cate1: 14, cate2: 10 }, // 산업
    { cate1: 14, cate2: 12 }, // AI
    { cate1: 14, cate2: 13 }, // 제약바이오
    { cate1: 15, cate2: 15 }, // 인터뷰
    { cate1: 15, cate2: 33 }, // 닥터빅라운지
  ];
  
  console.log('2️⃣ 카테고리 페이지 스캔...');
  for (const cat of categories) {
    for (let page = 1; page <= 5; page++) {
      const url = `${BASE_URL}/sub.htm?cate1_no=${cat.cate1}&cate2_no=${cat.cate2}&page=${page}`;
      const html = fetchPage(url);
      if (html && !html.includes('404')) {
        extractArticleLinks(html).forEach(link => {
          allLinks.add(JSON.stringify(link));
        });
      }
    }
  }
  
  const links = Array.from(allLinks).map(s => JSON.parse(s));
  console.log(`\n📋 총 ${links.length}개 기사 링크 발견\n`);
  
  // 기사 상세 크롤링
  console.log('3️⃣ 기사 상세 크롤링...');
  const articles = [];
  
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    process.stdout.write(`\r   진행: ${i + 1}/${links.length}`);
    
    const html = fetchPage(link.url);
    const article = parseArticle(html, link);
    
    if (article && article.content) {
      articles.push(article);
    }
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(`\n\n✅ 3월 기사 ${articles.length}개 수집 완료!\n`);
  
  // 결과 저장
  const outputPath = path.join(OUTPUT_DIR, 'march-2026-articles.json');
  fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2), 'utf-8');
  console.log(`💾 저장됨: ${outputPath}`);
  
  // 요약 출력
  console.log('\n📊 카테고리별 기사 수:');
  const byCategory = {};
  articles.forEach(a => {
    byCategory[a.category] = (byCategory[a.category] || 0) + 1;
  });
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count}개`);
  });
  
  return articles;
}

// 실행
crawlAllPages().catch(console.error);
