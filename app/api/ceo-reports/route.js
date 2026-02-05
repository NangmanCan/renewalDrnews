import { NextResponse } from 'next/server';
import { supabase, getServiceSupabase } from '@/lib/supabase';
import { ceoReports as staticCeoReports } from '@/data/ceoReports';

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
    return NextResponse.json(staticCeoReports, { headers: noCacheHeaders });
  }

  try {
    const { data, error } = await client
      .from('ceo_reports')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    // DB 필드명을 JS 형식으로 변환
    const formatted = data?.map(item => ({
      ...item,
      authorTitle: item.author_title,
      authorImage: item.author_image,
      weekNumber: item.week_number
    })) || [];

    return NextResponse.json(formatted.length > 0 ? formatted : staticCeoReports, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Error fetching CEO reports:', error);
    return NextResponse.json(staticCeoReports, { headers: noCacheHeaders });
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
      .from('ceo_reports')
      .insert([{
        title: body.title,
        subtitle: body.subtitle,
        content: body.content,
        category: body.category,
        author: body.author,
        author_title: body.authorTitle,
        author_image: body.authorImage,
        week_number: body.weekNumber
      }])
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'CEO 리포트 생성 실패' }, { status: 500 });
    }

    const created = data[0];
    return NextResponse.json({
      ...created,
      authorTitle: created.author_title,
      authorImage: created.author_image,
      weekNumber: created.week_number
    });
  } catch (error) {
    console.error('Error creating CEO report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
