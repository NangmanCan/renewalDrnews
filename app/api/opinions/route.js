import { NextResponse } from 'next/server';
import { supabase, getServiceSupabase } from '@/lib/supabase';
import { opinions as staticOpinions } from '@/data/opinions';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

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
    return NextResponse.json(staticOpinions, { headers: noCacheHeaders });
  }

  try {
    const { data, error } = await client
      .from('opinions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // DB 필드명을 JS 형식으로 변환
    const formatted = data?.map(item => ({
      ...item,
      authorTitle: item.author_title,
      authorImage: item.author_image,
      isFeatured: item.is_featured !== false, // 기본값 true (NULL 포함)
    })) || [];

    return NextResponse.json(formatted.length > 0 ? formatted : staticOpinions, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Error fetching opinions:', error);
    return NextResponse.json(staticOpinions, { headers: noCacheHeaders });
  }
}

export async function POST(request) {
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
