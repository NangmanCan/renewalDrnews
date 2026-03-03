import { supabase } from './supabase';

const BUCKET_NAME = 'images';

/**
 * 이미지를 Supabase Storage에 업로드
 * @param {File} file - 업로드할 파일
 * @param {string} folder - 저장할 폴더 (articles, opinions, ceo, banners 등)
 * @returns {Promise<{url: string, error: Error|null}>}
 */
export async function uploadImage(file, folder = 'articles') {
  if (!supabase) {
    return { url: null, error: new Error('Supabase 클라이언트가 초기화되지 않았습니다.') };
  }

  try {
    // 파일명 생성: timestamp_randomstring.확장자
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${folder}/${timestamp}_${randomString}.${extension}`;

    // 파일 업로드
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { url: null, error };
    }

    // Public URL 생성
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err) {
    console.error('Upload exception:', err);
    return { url: null, error: err };
  }
}

/**
 * Supabase Storage에서 이미지 삭제
 * @param {string} url - 삭제할 이미지 URL
 * @returns {Promise<{success: boolean, error: Error|null}>}
 */
export async function deleteImage(url) {
  if (!supabase || !url) {
    return { success: false, error: new Error('잘못된 요청입니다.') };
  }

  try {
    // URL에서 파일 경로 추출
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)/);
    
    if (!pathMatch) {
      return { success: false, error: new Error('유효하지 않은 Storage URL입니다.') };
    }

    const filePath = decodeURIComponent(pathMatch[1]);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Delete exception:', err);
    return { success: false, error: err };
  }
}

/**
 * URL이 Supabase Storage URL인지 확인
 * @param {string} url - 확인할 URL
 * @returns {boolean}
 */
export function isStorageUrl(url) {
  if (!url) return false;
  return url.includes('/storage/v1/object/public/images/');
}
