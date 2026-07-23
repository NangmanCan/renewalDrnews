import { cache } from 'react';
import { supabase } from './supabase';

// 최신 닥터인터뷰 조회
export async function getLatestDoctorInterviews(limit = 1) {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('doctor_interviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (data?.length > 0) {
      // DB 필드명을 JS 형식으로 변환
      return data.map(item => ({
        ...item,
        authorTitle: item.author_title,
        authorImage: item.author_image
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching latest doctor interviews:', error);
    return [];
  }
}

// ID로 닥터인터뷰 조회 (cache로 같은 요청 내 중복 호출 제거)
export const getDoctorInterviewById = cache(async function getDoctorInterviewById(id) {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('doctor_interviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (data) {
      return {
        ...data,
        authorTitle: data.author_title,
        authorImage: data.author_image
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching doctor interview:', error);
    return null;
  }
});
