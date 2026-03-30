/**
 * SEO 유틸리티 함수
 */

// 한국어 불용어 목록
const STOPWORDS = new Set([
  '이', '가', '은', '는', '을', '를', '의', '에', '에서', '로', '으로', '와', '과', '도', '만', '까지',
  '부터', '라고', '라며', '라는', '라면', '에게', '한테', '께', '더', '덜', '매우', '아주', '너무',
  '그', '저', '이것', '저것', '그것', '여기', '저기', '거기', '이런', '저런', '그런', '어떤',
  '있다', '없다', '하다', '되다', '이다', '아니다', '같다', '위해', '통해', '대해', '따라',
  '및', '등', '약', '총', '중', '간', '후', '전', '내', '외', '상', '하', '좌', '우',
  '수', '것', '때', '곳', '점', '건', '명', '개', '원', '년', '월', '일', '시', '분', '초',
  '그리고', '그러나', '그래서', '하지만', '또한', '또는', '즉', '왜냐하면', '따라서', '그러므로',
  '뿐', '만큼', '처럼', '같이', '대로', '밖에', '조차', '마저', '뿐만', '아니라',
  '있는', '없는', '하는', '되는', '된', '할', '한', '하고', '하며', '해서', '했다', '합니다',
  '있습니다', '없습니다', '됩니다', '입니다', '습니다', '니다', '다', '요', '죠',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'of', 'in', 'to', 'for', 'with', 'on', 'at', 'from', 'by', 'about', 'as',
  'and', 'or', 'but', 'if', 'then', 'else', 'when', 'where', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
]);

/**
 * HTML 태그 제거
 */
function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 본문에서 키워드 자동 추출
 * @param {string} content - HTML 본문
 * @param {string} title - 기사 제목
 * @param {number} maxKeywords - 최대 키워드 수 (기본 10)
 * @returns {string[]} 키워드 배열
 */
export function extractKeywords(content, title = '', maxKeywords = 10) {
  const text = stripHtml(content) + ' ' + title;
  
  // 단어 추출 (한글 2글자 이상, 영문 3글자 이상)
  const koreanWords = text.match(/[가-힣]{2,}/g) || [];
  const englishWords = (text.match(/[a-zA-Z]{3,}/g) || []).map(w => w.toLowerCase());
  
  const allWords = [...koreanWords, ...englishWords];
  
  // 빈도수 계산
  const frequency = {};
  for (const word of allWords) {
    if (STOPWORDS.has(word) || STOPWORDS.has(word.toLowerCase())) continue;
    frequency[word] = (frequency[word] || 0) + 1;
  }
  
  // 빈도수 기준 정렬 후 상위 N개
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
  
  return sorted;
}

/**
 * SEO용 description 최적화 (155자)
 * @param {string} text - 원본 텍스트
 * @param {number} maxLength - 최대 길이 (기본 155)
 * @returns {string} 최적화된 description
 */
export function optimizeDescription(text, maxLength = 155) {
  if (!text) return '';
  
  // HTML 태그 제거
  let clean = stripHtml(text);
  
  // 이미 짧으면 그대로
  if (clean.length <= maxLength) return clean;
  
  // 문장 단위로 자르기 시도
  const sentences = clean.split(/[.!?。]/);
  let result = '';
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    
    const next = result ? result + '. ' + trimmed : trimmed;
    if (next.length <= maxLength - 3) {
      result = next;
    } else {
      break;
    }
  }
  
  // 문장 단위로 못 자르면 단어 단위로
  if (!result || result.length < 50) {
    const words = clean.split(/\s+/);
    result = '';
    for (const word of words) {
      const next = result ? result + ' ' + word : word;
      if (next.length <= maxLength - 3) {
        result = next;
      } else {
        break;
      }
    }
  }
  
  return result + '...';
}

/**
 * 기사 전체 SEO 메타데이터 생성
 */
export function generateArticleSEO(article, baseUrl = 'https://drnews.co.kr') {
  const keywords = article.tags?.length > 0 
    ? article.tags 
    : extractKeywords(article.content || '', article.title);
  
  const description = optimizeDescription(article.summary || article.content);
  const canonicalUrl = `${baseUrl}/article/${article.id}`;
  
  return {
    keywords,
    description,
    canonicalUrl,
  };
}
