import { getArticles } from '@/lib/articles';

export default async function sitemap() {
  const articles = await getArticles();

  // 기사 URL 생성
  const articleUrls = articles.map((article) => ({
    url: `https://drnews.co.kr/article/${article.id}`,
    lastModified: article.modifiedDate || article.date,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // 정적 페이지 URL
  const staticPages = [
    {
      url: 'https://drnews.co.kr',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: 'https://drnews.co.kr/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticPages, ...articleUrls];
}
