import { NextResponse } from 'next/server';
import { supabase, getServiceSupabase } from '@/lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const runtime = 'edge';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

// 목록 조회 (전체)
export async function GET() {
  if (!supabase) {
    return NextResponse.json([], { headers: noCacheHeaders });
  }
  try {
    const { data, error } = await supabase
      .from('doctor_picks')
      .select('*')
      .order('display_order', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data || [], { headers: noCacheHeaders });
  } catch (err) {
    console.error('Error listing doctor_picks:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 신규 생성
export async function POST(request) {
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
    if (!body.label || !body.link) {
      return NextResponse.json({ error: 'label과 link는 필수입니다.' }, { status: 400 });
    }
    const { data, error } = await serviceClient
      .from('doctor_picks')
      .insert([
        {
          label: body.label,
          title: body.title || null,
          link: body.link,
          display_order: body.display_order ?? 0,
          is_active: body.is_active ?? true,
        },
      ])
      .select();
    if (error) throw error;
    return NextResponse.json(data?.[0] || null);
  } catch (err) {
    console.error('Error creating doctor_pick:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
