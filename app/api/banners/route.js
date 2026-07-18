import { NextResponse } from 'next/server';
import { supabase, getServiceSupabase } from '@/lib/supabase';
import { initialBanners as staticBanners } from '@/data/banners';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const runtime = 'edge';

// 캐시 방지 헤더
const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
  const client = supabase;
  if (!client) {
    return NextResponse.json(staticBanners, { headers: noCacheHeaders });
  }

  try {
    const { data, error } = await client
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // DB 필드명을 JS 형식으로 변환 (admin용 — 전체 반환, 기간 필터 없음)
    const formatted = data?.map(item => ({
      ...item,
      isActive: item.is_active,
      order: item.sort_order,
      advertiser: item.advertiser,
      memo: item.memo,
      startDate: item.start_date,
      endDate: item.end_date
    })) || [];

    return NextResponse.json(formatted.length > 0 ? formatted : staticBanners, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(staticBanners, { headers: noCacheHeaders });
  }
}

export async function POST(request) {
  // 인증 확인
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { data, error } = await serviceClient
      .from('banners')
      .insert([{
        title: body.title,
        description: body.description,
        image: body.image,
        link: body.link || '#',
        type: body.type,
        is_active: body.isActive ?? true,
        sort_order: body.order || 1,
        advertiser: body.advertiser || null,
        memo: body.memo || null,
        start_date: body.startDate || null,
        end_date: body.endDate || null
      }])
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: '배너 생성 실패' }, { status: 500 });
    }

    const created = data[0];
    return NextResponse.json({
      ...created,
      isActive: created.is_active,
      order: created.sort_order,
      advertiser: created.advertiser,
      memo: created.memo,
      startDate: created.start_date,
      endDate: created.end_date
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 순서 일괄 변경 — body { orders: [{ id, order }, ...] }
export async function PATCH(request) {
  // 인증 확인
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const orders = Array.isArray(body.orders) ? body.orders : [];
    let updated = 0;
    for (const item of orders) {
      const bannerId = Number.parseInt(item.id, 10);
      const sortOrder = Number.parseInt(item.order, 10);
      if (!Number.isFinite(bannerId) || !Number.isFinite(sortOrder)) continue;
      const { error } = await serviceClient
        .from('banners')
        .update({ sort_order: sortOrder })
        .eq('id', bannerId);
      if (error) throw error;
      updated += 1;
    }
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Error reordering banners:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
