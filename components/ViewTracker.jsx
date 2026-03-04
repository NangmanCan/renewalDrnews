'use client';

import { useEffect } from 'react';

export default function ViewTracker({ articleId }) {
  useEffect(() => {
    // 조회수 증가 API 호출
    fetch(`/api/articles/${articleId}/views`, { method: 'POST' })
      .catch(() => {}); // 실패해도 무시
  }, [articleId]);

  return null;
}
