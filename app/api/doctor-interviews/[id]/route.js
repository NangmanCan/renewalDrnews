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
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const interviewId = parseInt(id, 10);
    const body = await request.json();
    const updateData = {
      title: body.title,
      summary: body.summary,
      content: body.content,
      author: body.author,
      author_title: body.authorTitle,
      author_image: body.authorImage,
    };

    const { data, error } = await serviceClient
      .from('doctor_interviews')
      .update(updateData)
      .eq('id', interviewId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: '닥터인터뷰를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updated = data[0];
    return NextResponse.json({
      ...updated,
      authorTitle: updated.author_title,
      authorImage: updated.author_image
    });
  } catch (error) {
    console.error('Error updating doctor interview:', error);
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
    const interviewId = parseInt(id, 10);
    const { error } = await serviceClient
      .from('doctor_interviews')
      .delete()
      .eq('id', interviewId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting doctor interview:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
