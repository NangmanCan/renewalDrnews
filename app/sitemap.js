import { getArticles } from '@/lib/articles';
import { getCeoReports } from '@/lib/ceoReports';
import { getOpinions } from '@/lib/opinions';
import { CATEGORIES } from '@/lib/categories';

export default async function sitemap() {
  // 각 lib 호출은 실패 시 빈배열/정적 fallback을 반환하므로 개별 방어 처리
  const [articles, ceoReports, opinions] = await Promise.all([
    getArticles().catch(() => []),
    getCeoReports(1000).catch(() => []),
    getOpinions().catch(() => []),
  ]);

  // 기사 URL
  const articleUrls = articles.map((article) => ({
    url: `https://drnews.co.kr/article/${article.id}`,
    lastModified: article.modifiedAt || article.publishedAt || article.date,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // CEO 리포트 상세 URL
  const ceoReportUrls = ceoReports.map((report) => ({
    url: `https://drnews.co.kr/ceo-report/${report.id}`,
    lastModified: report.date || new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // 오피니언 상세 URL
  const opinionUrls = opinions.map((opinion) => ({
    url: `https://drnews.co.kr/opinion/${opinion.id}`,
    lastModified: opinion.created_at || opinion.date || new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // 카테고리 실경로 URL
  const categoryUrls = CATEGORIES.map((category) => ({
    url: `https://drnews.co.kr/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
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
      url: 'https://drnews.co.kr/news',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: 'https://drnews.co.kr/ceo-report',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  return [...staticPages, ...categoryUrls, ...articleUrls, ...ceoReportUrls, ...opinionUrls];
}
