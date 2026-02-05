import { NextResponse } from 'next/server';
import { supabase, getServiceSupabase } from '@/lib/supabase';
import { initialBanners as staticBanners } from '@/data/banners';

export const runtime = 'edge';

export async function GET() {
  const client = supabase;
  if (!client) {
    return NextResponse.json(staticBanners);
  }

  try {
    const { data, error } = await client
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // DB 필드명을 JS 형식으로 변환
    const formatted = data?.map(item => ({
      ...item,
      isActive: item.is_active,
      order: item.sort_order,
      positions: {
        sidebarTop: item.position_sidebar_top,
        sidebarBottom: item.position_sidebar_bottom,
        mobileBetween: item.position_mobile_between,
        mobileInline: item.position_mobile_inline
      }
    })) || [];

    return NextResponse.json(formatted.length > 0 ? formatted : staticBanners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(staticBanners);
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
      .from('banners')
      .insert([{
        title: body.title,
        description: body.description,
        image: body.image,
        link: body.link || '#',
        type: body.type,
        is_active: body.isActive ?? true,
        sort_order: body.order || 1,
        position_sidebar_top: body.positions?.sidebarTop ?? false,
        position_sidebar_bottom: body.positions?.sidebarBottom ?? false,
        position_mobile_between: body.positions?.mobileBetween ?? false,
        position_mobile_inline: body.positions?.mobileInline ?? false
      }])
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: '배너 생성 실패' }, { status: 500 });
    }

    const created = data[0];
    return NextResponse.json({
      ...created,
      isActive: created.is_active,
      order: created.sort_order,
      positions: {
        sidebarTop: created.position_sidebar_top,
        sidebarBottom: created.position_sidebar_bottom,
        mobileBetween: created.position_mobile_between,
        mobileInline: created.position_mobile_inline
      }
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
