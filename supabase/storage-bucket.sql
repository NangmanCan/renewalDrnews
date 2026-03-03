-- Supabase Storage 버킷 생성: images (public)
-- Supabase Dashboard > SQL Editor에서 실행

-- 1. images 버킷 생성 (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,  -- public 버킷
  10485760,  -- 10MB 제한
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[];

-- 2. 공개 읽기 정책 (누구나 이미지 조회 가능)
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 3. 인증된 사용자 업로드 정책
-- anon key로 업로드 허용 (admin 페이지에서 사용)
CREATE POLICY "Authenticated upload access for images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- 4. 인증된 사용자 삭제 정책
CREATE POLICY "Authenticated delete access for images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');

-- 5. 인증된 사용자 업데이트 정책 (덮어쓰기)
CREATE POLICY "Authenticated update access for images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images');
