-- DOCTOR'S PICK: 편집자가 큐레이션하는 상단 픽 (라벨 + 제목 + 링크)
CREATE TABLE IF NOT EXISTS doctor_picks (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL,           -- 픽 라벨 (예: "사설·칼럼", "이명박 회고록")
  title TEXT,                    -- 보조 제목 (PC에서 노출, 모바일은 라벨만)
  link TEXT NOT NULL,            -- 클릭 시 이동할 경로 (/article/123 또는 외부 URL)
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_picks_active_order
  ON doctor_picks(is_active, display_order)
  WHERE is_active = TRUE;
