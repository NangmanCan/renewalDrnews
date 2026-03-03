import { cache } from 'react';
import { supabase } from './supabase';
import { articles as staticArticles } from '@/data/articles';

// DB 응답을 포맷팅하는 헬퍼 함수
function formatArticle(item) {
  return {
    ...item,
    date: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : null,
    isHeadline: item.is_headline,
    placement: item.placement || (item.is_headline ? 'headline' : 'news'),
  };
}

function formatArticles(data) {
  return data?.map(formatArticle) || [];
}

// Supabase에서 모든 기사 조회
export async function getArticles() {
  if (!supabase) {
    return staticArticles;
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const formatted = formatArticles(data);
    return formatted.length > 0 ? formatted : staticArticles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return staticArticles;
  }
}

// ID로 기사 조회 (cache로 같은 요청 내 중복 호출 제거)
export const getArticleById = cache(async function getArticleById(id) {
  if (!supabase) {
    return staticArticles.find(article => article.id === parseInt(id));
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? formatArticle(data) : staticArticles.find(article => article.id === parseInt(id));
  } catch (error) {
    console.error('Error fetching article:', error);
    return staticArticles.find(article => article.id === parseInt(id));
  }
});

// 헤드라인 기사 조회 (placement='headline', 복수 지원)
export async function getHeadlineArticles(limit = 2) {
  if (!supabase) {
    const headlines = staticArticles.filter(article => article.isHeadline || article.placement === 'headline');
    return headlines.length > 0 ? headlines.slice(0, limit) : staticArticles.slice(0, 1);
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('placement', 'headline')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data?.length > 0) {
      return formatArticles(data);
    }

    // fallback: is_headline이 true인 기사
    const { data: fallback, error: fbError } = await supabase
      .from('articles')
      .select('*')
      .eq('is_headline', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!fbError && fallback?.length > 0) return formatArticles(fallback);

    return staticArticles.filter(article => article.isHeadline || article.placement === 'headline').slice(0, limit);
  } catch (error) {
    console.error('Error fetching headlines:', error);
    return staticArticles.filter(article => article.isHeadline || article.placement === 'headline').slice(0, limit);
  }
}

// 하위 호환: 단일 헤드라인 조회
export async function getHeadlineArticle() {
  const headlines = await getHeadlineArticles(1);
  return headlines[0] || null;
}

// 일반 기사 목록 (헤드라인 제외)
export async function getRegularArticles() {
  if (!supabase) {
    return staticArticles.filter(article => !article.isHeadline);
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_headline', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const formatted = formatArticles(data);
    return formatted.length > 0 ? formatted : staticArticles.filter(article => !article.isHeadline);
  } catch (error) {
    console.error('Error fetching regular articles:', error);
    return staticArticles.filter(article => !article.isHeadline);
  }
}

// 서브 헤드라인 기사 (placement='subheadline' 우선, 없으면 최신순)
export async function getSubHeadlineArticles(limit = 2) {
  if (!supabase) {
    const subheadlineArticles = staticArticles.filter(article => article.placement === 'subheadline');
    if (subheadlineArticles.length > 0) {
      return subheadlineArticles.slice(0, limit);
    }
    return staticArticles
      .filter(article => !article.isHeadline && article.placement !== 'headline')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }

  try {
    // placement가 'subheadline'인 기사 우선 조회
    const { data: subData, error: subError } = await supabase
      .from('articles')
      .select('*')
      .eq('placement', 'subheadline')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!subError && subData?.length > 0) {
      return formatArticles(subData);
    }

    // fallback: is_headline이 false인 최신 기사
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_headline', false)
      .neq('placement', 'headline')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    const formatted = formatArticles(data);
    return formatted.length > 0 ? formatted : staticArticles
      .filter(article => !article.isHeadline && article.placement !== 'headline')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching sub headlines:', error);
    return staticArticles
      .filter(article => !article.isHeadline && article.placement !== 'headline')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }
}

// 관련 기사 (같은 카테고리, 현재 기사 제외)
export async function getRelatedArticles(currentId, category, limit = 3) {
  if (!supabase) {
    return staticArticles
      .filter(article => article.id !== parseInt(currentId) && article.category === category)
      .slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', category)
      .neq('id', currentId)
      .limit(limit);

    if (error) throw error;
    const formatted = formatArticles(data);
    return formatted.length > 0 ? formatted : staticArticles
      .filter(article => article.id !== parseInt(currentId) && article.category === category)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return staticArticles
      .filter(article => article.id !== parseInt(currentId) && article.category === category)
      .slice(0, limit);
  }
}

// 인기 기사 (조회수 기준)
export async function getPopularArticles(limit = 5) {
  if (!supabase) {
    return [...staticArticles]
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('views', { ascending: false })
      .limit(limit);

    if (error) throw error;
    const formatted = formatArticles(data);
    return formatted.length > 0 ? formatted : [...staticArticles]
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching popular articles:', error);
    return [...staticArticles]
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }
}

// 카테고리별 기사 조회
export async function getArticlesByCategory(category) {
  if (!supabase) {
    return staticArticles.filter(article => article.category === category);
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const formatted = formatArticles(data);
    return formatted.length > 0 ? formatted : staticArticles.filter(article => article.category === category);
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return staticArticles.filter(article => article.category === category);
  }
}

// 기사 생성 (Admin용)
export async function createArticle(articleData) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('articles')
    .insert([{
      title: articleData.title,
      summary: articleData.summary,
      content: articleData.content,
      category: articleData.category,
      author: articleData.author,
      image: articleData.image,
      is_headline: articleData.isHeadline || false,
      views: 0
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 기사 수정 (Admin용)
export async function updateArticle(id, articleData) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('articles')
    .update({
      title: articleData.title,
      summary: articleData.summary,
      content: articleData.content,
      category: articleData.category,
      author: articleData.author,
      image: articleData.image,
      is_headline: articleData.isHeadline
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 기사 삭제 (Admin용)
export async function deleteArticle(id) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// 조회수 증가
export async function incrementViews(id) {
  if (!supabase) return;

  try {
    const { error } = await supabase.rpc('increment_views', { article_id: id });
    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
}
