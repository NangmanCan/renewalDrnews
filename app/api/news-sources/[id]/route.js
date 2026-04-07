import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const runtime = 'edge';

export async function PATCH(request, { params }) {
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
    const body = await request.json();

    const { data, error } = await serviceClient
      .from('crawled_news')
      .update({ is_used: body.is_used ?? true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating crawled news:', error);
    return NextResponse.json({ error: '업데이트 실패' }, { status: 500 });
  }
}
