import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request, { params }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { data, error } = await supabase
      .from('opinions')
      .update({
        title: body.title,
        summary: body.summary,
        content: body.content,
        category: body.category,
        author: body.author,
        author_title: body.authorTitle,
        author_image: body.authorImage
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({
      ...data,
      authorTitle: data.author_title,
      authorImage: data.author_image
    });
  } catch (error) {
    console.error('Error updating opinion:', error);
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
      .from('opinions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting opinion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
