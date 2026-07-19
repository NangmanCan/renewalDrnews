-- 관리자 통계 집계 RPC (page_views 원본 기반, PostgREST 1000행 리밋 무관)

-- 1) 순 방문자 수 — 기존 JS Set 방식의 1000행 과소집계 수정
CREATE OR REPLACE FUNCTION analytics_unique_visitors(start_ts TIMESTAMPTZ)
RETURNS INTEGER
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COUNT(DISTINCT visitor_id)::int
  FROM page_views
  WHERE created_at >= start_ts AND visitor_id IS NOT NULL;
$$;

-- 2) 일별 PV/UV 추이 (KST 기준 일 단위)
CREATE OR REPLACE FUNCTION analytics_daily_series(days INTEGER)
RETURNS TABLE(day DATE, views BIGINT, visitors BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT (created_at AT TIME ZONE 'Asia/Seoul')::date AS day,
         COUNT(*) AS views,
         COUNT(DISTINCT visitor_id) AS visitors
  FROM page_views
  WHERE created_at >= NOW() - (days || ' days')::interval
  GROUP BY 1
  ORDER BY 1;
$$;

-- 3) 기간별 인기 기사 (/article/{id} 경로 집계)
CREATE OR REPLACE FUNCTION analytics_top_articles(start_ts TIMESTAMPTZ, lim INTEGER)
RETURNS TABLE(article_id BIGINT, view_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT (regexp_match(page_path, '^/article/(\d+)'))[1]::bigint AS article_id,
         COUNT(*) AS view_count
  FROM page_views
  WHERE created_at >= start_ts AND page_path ~ '^/article/\d+'
  GROUP BY 1
  ORDER BY 2 DESC
  LIMIT lim;
$$;

-- 4) 유입 채널 집계 (검색 등록 효과 측정용)
CREATE OR REPLACE FUNCTION analytics_referrer_stats(start_ts TIMESTAMPTZ)
RETURNS TABLE(source TEXT, cnt BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT CASE
      WHEN referrer IS NULL OR referrer = '' THEN '직접 유입'
      WHEN referrer ILIKE '%naver.%' THEN '네이버'
      WHEN referrer ILIKE '%google.%' THEN '구글'
      WHEN referrer ILIKE '%daum.%' OR referrer ILIKE '%kakao%' THEN '다음/카카오'
      WHEN referrer ILIKE '%drnews.co.kr%' OR referrer ILIKE '%renewaldrnews%' THEN '내부 이동'
      ELSE '기타'
    END AS source,
    COUNT(*) AS cnt
  FROM page_views
  WHERE created_at >= start_ts
  GROUP BY 1
  ORDER BY 2 DESC;
$$;

NOTIFY pgrst, 'reload schema';
