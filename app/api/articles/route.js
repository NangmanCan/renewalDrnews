import { NextResponse } from 'next/server';
import { supabase, getServiceSupabase } from '@/lib/supabase';
import { articles as staticArticles } from '@/data/articles';

export const runtime = 'edge';

// 캐시 방지 헤더
const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
  const client = supabase;
  if (!client) {
    return NextResponse.json(staticArticles, { headers: noCacheHeaders });
  }

  try {
    const { data, error } = await client
      .from('articles')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    // DB 필드명을 JS 형식으로 변환
    const formatted = data?.map(item => ({
      ...item,
      isHeadline: item.is_headline,
      placement: item.placement || (item.is_headline ? 'headline' : 'news'),
    })) || [];

    return NextResponse.json(formatted.length > 0 ? formatted : staticArticles, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(staticArticles, { headers: noCacheHeaders });
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
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: '기사 생성 실패' }, { status: 500 });
    }

    const created = data[0];
    return NextResponse.json({
      ...created,
      isHeadline: created.is_headline,
      placement: created.placement || (created.is_headline ? 'headline' : 'news'),
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
