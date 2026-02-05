import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function PUT(request, { params }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { data, error } = await supabase
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
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({
      ...data,
      authorTitle: data.author_title,
      authorImage: data.author_image,
      weekNumber: data.week_number
    });
  } catch (error) {
    console.error('Error updating CEO report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const { error } = await supabase
      .from('ceo_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting CEO report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
