-- CEO 리포트 엽서 프레임 배경 이미지
ALTER TABLE ceo_reports
  ADD COLUMN IF NOT EXISTS background_image TEXT;

NOTIFY pgrst, 'reload schema';
