// 건강보험심사평가원 보도자료 HTML 스크래퍼
// HIRA는 공식 RSS를 제공하지 않아 게시판 페이지를 직접 파싱.

const LIST_URL_DEFAULT = 'https://www.hira.or.kr/bbsDummy.do?pgmid=HIRAA020041000100';
const BASE = 'https://www.hira.or.kr/bbsDummy.do';

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export async function fetchHiraPress(source) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(source.url || LIST_URL_DEFAULT, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DrNews-Bot/1.0',
        'Accept': 'text/html,application/xhtml+xml,*/*',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const items = [];
    // 게시판 row: col-num → col-tit(a href=쿼리·제목) → col-date
    const rowRegex = /<td class="col-num">\d+<\/td>[\s\S]*?<td class="col-tit"><a href="(\?[^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<td class="col-date">(\d{4}-\d{2}-\d{2})<\/td>/g;
    let m;
    while ((m = rowRegex.exec(html)) !== null) {
      const [, hrefRaw, titleRaw, date] = m;
      const link = `${BASE}${decodeEntities(hrefRaw)}`;
      const title = decodeEntities(titleRaw).trim();
      if (!title || !link) continue;
      const d = new Date(date);
      const pubDate = isNaN(d.getTime()) ? null : d.toISOString();
      items.push({
        source_name: source.name,
        source_region: source.region,
        title: title.slice(0, 500),
        summary: '',
        link,
        pub_date: pubDate,
        image_url: null,
      });
    }
    return items;
  } finally {
    clearTimeout(timeoutId);
  }
}
