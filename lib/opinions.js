import { supabase } from './supabase';
import { opinions as staticOpinions } from '@/data/opinions';

// 모든 오피니언 조회
export async function getOpinions() {
  if (!supabase) {
    return staticOpinions;
  }

  try {
    const { data, error } = await supabase
      .from('opinions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.length > 0 ? data : staticOpinions;
  } catch (error) {
    console.error('Error fetching opinions:', error);
    return staticOpinions;
  }
}

// ID로 오피니언 조회
export async function getOpinionById(id) {
  if (!supabase) {
    return staticOpinions.find(opinion => opinion.id === parseInt(id));
  }

  try {
    const { data, error } = await supabase
      .from('opinions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    // DB 필드명을 JS 형식으로 변환
    if (data) {
      return {
        ...data,
        authorTitle: data.author_title,
        authorImage: data.author_image
      };
    }
    return staticOpinions.find(opinion => opinion.id === parseInt(id));
  } catch (error) {
    console.error('Error fetching opinion:', error);
    return staticOpinions.find(opinion => opinion.id === parseInt(id));
  }
}

// 최신 오피니언 조회 (is_featured=true인 것만, 슬롯 관리 반영)
export async function getLatestOpinions(limit = 3) {
  if (!supabase) {
    return staticOpinions.slice(0, limit);
  }

  try {
    // is_featured가 true이거나 NULL(컬럼 미추가 시)인 오피니언만 조회
    const { data, error } = await supabase
      .from('opinions')
      .select('*')
      .or('is_featured.eq.true,is_featured.is.null')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    // DB 필드명을 JS 형식으로 변환
    if (data?.length > 0) {
      return data.map(item => ({
        ...item,
        authorTitle: item.author_title,
        authorImage: item.author_image
      }));
    }
    return staticOpinions.slice(0, limit);
  } catch (error) {
    console.error('Error fetching latest opinions:', error);
    return staticOpinions.slice(0, limit);
  }
}

// 오피니언 생성 (Admin용)
export async function createOpinion(opinionData) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('opinions')
    .insert([{
      title: opinionData.title,
      summary: opinionData.summary,
      content: opinionData.content,
      category: opinionData.category,
      author: opinionData.author,
      author_title: opinionData.authorTitle,
      author_image: opinionData.authorImage
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 오피니언 수정 (Admin용)
export async function updateOpinion(id, opinionData) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('opinions')
    .update({
      title: opinionData.title,
      summary: opinionData.summary,
      content: opinionData.content,
      category: opinionData.category,
      author: opinionData.author,
      author_title: opinionData.authorTitle,
      author_image: opinionData.authorImage
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 오피니언 삭제 (Admin용)
export async function deleteOpinion(id) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('opinions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
