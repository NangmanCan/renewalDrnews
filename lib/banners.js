import { supabase } from './supabase';
import { initialBanners as staticBanners } from '@/data/banners';

// 오늘 날짜 (YYYY-MM-DD) — 게재 기간 필터용
function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 게재 기간 내인지 판정 (start_date <= 오늘 <= end_date, null은 무제한)
function isInSchedule(item) {
  const today = todayStr();
  const start = item.start_date;
  const end = item.end_date;
  if (start && start > today) return false;
  if (end && end < today) return false;
  return true;
}

// DB 배너 행을 JS 형식으로 변환
function mapBanner(item) {
  return {
    ...item,
    isActive: item.is_active,
    order: item.sort_order,
    advertiser: item.advertiser,
    memo: item.memo,
    startDate: item.start_date,
    endDate: item.end_date,
  };
}

// 모든 배너 조회 (공개 — 게재 기간 필터 적용)
export async function getBanners() {
  if (!supabase) {
    return staticBanners;
  }

  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    // DB 필드명을 JS 형식으로 변환 + 게재 기간 필터
    if (data?.length > 0) {
      return data.filter(isInSchedule).map(mapBanner);
    }
    return staticBanners;
  } catch (error) {
    console.error('Error fetching banners:', error);
    return staticBanners;
  }
}

// 활성화된 배너만 조회
export async function getActiveBanners() {
  if (!supabase) {
    return staticBanners.filter(b => b.isActive);
  }

  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    // DB 필드명을 JS 형식으로 변환
    if (data?.length > 0) {
      return data.map(mapBanner);
    }
    return staticBanners.filter(b => b.isActive);
  } catch (error) {
    console.error('Error fetching active banners:', error);
    return staticBanners.filter(b => b.isActive);
  }
}

// Strip 배너 조회 (띠배너)
export async function getStripBanners() {
  return getBannersByType('strip');
}

// 타입별 배너 조회 (공개 — 게재 기간 필터 적용)
export async function getBannersByType(type) {
  if (!supabase) {
    return staticBanners.filter(b => b.type === type && b.isActive);
  }

  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    // DB 필드명을 JS 형식으로 변환 + 게재 기간 필터
    return (data || []).filter(isInSchedule).map(mapBanner);
  } catch (error) {
    console.error('Error fetching banners by type:', error);
    return staticBanners.filter(b => b.type === type && b.isActive);
  }
}

// 배너 생성 (Admin용)
export async function createBanner(bannerData) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('banners')
    .insert([{
      title: bannerData.title,
      description: bannerData.description,
      image: bannerData.image,
      link: bannerData.link,
      type: bannerData.type,
      is_active: bannerData.isActive ?? true,
      sort_order: bannerData.order || 1,
      advertiser: bannerData.advertiser || null,
      memo: bannerData.memo || null,
      start_date: bannerData.startDate || null,
      end_date: bannerData.endDate || null
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 배너 수정 (Admin용)
export async function updateBanner(id, bannerData) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('banners')
    .update({
      title: bannerData.title,
      description: bannerData.description,
      image: bannerData.image,
      link: bannerData.link,
      type: bannerData.type,
      is_active: bannerData.isActive,
      sort_order: bannerData.order,
      advertiser: bannerData.advertiser || null,
      memo: bannerData.memo || null,
      start_date: bannerData.startDate || null,
      end_date: bannerData.endDate || null
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 배너 삭제 (Admin용)
export async function deleteBanner(id) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// 배너 활성화/비활성화 토글 (Admin용)
export async function toggleBannerActive(id, isActive) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('banners')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
