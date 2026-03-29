'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_KEY = 'drnews_visitor_id';

function createVisitorId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getVisitorId() {
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;

  const generated = createVisitorId();
  localStorage.setItem(VISITOR_KEY, generated);
  return generated;
}

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    try {
      const visitorId = getVisitorId();
      fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_path: pathname,
          visitor_id: visitorId,
          referrer: document.referrer || null,
        }),
      }).catch(() => {});
    } catch {
      // localStorage unavailable (private mode or restricted browser)
    }
  }, [pathname]);

  return null;
}
