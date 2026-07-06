import { getArticles } from '@/lib/articles';

export const runtime = 'edge';
export const revalidate = 300; // 5분마다 재생성

// XML 특수문자 이스케이프
function escapeXml(unsafe) {
  if (unsafe == null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const articles = await getArticles().catch(() => []);

  // 최신 기사 50건
  const items = articles.slice(0, 50);

  const rssItems = items
    .map((article) => {
      const link = `https://drnews.co.kr/article/${article.id}`;
      const pubDate = new Date(article.publishedAt || article.date || Date.now()).toUTCString();
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(article.summary || '')}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(article.category || '')}</category>
      <dc:creator>${escapeXml(article.author || 'Dr.News')}</dc:creator>
    </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Dr.News - 의료 전문 뉴스</title>
    <link>https://drnews.co.kr</link>
    <description>Dr.News는 정책, 학술, 병원, 산업 분야의 의료 전문 뉴스를 제공합니다.</description>
    <language>ko</language>
${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
