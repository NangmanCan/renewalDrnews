import { getArticles } from '@/lib/articles';

export const runtime = 'edge';
export const revalidate = 3600; // 1시간마다 재생성

export async function GET() {
  const articles = await getArticles();

  // 48시간 이내 기사만 필터링
  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const recentArticles = articles.filter((article) => {
    const articleDate = new Date(article.date);
    return articleDate >= fortyEightHoursAgo;
  });

  // Google News Sitemap XML 생성
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentArticles
  .map(
    (article) => `  <url>
    <loc>https://drnews.co.kr/article/${article.id}</loc>
    <news:news>
      <news:publication>
        <news:name>Dr.News</news:name>
        <news:language>ko</news:language>
      </news:publication>
      <news:publication_date>${new Date(article.date).toISOString()}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
      <news:keywords>${escapeXml(article.tags?.join(', ') || article.category)}</news:keywords>
    </news:news>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

// XML 특수문자 이스케이프
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
