#!/usr/bin/env node
/**
 * 한국의약통신(kmpnews.co.kr) 기사 크롤러
 * 김영학 대기자 기사 → Dr.News 마이그레이션용
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://www.kmpnews.co.kr';
const AUTHOR_ID = 'kyh63'; // 김영학 대기자
const OUTPUT_DIR = path.join(__dirname, '../data/crawled/kmpnews');

// Dr.News 카테고리 매핑
const CATEGORY_MAP = {
  '정책·제도': '정책',
  '의료·병원': '병원',
  '약사·약국': '산업',
  '제약·유통': '제약·바이오',
  '해외뉴스': '해외뉴스',
  '단체·사람들': '산업',
  '문화·라이프': '산업',
  '기획특집': '산업',
  '칼럼': '오피니언',
  '인터뷰': '병원',
  '학술': '학술',
};

// 키워드 기반 카테고리 추론
function inferCategory(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  if (/정책|법안|국회|복지부|식약처|보건복지|규제|제도/.test(text)) return '정책';
  if (/학회|학술|연구|논문|임상|시험|발표/.test(text)) return '학술';
  if (/병원|의료원|센터|의사|전공의|수술|진료/.test(text)) return '병원';
  if (/ai|인공지능|디지털|빅데이터|플랫폼/.test(text)) return 'AI';
  if (/제약|바이오|신약|허가|승인|fda|품목|의약품|백신|치료제/.test(text)) return '제약·바이오';
  if (/미국|유럽|일본|중국|글로벌|해외/.test(text)) return '해외뉴스';
  if (/칼럼|기고|의견|논평/.test(text)) return '오피니언';
  
  return '산업'; // 기본값
}

// fetch with promise
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// 기사 목록 페이지에서 기사 링크 추출
function extractArticleLinks(html) {
  const articles = [];
  // idxno=숫자 패턴 찾기
  const regex = /articleView\.html\?idxno=(\d+)/g;
  const seen = new Set();
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const idxno = match[1];
    if (!seen.has(idxno)) {
      seen.add(idxno);
      articles.push({
        idxno,
        url: `${BASE_URL}/news/articleView.html?idxno=${idxno}`,
      });
    }
  }
  
  return articles;
}

// 기사 본문 파싱
function parseArticle(html, idxno) {
  if (!html) return null;
  
  // 저자 확인 (김영학 대기자 기사만)
  // og:article:author 메타 태그에서 확인
  const authorMeta = html.match(/<meta\s+property="og:article:author"\s+content="([^"]+)"/i);
  const authorName = authorMeta ? authorMeta[1] : '';
  
  if (!authorName.includes('김영학')) {
    return null; // 김영학 대기자 기사 아니면 스킵
  }
  
  // 제목 추출
  const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                     html.match(/<h3[^>]*class="[^"]*heading[^"]*"[^>]*>([^<]+)</i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  // 카테고리 추출 (og:article:section 또는 breadcrumb)
  const categoryMatch = html.match(/<meta\s+property="og:article:section"\s+content="([^"]+)"/i) ||
                        html.match(/class="[^"]*category[^"]*"[^>]*>([^<]+)</i);
  const originalCategory = categoryMatch ? categoryMatch[1].trim() : '';
  
  // 날짜 추출
  const dateMatch = html.match(/입력\s*(\d{4}\.\d{2}\.\d{2}\s*\d{2}:\d{2})/);
  const publishedAt = dateMatch ? dateMatch[1] : '';
  
  // 본문 추출 (article-body, article_body 등)
  let content = '';
  const bodyMatch = html.match(/<div[^>]*id="article-view-content-div"[^>]*>([\s\S]*?)<\/div>/i) ||
                    html.match(/<div[^>]*class="[^"]*article[_-]?body[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                    html.match(/<div[^>]*itemprop="articleBody"[^>]*>([\s\S]*?)<\/div>/i);
  
  if (bodyMatch) {
    content = bodyMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&lsquo;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&copy;/g, '©')
      .replace(/&trade;/g, '™')
      .replace(/&reg;/g, '®')
      .replace(/&middot;/g, '·')
      .replace(/&hellip;/g, '…')
      .replace(/&ndash;/g, '–')
      .replace(/&mdash;/g, '—')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  // 썸네일 추출
  const thumbnailMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  const thumbnail = thumbnailMatch ? thumbnailMatch[1] : '';
  
  // 카테고리 매핑
  const category = CATEGORY_MAP[originalCategory] || inferCategory(title, content);
  
  return {
    idxno,
    url: `${BASE_URL}/news/articleView.html?idxno=${idxno}`,
    title,
    content: content.substring(0, 5000), // 5000자 제한
    summary: content.substring(0, 200),
    originalCategory,
    category,
    publishedAt,
    thumbnail,
    author: '김영학',
    source: 'kmpnews',
  };
}

// 날짜 필터 (지난주~오늘)
function isWithinDateRange(dateStr) {
  if (!dateStr) return true; // 날짜 없으면 일단 포함
  
  const today = new Date();
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - 10); // 넉넉하게 10일
  
  const articleDate = new Date(dateStr.replace(/\./g, '-').replace(/\s+/, 'T'));
  return articleDate >= lastWeekStart;
}

// 메인 실행
async function main() {
  console.log('📰 한국의약통신 크롤링 시작...');
  console.log(`👤 기자: 김영학 대기자 (${AUTHOR_ID})`);
  
  // 출력 디렉토리 생성
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const allArticles = [];
  const seenIds = new Set();
  
  // 페이지별 크롤링 (최대 5페이지)
  for (let page = 1; page <= 5; page++) {
    console.log(`\n📄 페이지 ${page} 크롤링...`);
    
    const listUrl = `${BASE_URL}/news/articleList.html?page=${page}&sc_area=I&sc_word=${AUTHOR_ID}&view_type=sm`;
    
    try {
      const listHtml = await fetchUrl(listUrl);
      const links = extractArticleLinks(listHtml);
      
      console.log(`   발견: ${links.length}건`);
      
      for (const link of links) {
        if (seenIds.has(link.idxno)) continue;
        seenIds.add(link.idxno);
        
        try {
          // 속도 제한
          await new Promise(r => setTimeout(r, 500));
          
          const articleHtml = await fetchUrl(link.url);
          const article = parseArticle(articleHtml, link.idxno);
          
          if (article && article.title) {
            // 날짜 필터
            if (!isWithinDateRange(article.publishedAt)) {
              console.log(`   ⏭️  [${article.idxno}] 기간 외 - ${article.publishedAt}`);
              continue;
            }
            
            allArticles.push(article);
            console.log(`   ✅ [${article.idxno}] ${article.title.substring(0, 40)}... → ${article.category}`);
          }
        } catch (err) {
          console.log(`   ❌ [${link.idxno}] 실패: ${err.message}`);
        }
      }
      
      // 오래된 기사가 나오면 중단
      const lastArticle = allArticles[allArticles.length - 1];
      if (lastArticle && !isWithinDateRange(lastArticle.publishedAt)) {
        console.log('\n⏹️  기간 외 기사 발견, 크롤링 종료');
        break;
      }
      
    } catch (err) {
      console.error(`페이지 ${page} 오류:`, err.message);
    }
  }
  
  // 결과 저장
  const outputPath = path.join(OUTPUT_DIR, `kmpnews_${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(allArticles, null, 2), 'utf-8');
  
  console.log(`\n✅ 완료! 총 ${allArticles.length}건 저장`);
  console.log(`📁 ${outputPath}`);
  
  // 카테고리별 통계
  const stats = {};
  allArticles.forEach(a => {
    stats[a.category] = (stats[a.category] || 0) + 1;
  });
  console.log('\n📊 카테고리별 분포:');
  Object.entries(stats).sort((a,b) => b[1] - a[1]).forEach(([cat, cnt]) => {
    console.log(`   ${cat}: ${cnt}건`);
  });
}

main().catch(console.error);
