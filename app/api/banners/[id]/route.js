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
      .from('banners')
      .update({
        title: body.title,
        description: body.description,
        image: body.image,
        link: body.link || '#',
        type: body.type,
        is_active: body.isActive,
        sort_order: body.order,
        position_sidebar_top: body.positions?.sidebarTop ?? false,
        position_sidebar_bottom: body.positions?.sidebarBottom ?? false,
        position_mobile_between: body.positions?.mobileBetween ?? false,
        position_mobile_inline: body.positions?.mobileInline ?? false
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({
      ...data,
      isActive: data.is_active,
      order: data.sort_order,
      positions: {
        sidebarTop: data.position_sidebar_top,
        sidebarBottom: data.position_sidebar_bottom,
        mobileBetween: data.position_mobile_between,
        mobileInline: data.position_mobile_inline
      }
    });
  } catch (error) {
    console.error('Error updating banner:', error);
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
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
