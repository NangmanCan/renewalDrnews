import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const runtime = 'edge';

export async function PUT(request, { params }) {
  // 인증 확인
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({ error: 'Supabase not configured. SUPABASE_SERVICE_ROLE_KEY 환경변수를 확인하세요.' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const bannerId = parseInt(id, 10);
    const body = await request.json();
    const { data, error } = await serviceClient
      .from('banners')
      .update({
        title: body.title,
        description: body.description,
        image: body.image,
        link: body.link || '#',
        type: body.type,
        is_active: body.isActive,
        sort_order: body.order,
        position_sidebar_top: body.positions?.sidebarTop ?? false,
        position_sidebar_bottom: body.positions?.sidebarBottom ?? false,
        position_mobile_between: body.positions?.mobileBetween ?? false,
        position_mobile_inline: body.positions?.mobileInline ?? false
      })
      .eq('id', bannerId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: '배너를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updated = data[0];
    return NextResponse.json({
      ...updated,
      isActive: updated.is_active,
      order: updated.sort_order,
      positions: {
        sidebarTop: updated.position_sidebar_top,
        sidebarBottom: updated.position_sidebar_bottom,
        mobileBetween: updated.position_mobile_between,
        mobileInline: updated.position_mobile_inline
      }
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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
    const bannerId = parseInt(id, 10);
    const { error } = await serviceClient
      .from('banners')
      .delete()
      .eq('id', bannerId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
