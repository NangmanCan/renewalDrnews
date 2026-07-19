import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const runtime = 'edge';

const PERIODS = {
  today: 1,
  week: 7,
  month: 30,
};

function getPeriodStartIso(period) {
  const days = PERIODS[period] || PERIODS.today;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start.toISOString();
}

export async function GET(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({
      period: 'today',
      totalViews: 0,
      uniqueVisitors: 0,
      topArticles: [],
      bannerStats: [],
      dailySeries: [],
      topArticlesPeriod: [],
      referrers: [],
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';
    const normalizedPeriod = PERIODS[period] ? period : 'today';
    const startIso = getPeriodStartIso(normalizedPeriod);

    const [viewsResult, visitorsResult, articlesResult, bannersResult] = await Promise.all([
      serviceClient
        .from('page_views')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startIso),
      // 순 방문자 수: RPC로 COUNT(DISTINCT) — 기존 JS Set(1000행 리밋) 버그 수정
      serviceClient.rpc('analytics_unique_visitors', { start_ts: startIso }),
      serviceClient
        .from('articles')
        .select('id,title,views')
        .order('views', { ascending: false })
        .limit(10),
      serviceClient
        .from('banners')
        .select('id,title,type,advertiser,impressions,clicks')
        .order('impressions', { ascending: false })
        .limit(50),
    ]);

    if (viewsResult.error) throw viewsResult.error;
    if (visitorsResult.error) throw visitorsResult.error;
    if (articlesResult.error) throw articlesResult.error;
    if (bannersResult.error) throw bannersResult.error;

    // RPC(analytics_unique_visitors)는 정수 스칼라를 반환
    const uniqueVisitors = Number(visitorsResult.data) || 0;

    const topArticles = (articlesResult.data || []).map((article) => ({
      id: article.id,
      title: article.title,
      views: article.views || 0,
    }));

    const bannerStats = (bannersResult.data || []).map((banner) => {
      const impressions = banner.impressions || 0;
      const clicks = banner.clicks || 0;
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      return {
        id: banner.id,
        title: banner.title,
        type: banner.type,
        advertiser: banner.advertiser,
        impressions,
        clicks,
        ctr,
      };
    });

    // 최근 30일 추이 (기간 파라미터와 무관하게 항상 30일)
    let dailySeries = [];
    try {
      const { data, error } = await serviceClient.rpc('analytics_daily_series', { days: 30 });
      if (error) throw error;
      dailySeries = (data || []).map((row) => ({
        day: row.day,
        views: Number(row.views) || 0,
        visitors: Number(row.visitors) || 0,
      }));
    } catch (err) {
      console.error('Error fetching daily series:', err);
      dailySeries = [];
    }

    // 기간별 인기 기사 TOP 10 (page_views 원본 집계 + articles 제목 병합)
    let topArticlesPeriod = [];
    try {
      const { data, error } = await serviceClient.rpc('analytics_top_articles', {
        start_ts: startIso,
        lim: 10,
      });
      if (error) throw error;
      const rows = data || [];
      const ids = rows.map((row) => row.article_id).filter((id) => id != null);
      let titleMap = {};
      if (ids.length > 0) {
        const { data: titleRows, error: titleErr } = await serviceClient
          .from('articles')
          .select('id,title')
          .in('id', ids);
        if (titleErr) throw titleErr;
        titleMap = (titleRows || []).reduce((acc, article) => {
          acc[article.id] = article.title;
          return acc;
        }, {});
      }
      topArticlesPeriod = rows.map((row) => ({
        id: row.article_id,
        title: titleMap[row.article_id] || '(삭제된 기사)',
        views: Number(row.view_count) || 0,
      }));
    } catch (err) {
      console.error('Error fetching period top articles:', err);
      topArticlesPeriod = [];
    }

    // 유입 경로 (검색 등록 효과 측정)
    let referrers = [];
    try {
      const { data, error } = await serviceClient.rpc('analytics_referrer_stats', {
        start_ts: startIso,
      });
      if (error) throw error;
      referrers = (data || []).map((row) => ({
        source: row.source,
        count: Number(row.cnt) || 0,
      }));
    } catch (err) {
      console.error('Error fetching referrer stats:', err);
      referrers = [];
    }

    return NextResponse.json({
      period: normalizedPeriod,
      totalViews: viewsResult.count || 0,
      uniqueVisitors,
      topArticles,
      bannerStats,
      dailySeries,
      topArticlesPeriod,
      referrers,
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json({ error: '통계 조회에 실패했습니다.' }, { status: 500 });
  }
}
