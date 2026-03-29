import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const runtime = 'edge';

const BOT_UA_PATTERN = /bot|crawler|spider|crawling|facebookexternalhit|slurp|curl|wget/i;

export async function POST(request) {
  const serviceClient = getServiceSupabase();
  if (!serviceClient) {
    return NextResponse.json({ success: true });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const pagePath = typeof body.page_path === 'string' ? body.page_path.trim() : '';
    const visitorId = typeof body.visitor_id === 'string' ? body.visitor_id.trim() : null;
    const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 1024) : null;
    const userAgent = request.headers.get('user-agent') || '';

    if (!pagePath) {
      return NextResponse.json({ error: 'page_path is required' }, { status: 400 });
    }

    if (BOT_UA_PATTERN.test(userAgent)) {
      return NextResponse.json({ success: true, skipped: 'bot' });
    }

    const { error } = await serviceClient
      .from('page_views')
      .insert([{
        page_path: pagePath.slice(0, 512),
        visitor_id: visitorId || null,
        referrer,
        user_agent: userAgent.slice(0, 1024),
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording page view:', error);
    return NextResponse.json({ error: 'Failed to record page view' }, { status: 500 });
  }
}
