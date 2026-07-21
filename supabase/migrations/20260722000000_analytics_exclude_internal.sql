-- 통계 집계에서 내부인 제외
-- 내부인 = /admin 경로를 밟은 적 있는 visitor_id (관리자·운영진 기기 자동 식별, 소급 적용)
-- 원본 page_views는 그대로 보존 — 집계에서만 제외

CREATE OR REPLACE FUNCTION analytics_internal_visitors()
RETURNS TABLE(visitor_id TEXT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT DISTINCT visitor_id FROM page_views
  WHERE page_path LIKE '/admin%' AND visitor_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION analytics_unique_visitors(start_ts TIMESTAMPTZ, end_ts TIMESTAMPTZ)
RETURNS INTEGER LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COUNT(DISTINCT pv.visitor_id)::int FROM page_views pv
  WHERE pv.created_at >= start_ts AND pv.created_at < end_ts AND pv.visitor_id IS NOT NULL
    AND pv.visitor_id NOT IN (SELECT visitor_id FROM analytics_internal_visitors());
$$;

-- 총 페이지뷰 (내부인 제외 — 기존 PostgREST count 대체)
CREATE OR REPLACE FUNCTION analytics_total_views(start_ts TIMESTAMPTZ, end_ts TIMESTAMPTZ)
RETURNS INTEGER LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COUNT(*)::int FROM page_views pv
  WHERE pv.created_at >= start_ts AND pv.created_at < end_ts
    AND (pv.visitor_id IS NULL OR pv.visitor_id NOT IN (SELECT visitor_id FROM analytics_internal_visitors()));
$$;

CREATE OR REPLACE FUNCTION analytics_daily_series(start_ts TIMESTAMPTZ, end_ts TIMESTAMPTZ)
RETURNS TABLE(day DATE, views BIGINT, visitors BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT (pv.created_at AT TIME ZONE 'Asia/Seoul')::date AS day,
         COUNT(*) AS views, COUNT(DISTINCT pv.visitor_id) AS visitors
  FROM page_views pv
  WHERE pv.created_at >= start_ts AND pv.created_at < end_ts
    AND (pv.visitor_id IS NULL OR pv.visitor_id NOT IN (SELECT visitor_id FROM analytics_internal_visitors()))
  GROUP BY 1 ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION analytics_top_articles(start_ts TIMESTAMPTZ, end_ts TIMESTAMPTZ, lim INTEGER)
RETURNS TABLE(article_id BIGINT, view_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT (regexp_match(pv.page_path, '^/article/(\d+)'))[1]::bigint AS article_id, COUNT(*) AS view_count
  FROM page_views pv
  WHERE pv.created_at >= start_ts AND pv.created_at < end_ts AND pv.page_path ~ '^/article/\d+'
    AND (pv.visitor_id IS NULL OR pv.visitor_id NOT IN (SELECT visitor_id FROM analytics_internal_visitors()))
  GROUP BY 1 ORDER BY 2 DESC LIMIT lim;
$$;

CREATE OR REPLACE FUNCTION analytics_referrer_stats(start_ts TIMESTAMPTZ, end_ts TIMESTAMPTZ)
RETURNS TABLE(source TEXT, cnt BIGINT, visitors BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT CASE
      WHEN pv.referrer IS NULL OR pv.referrer = '' THEN '직접 유입'
      WHEN pv.referrer ILIKE '%naver.%' THEN '네이버'
      WHEN pv.referrer ILIKE '%google.%' THEN '구글'
      WHEN pv.referrer ILIKE '%daum.%' OR pv.referrer ILIKE '%kakao%' THEN '다음/카카오'
      WHEN pv.referrer ILIKE '%drnews.co.kr%' OR pv.referrer ILIKE '%renewaldrnews%' THEN '내부 이동'
      ELSE '기타'
    END AS source, COUNT(*) AS cnt, COUNT(DISTINCT pv.visitor_id) AS visitors
  FROM page_views pv
  WHERE pv.created_at >= start_ts AND pv.created_at < end_ts
    AND (pv.visitor_id IS NULL OR pv.visitor_id NOT IN (SELECT visitor_id FROM analytics_internal_visitors()))
  GROUP BY 1 ORDER BY 3 DESC, 2 DESC;
$$;

NOTIFY pgrst, 'reload schema';
