import { supabase } from './supabase';
import { ceoReports as staticCeoReports } from '@/data/ceoReports';

// 모든 CEO 리포트 조회
export async function getCeoReports(limit = 3) {
  if (!supabase) {
    return staticCeoReports.slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('ceo_reports')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    // DB 필드명을 JS 형식으로 변환
    if (data?.length > 0) {
      return data.map(item => ({
        ...item,
        authorTitle: item.author_title,
        authorImage: item.author_image,
        weekNumber: item.week_number
      }));
    }
    return staticCeoReports.slice(0, limit);
  } catch (error) {
    console.error('Error fetching CEO reports:', error);
    return staticCeoReports.slice(0, limit);
  }
}

// ID로 CEO 리포트 조회
export async function getCeoReportById(id) {
  if (!supabase) {
    return staticCeoReports.find(report => report.id === parseInt(id));
  }

  try {
    const { data, error } = await supabase
      .from('ceo_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    // DB 필드명을 JS 형식으로 변환
    if (data) {
      return {
        ...data,
        authorTitle: data.author_title,
        authorImage: data.author_image,
        weekNumber: data.week_number
      };
    }
    return staticCeoReports.find(report => report.id === parseInt(id));
  } catch (error) {
    console.error('Error fetching CEO report:', error);
    return staticCeoReports.find(report => report.id === parseInt(id));
  }
}

// 최신 CEO 리포트 조회
export async function getLatestCeoReport() {
  if (!supabase) {
    return staticCeoReports[0];
  }

  try {
    const { data, error } = await supabase
      .from('ceo_reports')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    // DB 필드명을 JS 형식으로 변환
    if (data) {
      return {
        ...data,
        authorTitle: data.author_title,
        authorImage: data.author_image,
        weekNumber: data.week_number
      };
    }
    return staticCeoReports[0];
  } catch (error) {
    console.error('Error fetching latest CEO report:', error);
    return staticCeoReports[0];
  }
}

// CEO 리포트 생성 (Admin용)
export async function createCeoReport(reportData) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('ceo_reports')
    .insert([{
      title: reportData.title,
      subtitle: reportData.subtitle,
      content: reportData.content,
      category: reportData.category,
      author: reportData.author,
      author_title: reportData.authorTitle,
      author_image: reportData.authorImage,
      week_number: reportData.weekNumber
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// CEO 리포트 수정 (Admin용)
export async function updateCeoReport(id, reportData) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('ceo_reports')
    .update({
      title: reportData.title,
      subtitle: reportData.subtitle,
      content: reportData.content,
      category: reportData.category,
      author: reportData.author,
      author_title: reportData.authorTitle,
      author_image: reportData.authorImage,
      week_number: reportData.weekNumber
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// CEO 리포트 삭제 (Admin용)
export async function deleteCeoReport(id) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('ceo_reports')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
