-- 기사 작성 도우미: RSS 크롤링 결과 저장 테이블
CREATE TABLE IF NOT EXISTS crawled_news (
  id BIGSERIAL PRIMARY KEY,
  source_name TEXT,
  source_region TEXT,
  title TEXT,
  summary TEXT,
  link TEXT UNIQUE,           -- upsert onConflict 기준
  pub_date TIMESTAMPTZ,
  image_url TEXT,
  crawled_at TIMESTAMPTZ DEFAULT NOW(),
  is_used BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_crawled_news_crawled_at ON crawled_news(crawled_at DESC);
