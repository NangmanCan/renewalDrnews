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
      serviceClient
        .from('page_views')
        .select('visitor_id')
        .gte('created_at', startIso)
        .not('visitor_id', 'is', null),
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

    const uniqueVisitorSet = new Set(
      (visitorsResult.data || [])
        .map((row) => row.visitor_id)
        .filter(Boolean)
    );

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

    return NextResponse.json({
      period: normalizedPeriod,
      totalViews: viewsResult.count || 0,
      uniqueVisitors: uniqueVisitorSet.size,
      topArticles,
      bannerStats,
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json({ error: '통계 조회에 실패했습니다.' }, { status: 500 });
  }
}
