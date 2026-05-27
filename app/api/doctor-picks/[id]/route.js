import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const runtime = 'edge';

async function requireAuth(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = await verifySessionToken(token);
  return !!payload;
}

// 수정
export async function PUT(request, { params }) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const { id } = await params;
  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }
  try {
    const body = await request.json();
    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (body.label !== undefined) updates.label = body.label;
    if (body.title !== undefined) updates.title = body.title;
    if (body.link !== undefined) updates.link = body.link;
    if (body.display_order !== undefined) updates.display_order = body.display_order;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    const { data, error } = await serviceClient
      .from('doctor_picks')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return NextResponse.json(data?.[0] || null);
  } catch (err) {
    console.error('Error updating doctor_pick:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 삭제
export async function DELETE(request, { params }) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  const { id } = await params;
  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }
  try {
    const { error } = await serviceClient
      .from('doctor_picks')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error deleting doctor_pick:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
