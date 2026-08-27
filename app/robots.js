export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Googlebot-News',
        allow: '/',
      },
      // AI 검색·인용 봇 — 기사 인용/출처 노출을 위해 허용
      {
        userAgent: [
          'OAI-SearchBot',
          'ChatGPT-User',
          'Claude-SearchBot',
          'Claude-User',
          'PerplexityBot',
          'Perplexity-User',
        ],
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      // AI 학습용 대량 수집 봇 — 차단
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'CCBot',
          'Google-Extended',
          'Bytespider',
          'meta-externalagent',
          'Applebot-Extended',
          'Amazonbot',
        ],
        disallow: '/',
      },
    ],
    sitemap: [
      'https://drnews.co.kr/sitemap.xml',
      'https://drnews.co.kr/news-sitemap.xml',
    ],
  };
}
