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

    // 원자적 증가 (동시성 카운트 유실 방지). 존재하지 않는 배너면 no-op이라 성공 응답.
    const { error: rpcError } = await serviceClient.rpc('increment_banner_metric', {
      p_banner_id: bannerId,
      p_metric: trackType,
    });

    if (rpcError) throw rpcError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking banner metric:', error);
    return NextResponse.json({ error: '배너 트래킹에 실패했습니다.' }, { status: 500 });
  }
}
