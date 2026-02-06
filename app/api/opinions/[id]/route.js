import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function PUT(request, { params }) {
  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const opinionId = parseInt(id, 10);
    const body = await request.json();
    const updateData = {
      title: body.title,
      summary: body.summary,
      content: body.content,
      category: body.category,
      author: body.author,
      author_title: body.authorTitle,
      author_image: body.authorImage,
    };
    // is_featured 필드가 있으면 추가 (슬롯 관리에서 사용)
    if (body.isFeatured !== undefined) {
      updateData.is_featured = body.isFeatured;
    }

    const { data, error } = await serviceClient
      .from('opinions')
      .update(updateData)
      .eq('id', opinionId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: '오피니언을 찾을 수 없습니다.' }, { status: 404 });
    }

    const updated = data[0];
    return NextResponse.json({
      ...updated,
      authorTitle: updated.author_title,
      authorImage: updated.author_image
    });
  } catch (error) {
    console.error('Error updating opinion:', error);
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
    const opinionId = parseInt(id, 10);
    const { error } = await serviceClient
      .from('opinions')
      .delete()
      .eq('id', opinionId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting opinion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
