-- 유입 채널 집계에 순방문자 수 추가 (뷰 기준 → 방문자 기준 표시용)
-- 반환 타입 변경이라 DROP 후 재생성
DROP FUNCTION IF EXISTS analytics_referrer_stats(TIMESTAMPTZ, TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION analytics_referrer_stats(start_ts TIMESTAMPTZ, end_ts TIMESTAMPTZ)
RETURNS TABLE(source TEXT, cnt BIGINT, visitors BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT CASE
      WHEN referrer IS NULL OR referrer = '' THEN '직접 유입'
      WHEN referrer ILIKE '%naver.%' THEN '네이버'
      WHEN referrer ILIKE '%google.%' THEN '구글'
      WHEN referrer ILIKE '%daum.%' OR referrer ILIKE '%kakao%' THEN '다음/카카오'
      WHEN referrer ILIKE '%drnews.co.kr%' OR referrer ILIKE '%renewaldrnews%' THEN '내부 이동'
      ELSE '기타'
    END AS source,
    COUNT(*) AS cnt,
    COUNT(DISTINCT visitor_id) AS visitors
  FROM page_views
  WHERE created_at >= start_ts AND created_at < end_ts
  GROUP BY 1
  ORDER BY 3 DESC, 2 DESC;
$$;

NOTIFY pgrst, 'reload schema';
