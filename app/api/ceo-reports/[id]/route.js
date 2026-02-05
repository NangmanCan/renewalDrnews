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
    const reportId = parseInt(id, 10);
    const body = await request.json();
    const { data, error } = await serviceClient
      .from('ceo_reports')
      .update({
        title: body.title,
        subtitle: body.subtitle,
        content: body.content,
        category: body.category,
        author: body.author,
        author_title: body.authorTitle,
        author_image: body.authorImage,
        week_number: body.weekNumber
      })
      .eq('id', reportId)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'CEO 리포트를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updated = data[0];
    return NextResponse.json({
      ...updated,
      authorTitle: updated.author_title,
      authorImage: updated.author_image,
      weekNumber: updated.week_number
    });
  } catch (error) {
    console.error('Error updating CEO report:', error);
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
    const reportId = parseInt(id, 10);
    const { error } = await serviceClient
      .from('ceo_reports')
      .delete()
      .eq('id', reportId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting CEO report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
