import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function PUT(request, { params }) {
  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({ error: 'Supabase not configured. SUPABASE_SERVICE_ROLE_KEY 환경변수를 확인하세요.' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // 기본 업데이트 데이터 (placement 없이)
    const updateData = {
      title: body.title,
      summary: body.summary,
      content: body.content,
      category: body.category,
      author: body.author,
      image: body.image,
      is_headline: body.isHeadline || body.placement === 'headline'
    };

    // placement 필드가 있으면 추가 (컬럼이 없으면 에러 발생할 수 있음)
    if (body.placement !== undefined) {
      updateData.placement = body.placement;
    }

    const { data, error } = await serviceClient
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // 응답 데이터 포맷 변환
    return NextResponse.json({
      ...data,
      isHeadline: data.is_headline,
      placement: data.placement || (data.is_headline ? 'headline' : 'news'),
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const { error } = await serviceClient
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
