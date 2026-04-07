import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  isArray: (name) => name === 'item' || name === 'entry',
});

// HTML 태그 제거 및 텍스트 정리
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 텍스트 값 추출 (객체일 수 있음)
function extractText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value['#text']) return value['#text'];
  return String(value);
}

// 이미지 URL 추출
function extractImage(item) {
  // enclosure 태그
  if (item.enclosure?.['@_url']) return item.enclosure['@_url'];
  // media:content
  if (item['media:content']?.['@_url']) return item['media:content']['@_url'];
  // media:thumbnail
  if (item['media:thumbnail']?.['@_url']) return item['media:thumbnail']['@_url'];
  // description 내 첫 img 태그
  const desc = extractText(item.description);
  const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) return imgMatch[1];
  return null;
}

/**
 * RSS/Atom XML을 파싱하여 뉴스 아이템 배열 반환
 */
export function parseRssXml(xml, sourceName, sourceRegion) {
  const parsed = parser.parse(xml);

  // RSS 2.0
  let items = parsed?.rss?.channel?.item;
  // Atom
  if (!items) items = parsed?.feed?.entry;
  // RDF
  if (!items) items = parsed?.['rdf:RDF']?.item;

  if (!items) return [];
  if (!Array.isArray(items)) items = [items];

  return items.map((item) => {
    const title = stripHtml(extractText(item.title));
    const summary = stripHtml(extractText(item.description || item.summary || item.content || ''));
    const link = extractText(item.link?.['@_href'] || item.link || '');
    const pubDateRaw = extractText(item.pubDate || item.published || item.updated || item['dc:date'] || '');
    const imageUrl = extractImage(item);

    let pubDate = null;
    if (pubDateRaw) {
      const d = new Date(pubDateRaw);
      if (!isNaN(d.getTime())) pubDate = d.toISOString();
    }

    return {
      source_name: sourceName,
      source_region: sourceRegion,
      title: title.slice(0, 500),
      summary: summary.slice(0, 1000),
      link,
      pub_date: pubDate,
      image_url: imageUrl,
    };
  }).filter((item) => item.title && item.link);
}

/**
 * URL에서 RSS 피드를 가져와 파싱
 */
export async function fetchAndParseRss(source) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DrNews-Bot/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    let xml;

    // EUC-KR 인코딩 처리
    if (contentType.includes('euc-kr') || contentType.includes('EUC-KR')) {
      const buffer = await res.arrayBuffer();
      xml = new TextDecoder('euc-kr').decode(buffer);
    } else {
      xml = await res.text();
    }

    return parseRssXml(xml, source.name, source.region);
  } finally {
    clearTimeout(timeoutId);
  }
}
