-- Analytics schema for Dr.News admin dashboard

ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS impressions INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT NOT NULL,
  visitor_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);

CREATE TABLE IF NOT EXISTS daily_stats (
  id BIGSERIAL PRIMARY KEY,
  stat_date DATE NOT NULL UNIQUE,
  total_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_stat_date ON daily_stats(stat_date DESC);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'page_views' AND policyname = 'Allow public insert on page_views'
  ) THEN
    CREATE POLICY "Allow public insert on page_views"
      ON page_views
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'daily_stats' AND policyname = 'Allow authenticated read on daily_stats'
  ) THEN
    CREATE POLICY "Allow authenticated read on daily_stats"
      ON daily_stats
      FOR SELECT
      USING (true);
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_daily_stats_updated_at ON daily_stats;
CREATE TRIGGER update_daily_stats_updated_at
  BEFORE UPDATE ON daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
