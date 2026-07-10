import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const runtime = 'edge';

// 배너 성과 수치 초기화 (계약 갱신 시 이전 수치와 혼재 방지)
export async function POST(request, { params }) {
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
    const { id } = await params;
    const bannerId = Number.parseInt(id, 10);
    if (!Number.isFinite(bannerId)) {
      return NextResponse.json({ error: 'Invalid banner id' }, { status: 400 });
    }

    const { error } = await serviceClient
      .from('banners')
      .update({ impressions: 0, clicks: 0 })
      .eq('id', bannerId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting banner metrics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
