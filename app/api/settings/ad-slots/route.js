import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';
import { getAdSlotSettings, normalizeAdSlotSettings } from '@/lib/adSlotSettings';

export const runtime = 'edge';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
  const settings = await getAdSlotSettings();
  return NextResponse.json(settings, { headers: noCacheHeaders });
}

export async function PUT(request) {
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
    const value = normalizeAdSlotSettings(body);
    const { error } = await serviceClient
      .from('site_settings')
      .upsert({ key: 'ad_slots', value }, { onConflict: 'key' });
    if (error) throw error;
    return NextResponse.json(value, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Error saving ad slot settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
