import { NextResponse } from 'next/server';
import { supabase, getServiceSupabase } from '@/lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';
import { NEWS_SOURCES } from '@/lib/newsSources';
import { fetchAndParseRss } from '@/lib/rssParser';

export const runtime = 'edge';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// 크롤링 결과 조회
export async function GET(request) {
  const client = supabase;
  if (!client) {
    return NextResponse.json([], { headers: noCacheHeaders });
  }

  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region'); // '국내' | '해외' | null(전체)
  const date = searchParams.get('date'); // 'YYYY-MM-DD'
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = (page - 1) * limit;

  try {
    let query = client
      .from('crawled_news')
      .select('*', { count: 'exact' })
      .order('pub_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (region) {
      query = query.eq('source_region', region);
    }

    if (date) {
      const startOfDay = `${date}T00:00:00+09:00`;
      const endOfDay = `${date}T23:59:59+09:00`;
      query = query.gte('pub_date', startOfDay).lte('pub_date', endOfDay);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // 마지막 크롤링 시간 조회
    const { data: lastCrawl } = await client
      .from('crawled_news')
      .select('crawled_at')
      .order('crawled_at', { ascending: false })
      .limit(1);

    return NextResponse.json({
      items: data || [],
      total: count || 0,
      page,
      limit,
      lastCrawledAt: lastCrawl?.[0]?.crawled_at || null,
    }, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Error fetching crawled news:', error);
    return NextResponse.json({ items: [], total: 0, page, limit, lastCrawledAt: null }, { headers: noCacheHeaders });
  }
}

// 크롤링 실행
export async function POST(request) {
  // 인증: 세션 쿠키 또는 Cron Secret
  const cronSecret = request.headers.get('x-cron-secret');
  const envCronSecret = process.env.CRON_SECRET;

  if (cronSecret && envCronSecret && cronSecret === envCronSecret) {
    // Cron 인증 통과
  } else {
    // 세션 쿠키 인증
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
  }

  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const targetRegion = body.region || 'all';

    const sources = targetRegion === 'all'
      ? NEWS_SOURCES
      : NEWS_SOURCES.filter(s => s.region === targetRegion);

    // 병렬 크롤링
    const results = await Promise.allSettled(
      sources.map(source => fetchAndParseRss(source))
    );

    let totalCrawled = 0;
    const errors = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const source = sources[i];

      if (result.status === 'rejected') {
        errors.push(`${source.name}: ${result.reason?.message || 'Unknown error'}`);
        continue;
      }

      const items = result.value;
      if (!items || items.length === 0) continue;

      // Supabase upsert (link 기준 중복 무시)
      const { error: upsertError } = await serviceClient
        .from('crawled_news')
        .upsert(items, {
          onConflict: 'link',
          ignoreDuplicates: true,
        });

      if (upsertError) {
        errors.push(`${source.name}: DB 저장 실패 - ${upsertError.message}`);
      } else {
        totalCrawled += items.length;
      }
    }

    return NextResponse.json({
      success: true,
      crawled: totalCrawled,
      sourcesProcessed: sources.length,
      errors,
    }, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Crawl error:', error);
    return NextResponse.json({ error: '크롤링 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
