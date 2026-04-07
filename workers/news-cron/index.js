export default {
  async scheduled(event, env, ctx) {
    console.log('DrNews 크롤링 Cron 실행:', new Date().toISOString());

    try {
      const res = await fetch(`${env.API_BASE_URL}/api/news-sources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': env.CRON_SECRET,
        },
        body: JSON.stringify({ region: 'all' }),
      });

      const data = await res.json();
      console.log('크롤링 결과:', JSON.stringify(data));

      if (!data.success) {
        console.error('크롤링 실패:', data.error);
      }
    } catch (err) {
      console.error('Cron 실행 오류:', err.message);
    }
  },

  // 테스트용 HTTP 핸들러
  async fetch(request, env) {
    return new Response('DrNews Crawl Cron Worker is running.', { status: 200 });
  },
};
