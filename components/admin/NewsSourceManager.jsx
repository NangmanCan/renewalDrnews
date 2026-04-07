'use client';

import { useState, useEffect, useCallback } from 'react';

const REGIONS = [
  { id: 'all', label: '전체' },
  { id: '국내', label: '국내' },
  { id: '해외', label: '해외' },
];

export default function NewsSourceManager() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [region, setRegion] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [lastCrawledAt, setLastCrawledAt] = useState(null);
  const [toast, setToast] = useState(null);
  const limit = 30;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (region !== 'all') params.set('region', region);
      if (date) params.set('date', date);
      if (search) params.set('search', search);

      const res = await fetch(`/api/news-sources?${params}&t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setLastCrawledAt(data.lastCrawledAt);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      showToast('뉴스 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, region, date, search, limit]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleCrawl = async () => {
    if (crawling) return;
    setCrawling(true);
    try {
      const res = await fetch('/api/news-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: region === 'all' ? 'all' : region }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${data.crawled}건 수집 완료 (${data.sourcesProcessed}개 소스)${data.errors.length > 0 ? ` / ${data.errors.length}개 오류` : ''}`);
        setPage(1);
        await fetchNews();
      } else {
        showToast(data.error || '크롤링 실패', 'error');
      }
    } catch (err) {
      console.error('Crawl failed:', err);
      showToast('크롤링 중 오류가 발생했습니다.', 'error');
    } finally {
      setCrawling(false);
    }
  };

  const handleCopySource = (item) => {
    const text = `[출처: ${item.source_name}]\n제목: ${item.title}\n요약: ${item.summary || '(요약 없음)'}\n원문: ${item.link}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('클립보드에 복사되었습니다.');
    }).catch(() => {
      showToast('복사 실패', 'error');
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isStale = lastCrawledAt && (Date.now() - new Date(lastCrawledAt).getTime()) > 24 * 60 * 60 * 1000;

  const regionColor = (r) => {
    return r === '국내' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-4">
      {/* 토스트 */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white transition-all ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* 상단: 크롤링 버튼 + 마지막 업데이트 */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCrawl}
            disabled={crawling}
            className="px-5 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2 font-medium"
          >
            {crawling ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                크롤링 중...
              </>
            ) : (
              <>🔄 크롤링 실행</>
            )}
          </button>
          {lastCrawledAt && (
            <span className={`text-sm ${isStale ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>
              {isStale && '⚠️ '}마지막 업데이트: {formatDate(lastCrawledAt)}
            </span>
          )}
        </div>
        <span className="text-sm text-gray-400">
          총 {total.toLocaleString()}건
        </span>
      </div>

      {/* 필터 바 */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-3">
        {/* 지역 탭 */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => { setRegion(r.id); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                region === r.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* 날짜 필터 */}
        <input
          type="date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        {date && (
          <button
            onClick={() => { setDate(''); setPage(1); }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            날짜 초기화
          </button>
        )}

        {/* 검색 */}
        <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="제목 검색..."
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
          >
            검색
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              초기화
            </button>
          )}
        </form>
      </div>

      {/* 뉴스 목록 */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-400">
            <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-sky-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            불러오는 중...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-400">
            <p className="text-lg mb-2">수집된 뉴스가 없습니다</p>
            <p className="text-sm">위의 &quot;크롤링 실행&quot; 버튼을 눌러 뉴스를 수집하세요.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow ${
                item.is_used ? 'opacity-60 border-l-4 border-gray-300' : 'border-l-4 border-sky-400'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* 소스 + 날짜 */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${regionColor(item.source_region)}`}>
                      {item.source_region}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{item.source_name}</span>
                    <span className="text-xs text-gray-400">{formatDate(item.pub_date)}</span>
                    {item.is_used && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">사용됨</span>
                    )}
                  </div>

                  {/* 제목 */}
                  <h3 className="font-medium text-gray-900 mb-1 leading-snug">
                    {item.title}
                  </h3>

                  {/* 요약 */}
                  {item.summary && (
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </div>

                {/* 이미지 */}
                {item.image_url && (
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleCopySource(item)}
                  className="px-3 py-1.5 text-xs font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  📋 소재로 복사
                </button>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  🔗 원문 보기
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
          >
            ← 이전
          </button>
          <span className="text-sm text-gray-500 px-4">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"
          >
            다음 →
          </button>
        </div>
      )}
    </div>
  );
}
