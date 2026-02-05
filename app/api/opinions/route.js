import { NextResponse } from 'next/server';
import { supabase, getServiceSupabase } from '@/lib/supabase';
import { opinions as staticOpinions } from '@/data/opinions';

export const runtime = 'edge';

export async function GET() {
  const client = supabase;
  if (!client) {
    return NextResponse.json(staticOpinions);
  }

  try {
    const { data, error } = await client
      .from('opinions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    // DB 필드명을 JS 형식으로 변환
    const formatted = data?.map(item => ({
      ...item,
      authorTitle: item.author_title,
      authorImage: item.author_image
    })) || [];

    return NextResponse.json(formatted.length > 0 ? formatted : staticOpinions);
  } catch (error) {
    console.error('Error fetching opinions:', error);
    return NextResponse.json(staticOpinions);
  }
}

export async function POST(request) {
  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { data, error } = await serviceClient
      .from('opinions')
      .insert([{
        title: body.title,
        summary: body.summary,
        content: body.content,
        category: body.category,
        author: body.author,
        author_title: body.authorTitle,
        author_image: body.authorImage
      }])
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: '오피니언 생성 실패' }, { status: 500 });
    }

    const created = data[0];
    return NextResponse.json({
      ...created,
      authorTitle: created.author_title,
      authorImage: created.author_image
    });
  } catch (error) {
    console.error('Error creating opinion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
