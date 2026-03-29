import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function POST(request, { params }) {
  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({ success: true });
  }

  try {
    const { id } = await params;
    const bannerId = Number.parseInt(id, 10);
    if (!Number.isFinite(bannerId)) {
      return NextResponse.json({ error: 'Invalid banner id' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const trackType = body.type;
    if (trackType !== 'impression' && trackType !== 'click') {
      return NextResponse.json({ error: 'type must be impression or click' }, { status: 400 });
    }

    const { data: banner, error: bannerError } = await serviceClient
      .from('banners')
      .select('id,impressions,clicks')
      .eq('id', bannerId)
      .single();

    if (bannerError || !banner) {
      return NextResponse.json({ error: '배너를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updatePayload = trackType === 'impression'
      ? { impressions: (banner.impressions || 0) + 1 }
      : { clicks: (banner.clicks || 0) + 1 };

    const { error: updateError } = await serviceClient
      .from('banners')
      .update(updatePayload)
      .eq('id', bannerId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking banner metric:', error);
    return NextResponse.json({ error: '배너 트래킹에 실패했습니다.' }, { status: 500 });
  }
}
