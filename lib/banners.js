import { supabase } from './supabase';
import { initialBanners as staticBanners } from '@/data/banners';

// 모든 배너 조회
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
    // DB 필드명을 JS 형식으로 변환
    if (data?.length > 0) {
      return data.map(item => ({
        ...item,
        isActive: item.is_active,
        order: item.sort_order,
        positions: {
          sidebarTop: item.position_sidebar_top,
          sidebarBottom: item.position_sidebar_bottom,
          mobileBetween: item.position_mobile_between,
          mobileInline: item.position_mobile_inline
        }
      }));
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
      return data.map(item => ({
        ...item,
        isActive: item.is_active,
        order: item.sort_order,
        positions: {
          sidebarTop: item.position_sidebar_top,
          sidebarBottom: item.position_sidebar_bottom,
          mobileBetween: item.position_mobile_between,
          mobileInline: item.position_mobile_inline
        }
      }));
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

// 타입별 배너 조회
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
    // DB 필드명을 JS 형식으로 변환
    return (data || []).map(item => ({
      ...item,
      isActive: item.is_active,
      order: item.sort_order,
      positions: {
        sidebarTop: item.position_sidebar_top,
        sidebarBottom: item.position_sidebar_bottom,
        mobileBetween: item.position_mobile_between,
        mobileInline: item.position_mobile_inline
      }
    }));
  } catch (error) {
    console.error('Error fetching banners by type:', error);
    return staticBanners.filter(b => b.type === type && b.isActive);
  }
}

// 사이드바 상단 배너 조회
export async function getSidebarTopBanners() {
  if (!supabase) {
    return staticBanners.filter(b => b.type === 'sidebar' && b.isActive && b.positions?.sidebarTop);
  }

  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('type', 'sidebar')
      .eq('is_active', true)
      .eq('position_sidebar_top', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    // DB 필드명을 JS 형식으로 변환
    if (data?.length > 0) {
      return data.map(item => ({
        ...item,
        isActive: item.is_active,
        order: item.sort_order,
        positions: {
          sidebarTop: item.position_sidebar_top,
          sidebarBottom: item.position_sidebar_bottom,
          mobileBetween: item.position_mobile_between,
          mobileInline: item.position_mobile_inline
        }
      }));
    }
    return staticBanners.filter(b => b.type === 'sidebar' && b.isActive && b.positions?.sidebarTop);
  } catch (error) {
    console.error('Error fetching sidebar top banners:', error);
    return staticBanners.filter(b => b.type === 'sidebar' && b.isActive && b.positions?.sidebarTop);
  }
}

// 사이드바 하단 배너 조회
export async function getSidebarBottomBanners() {
  if (!supabase) {
    return staticBanners.filter(b => b.type === 'sidebar' && b.isActive && b.positions?.sidebarBottom);
  }

  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('type', 'sidebar')
      .eq('is_active', true)
      .eq('position_sidebar_bottom', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    // DB 필드명을 JS 형식으로 변환
    if (data?.length > 0) {
      return data.map(item => ({
        ...item,
        isActive: item.is_active,
        order: item.sort_order,
        positions: {
          sidebarTop: item.position_sidebar_top,
          sidebarBottom: item.position_sidebar_bottom,
          mobileBetween: item.position_mobile_between,
          mobileInline: item.position_mobile_inline
        }
      }));
    }
    return staticBanners.filter(b => b.type === 'sidebar' && b.isActive && b.positions?.sidebarBottom);
  } catch (error) {
    console.error('Error fetching sidebar bottom banners:', error);
    return staticBanners.filter(b => b.type === 'sidebar' && b.isActive && b.positions?.sidebarBottom);
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
      position_sidebar_top: bannerData.positions?.sidebarTop ?? false,
      position_sidebar_bottom: bannerData.positions?.sidebarBottom ?? false,
      position_mobile_between: bannerData.positions?.mobileBetween ?? false,
      position_mobile_inline: bannerData.positions?.mobileInline ?? false
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
      position_sidebar_top: bannerData.positions?.sidebarTop ?? false,
      position_sidebar_bottom: bannerData.positions?.sidebarBottom ?? false,
      position_mobile_between: bannerData.positions?.mobileBetween ?? false,
      position_mobile_inline: bannerData.positions?.mobileInline ?? false
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
