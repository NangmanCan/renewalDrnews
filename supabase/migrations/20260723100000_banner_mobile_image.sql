-- 띠배너 모바일 전용 소재 (PC 2400x180 초와이드 소재가 모바일에서 너무 얇아지는 문제)
ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS mobile_image TEXT;

NOTIFY pgrst, 'reload schema';
