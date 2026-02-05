import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { articles as staticArticles } from '@/data/articles';

export const runtime = 'edge';

export async function GET() {
  if (!supabase) {
    return NextResponse.json(staticArticles);
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data?.length > 0 ? data : staticArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(staticArticles);
  }
}

export async function POST(request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('articles')
      .insert([{
        title: body.title,
        summary: body.summary,
        content: body.content,
        category: body.category,
        author: body.author,
        image: body.image,
        placement: body.placement,
        is_headline: body.isHeadline || body.placement === 'headline',
        views: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
