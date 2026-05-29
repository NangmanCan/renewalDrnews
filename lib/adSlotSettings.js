import { supabase } from '@/lib/supabase';

// 광고 슬롯 노출 기본 설정
// rolling: 자동 순환 여부, interval: 순환 간격(초)
// sidebar는 동시 나열이라 롤링 설정 없음
export const AD_SLOT_DEFAULTS = {
  strip:    { rolling: true, interval: 5 },
  headline: { rolling: true, interval: 5 },
  hero_ad:  { rolling: true, interval: 5 },
};

const SLOT_KEYS = Object.keys(AD_SLOT_DEFAULTS);

export function normalizeAdSlotSettings(raw) {
  const out = {};
  for (const key of SLOT_KEYS) {
    const v = (raw && typeof raw === 'object' && raw[key]) || {};
    const interval = Number(v.interval);
    out[key] = {
      rolling: typeof v.rolling === 'boolean' ? v.rolling : AD_SLOT_DEFAULTS[key].rolling,
      interval: Number.isFinite(interval) && interval > 0 ? Math.round(interval) : AD_SLOT_DEFAULTS[key].interval,
    };
  }
  return out;
}

export async function getAdSlotSettings() {
  if (!supabase) return normalizeAdSlotSettings(null);
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'ad_slots')
      .single();
    if (error) throw error;
    return normalizeAdSlotSettings(data?.value);
  } catch (e) {
    console.error('Error fetching ad slot settings:', e);
    return normalizeAdSlotSettings(null);
  }
}
