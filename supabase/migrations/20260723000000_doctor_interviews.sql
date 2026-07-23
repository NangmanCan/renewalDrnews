-- 닥터인터뷰 전용 테이블
-- 오피니언과 유사한 구조지만 별도 기사 종류로 관리
CREATE TABLE IF NOT EXISTS doctor_interviews (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  author_title TEXT,
  author_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_doctor_interviews_created_at ON doctor_interviews(created_at DESC);

-- updated_at 자동 업데이트 트리거 (init 마이그레이션의 update_updated_at_column() 함수 재사용)
DROP TRIGGER IF EXISTS update_doctor_interviews_updated_at ON doctor_interviews;
CREATE TRIGGER update_doctor_interviews_updated_at
  BEFORE UPDATE ON doctor_interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책
ALTER TABLE doctor_interviews ENABLE ROW LEVEL SECURITY;

-- 읽기 정책 (모든 사용자 허용)
CREATE POLICY "Allow public read access on doctor_interviews" ON doctor_interviews FOR SELECT USING (true);

-- 쓰기 정책 (인증된 사용자 또는 서비스 롤)
CREATE POLICY "Allow authenticated insert on doctor_interviews" ON doctor_interviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update on doctor_interviews" ON doctor_interviews FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete on doctor_interviews" ON doctor_interviews FOR DELETE USING (true);

-- PostgREST 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';
