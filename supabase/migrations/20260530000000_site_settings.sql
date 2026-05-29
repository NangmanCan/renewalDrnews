-- 사이트 설정 (key-value) 테이블
-- 광고 슬롯 롤링/간격 등 운영 설정을 저장. 향후 다른 전역 설정도 여기에 확장.
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 자동 갱신 트리거 (init.sql의 함수 재사용)
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS: 공개 읽기, 인증 쓰기 (banners 정책과 동일 패턴)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on site_settings" ON site_settings;
CREATE POLICY "Allow public read access on site_settings" ON site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated write on site_settings" ON site_settings;
CREATE POLICY "Allow authenticated write on site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- 광고 슬롯 기본 설정
-- rolling: 자동 순환 여부, interval: 순환 간격(초)
-- sidebar는 동시 나열이라 롤링 설정 없음
INSERT INTO site_settings (key, value) VALUES (
  'ad_slots',
  '{
    "strip":    {"rolling": true, "interval": 5},
    "headline": {"rolling": true, "interval": 5},
    "hero_ad":  {"rolling": true, "interval": 5}
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
