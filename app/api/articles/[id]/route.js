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
    const articleId = parseInt(id, 10);
    const body = await request.json();

    // 기본 업데이트 데이터
    const updateData = {
      title: body.title,
      summary: body.summary,
      content: body.content,
      category: body.category,
      author: body.author,
      image: body.image,
      is_headline: body.isHeadline || body.placement === 'headline'
    };

    // placement 필드가 있으면 추가
    if (body.placement !== undefined) {
      updateData.placement = body.placement;
    }

    const { data, error } = await serviceClient
      .from('articles')
      .update(updateData)
      .eq('id', articleId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: '기사를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updated = data[0];
    // 응답 데이터 포맷 변환
    return NextResponse.json({
      ...updated,
      isHeadline: updated.is_headline,
      placement: updated.placement || (updated.is_headline ? 'headline' : 'news'),
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
    const articleId = parseInt(id, 10);
    const { error } = await serviceClient
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
