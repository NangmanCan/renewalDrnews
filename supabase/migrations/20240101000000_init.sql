-- Dr.News Database Schema
-- Run this SQL in Supabase SQL Editor

-- 1. Articles (기사) 테이블
CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '정책',
  author TEXT DEFAULT '편집부',
  image TEXT,
  placement TEXT DEFAULT 'news', -- headline, subheadline, news, opinion
  is_headline BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Opinions (오피니언/기고) 테이블
CREATE TABLE IF NOT EXISTS opinions (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  category TEXT DEFAULT '칼럼', -- 칼럼, 기고
  author TEXT NOT NULL,
  author_title TEXT,
  author_image TEXT,
  is_featured BOOLEAN DEFAULT TRUE, -- 슬롯 관리: 프론트엔드 오피니언 섹션 노출 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기존 DB 마이그레이션: opinions 테이블에 is_featured 컬럼 추가
-- ALTER TABLE opinions ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT TRUE;

-- 3. CEO Reports (CEO 리포트) 테이블
CREATE TABLE IF NOT EXISTS ceo_reports (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  category TEXT DEFAULT '경영철학',
  author TEXT DEFAULT '김의료',
  author_title TEXT DEFAULT 'Dr.News 대표',
  author_image TEXT,
  week_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Banners (광고 배너) 테이블
CREATE TABLE IF NOT EXISTS banners (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  link TEXT DEFAULT '#',
  type TEXT NOT NULL DEFAULT 'sidebar', -- headline, sidebar, gnb
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  -- 노출 위치 (sidebar 타입용)
  position_sidebar_top BOOLEAN DEFAULT FALSE,
  position_sidebar_bottom BOOLEAN DEFAULT FALSE,
  position_mobile_between BOOLEAN DEFAULT FALSE,
  position_mobile_inline BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_placement ON articles(placement);
CREATE INDEX IF NOT EXISTS idx_articles_is_headline ON articles(is_headline);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opinions_category ON opinions(category);
CREATE INDEX IF NOT EXISTS idx_banners_type ON banners(type);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opinions_updated_at ON opinions;
CREATE TRIGGER update_opinions_updated_at
  BEFORE UPDATE ON opinions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ceo_reports_updated_at ON ceo_reports;
CREATE TRIGGER update_ceo_reports_updated_at
  BEFORE UPDATE ON ceo_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_banners_updated_at ON banners;
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- 읽기 정책 (모든 사용자 허용)
CREATE POLICY "Allow public read access on articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow public read access on opinions" ON opinions FOR SELECT USING (true);
CREATE POLICY "Allow public read access on ceo_reports" ON ceo_reports FOR SELECT USING (true);
CREATE POLICY "Allow public read access on banners" ON banners FOR SELECT USING (true);

-- 쓰기 정책 (인증된 사용자 또는 서비스 롤)
CREATE POLICY "Allow authenticated insert on articles" ON articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update on articles" ON articles FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete on articles" ON articles FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert on opinions" ON opinions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update on opinions" ON opinions FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete on opinions" ON opinions FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert on ceo_reports" ON ceo_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update on ceo_reports" ON ceo_reports FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete on ceo_reports" ON ceo_reports FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert on banners" ON banners FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update on banners" ON banners FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete on banners" ON banners FOR DELETE USING (true);
