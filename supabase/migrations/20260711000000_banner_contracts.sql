-- 광고 계약 운영 필드 + 원자적 트래킹
-- 1) 광고주/메모/게재기간 (기간은 조회 시점 필터로 자동 온오프 — cron 불필요)
ALTER TABLE banners
  ADD COLUMN IF NOT EXISTS advertiser TEXT,
  ADD COLUMN IF NOT EXISTS memo TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE;

-- 2) 노출/클릭 원자적 증가 (기존 SELECT→UPDATE 방식의 동시성 카운트 유실 방지)
CREATE OR REPLACE FUNCTION increment_banner_metric(p_banner_id BIGINT, p_metric TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE banners SET
    impressions = impressions + (CASE WHEN p_metric = 'impression' THEN 1 ELSE 0 END),
    clicks      = clicks      + (CASE WHEN p_metric = 'click'      THEN 1 ELSE 0 END)
  WHERE id = p_banner_id;
$$;

NOTIFY pgrst, 'reload schema';
