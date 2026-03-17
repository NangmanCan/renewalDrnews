-- Storage RLS 정책 추가
-- images 버킷에 대한 공개 접근 허용

-- 읽기 허용
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- 업로드 허용
CREATE POLICY "Public upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');

-- 수정 허용
CREATE POLICY "Public update access" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images');

-- 삭제 허용
CREATE POLICY "Public delete access" ON storage.objects
  FOR DELETE USING (bucket_id = 'images');
