import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const runtime = 'edge';

const PERIODS = {
  today: 1,
  week: 7,
  month: 30,
};

// KST(UTC+9) 기준 하루의 시작(00:00)을 UTC ISO로 변환.
// KST 00:00 = 같은 날 UTC-9h = 전날 15:00 UTC.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// 프리셋(period) 기간의 시작 ISO 계산 — KST 일 경계 기준
function getPeriodStartIso(period) {
  const days = PERIODS[period] || PERIODS.today;
  // 현재 KST 날짜 자정을 구한 뒤 (days-1)만큼 앞으로
  const nowKst = new Date(Date.now() + KST_OFFSET_MS);
  const y = nowKst.getUTCFullYear();
  const m = nowKst.getUTCMonth();
  const d = nowKst.getUTCDate();
  // KST 자정(오늘) → UTC로 되돌림
  const startKstMidnightUtc = Date.UTC(y, m, d - (days - 1), 0, 0, 0) - KST_OFFSET_MS;
  return new Date(startKstMidnightUtc).toISOString();
}

// 프리셋 기간의 종료 ISO — 항상 "지금" (배타적 상한). 오늘 데이터까지 포함.
function getPeriodEndIso() {
  return new Date().toISOString();
}

// YYYY-MM-DD 문자열을 KST 자정 UTC ISO로 변환 (파싱 실패 시 null)
function parseDateToKstMidnightIso(dateStr, addDays = 0) {
  if (typeof dateStr !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const mo = Number(match[2]);
  const da = Number(match[3]);
  if (mo < 1 || mo > 12 || da < 1 || da > 31) return null;
  // KST 자정 = UTC에서 -9h
  const utcMs = Date.UTC(y, mo - 1, da + addDays, 0, 0, 0) - KST_OFFSET_MS;
  const dt = new Date(utcMs);
  // 유효성 재확인 (예: 2월 30일 등 롤오버 방지)
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

// start/end(YYYY-MM-DD)를 커스텀 범위로 해석. 둘 다 유효하고 start<=end이면 {startIso, endIso} 반환, 아니면 null.
function resolveCustomRange(startStr, endStr) {
  if (!startStr || !endStr) return null;
  const startIso = parseDateToKstMidnightIso(startStr, 0);
  // end는 그 날 포함 → end+1일 KST 자정을 배타적 상한으로 사용
  const endIso = parseDateToKstMidnightIso(endStr, 1);
  if (!startIso || !endIso) return null;
  // start <= end (start 자정 < end+1일 자정)
  if (new Date(startIso).getTime() >= new Date(endIso).getTime()) return null;
  return { startIso, endIso, start: startStr.trim(), end: endStr.trim() };
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
      range: { start: null, end: null },
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

    // 커스텀 범위(start/end) 우선. 둘 다 유효하면 period 무시.
    const customRange = resolveCustomRange(searchParams.get('start'), searchParams.get('end'));
    const isCustom = customRange != null;
    const startIso = isCustom ? customRange.startIso : getPeriodStartIso(normalizedPeriod);
    const endIso = isCustom ? customRange.endIso : getPeriodEndIso();
    // 응답 메타: 커스텀이면 요청한 start/end(YYYY-MM-DD), 아니면 null
    const rangeMeta = isCustom
      ? { start: customRange.start, end: customRange.end }
      : { start: null, end: null };

    const [viewsResult, visitorsResult, articlesResult, bannersResult] = await Promise.all([
      // 총 페이지뷰: RPC로 내부인(admin 경로 이력 visitor) 제외 집계
      serviceClient.rpc('analytics_total_views', { start_ts: startIso, end_ts: endIso }),
      // 순 방문자 수: RPC로 COUNT(DISTINCT) — 기존 JS Set(1000행 리밋) 버그 수정
      serviceClient.rpc('analytics_unique_visitors', { start_ts: startIso, end_ts: endIso }),
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

    // 추이 차트: 커스텀 범위면 그 범위, 아니면 최근 30일(KST)
    let dailySeries = [];
    try {
      let seriesStartIso = startIso;
      let seriesEndIso = endIso;
      if (!isCustom) {
        // 최근 30일: 오늘 포함 30일 창 (today~-29일)
        seriesStartIso = getPeriodStartIso('month');
        seriesEndIso = getPeriodEndIso();
      }
      const { data, error } = await serviceClient.rpc('analytics_daily_series', {
        start_ts: seriesStartIso,
        end_ts: seriesEndIso,
      });
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
        end_ts: endIso,
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
        end_ts: endIso,
      });
      if (error) throw error;
      referrers = (data || []).map((row) => ({
        source: row.source,
        count: Number(row.cnt) || 0,
        visitors: Number(row.visitors) || 0,
      }));
    } catch (err) {
      console.error('Error fetching referrer stats:', err);
      referrers = [];
    }

    return NextResponse.json({
      period: normalizedPeriod,
      range: rangeMeta,
      totalViews: Number(viewsResult.data) || 0,
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
