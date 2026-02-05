import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ceoReports as staticCeoReports } from '@/data/ceoReports';

export const runtime = 'edge';

export async function GET() {
  if (!supabase) {
    return NextResponse.json(staticCeoReports);
  }

  try {
    const { data, error } = await supabase
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

    return NextResponse.json(formatted.length > 0 ? formatted : staticCeoReports);
  } catch (error) {
    console.error('Error fetching CEO reports:', error);
    return NextResponse.json(staticCeoReports);
  }
}

export async function POST(request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { data, error } = await supabase
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
    console.error('Error creating CEO report:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
