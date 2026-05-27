'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core';

const SLOTS = [
  { id: 'headline',    label: '헤드라인 슬라이더', max: 2,    source: 'articles' },
  { id: 'subheadline', label: '서브헤드라인',     max: 1,    source: 'articles' },
  { id: 'news',        label: '최신뉴스 목록',    max: null, source: 'articles' },
  { id: 'focus',       label: '닥터포커스(흐름)', max: null, source: 'articles' },
  { id: 'opinion',     label: '오피니언 기고란',  max: 3,    source: 'opinions' },
];

function SlotSpec(id) {
  return SLOTS.find((s) => s.id === id);
}

// 날짜 추출 헬퍼 (다양한 필드명/포맷 대응)
function getItemDate(item) {
  const raw = item?.date || item?.created_at || item?.createdAt;
  if (!raw) return '';
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }
  try {
    return new Date(raw).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function DraggablePoolItem({ item, source, isSelected, onClick }) {
  const dragId = `pool-${source}-${item.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { item, source, from: 'pool' },
  });

  const date = getItemDate(item);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (isDragging) return;
        e.preventDefault();
        onClick?.();
      }}
      className={`group cursor-grab active:cursor-grabbing select-none rounded-md border bg-white px-3 py-2.5 mb-1.5 transition-colors ${
        isSelected ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-200' : 'border-gray-200 hover:border-gray-400'
      } ${isDragging ? 'opacity-30' : ''}`}
      title={item.title}
    >
      <div className="flex items-center gap-2 mb-1">
        {source === 'articles' && item.category && (
          <span className="text-xs font-bold text-brand-600 flex-shrink-0">
            {item.category}
          </span>
        )}
        {date && (
          <span className="text-xs text-gray-500 flex-shrink-0">{date}</span>
        )}
      </div>
      <div className="text-[15px] leading-snug text-gray-900 font-medium line-clamp-2">
        {item.title}
      </div>
    </div>
  );
}

function PlacedItem({ item, slotId, source, onRemove }) {
  const dragId = `placed-${slotId}-${item.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { item, source, from: 'slot', slotId },
  });
  const date = getItemDate(item);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 bg-white border border-gray-300 rounded px-2 py-1.5 mb-1 text-sm cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      {date && <span className="text-xs text-gray-400 flex-shrink-0">{date.slice(5)}</span>}
      <span className="line-clamp-1 flex-1 text-gray-800">{item.title}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.();
        }}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded text-lg leading-none"
        title="이 슬롯에서 제거"
      >
        ×
      </button>
    </div>
  );
}

function DroppableSlot({ slotId, label, max, items, onClickAdd, selectedItem, source, onRemove, accent = 'gray', children }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${slotId}` });
  const isFull = max !== null && items.length >= max;
  const canPlaceSelected =
    selectedItem &&
    selectedItem.source === source &&
    !items.some((it) => it.id === selectedItem.item.id) &&
    !isFull;

  const accentClass = {
    red: 'border-red-300',
    blue: 'border-blue-300',
    gray: 'border-gray-300',
    brand: 'border-brand-300',
    violet: 'border-violet-300',
  }[accent] || 'border-gray-300';

  return (
    <div
      ref={setNodeRef}
      onClick={() => canPlaceSelected && onClickAdd(selectedItem.item)}
      className={`relative rounded-md border-2 border-dashed ${accentClass} bg-white/60 p-3 transition-colors ${
        isOver ? 'bg-brand-50 border-brand-500 border-solid' : ''
      } ${canPlaceSelected ? 'cursor-pointer hover:bg-brand-50 hover:border-brand-400' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-bold text-gray-800">{label}</span>
        <span className="text-sm text-gray-500">
          {items.length}{max !== null ? ` / ${max}` : ''}
        </span>
      </div>
      {children}
      <div className="space-y-1">
        {items.length === 0 ? (
          <div className="text-sm text-gray-400 py-3 text-center">
            {canPlaceSelected ? '클릭해서 여기 배치' : '비어있음'}
          </div>
        ) : (
          items.map((it) => (
            <PlacedItem
              key={it.id}
              item={it}
              slotId={slotId}
              source={source}
              onRemove={() => onRemove(it.id)}
            />
          ))
        )}
      </div>
      {isFull && <div className="absolute top-2 right-2 text-xs text-red-600 font-bold bg-white px-1.5 rounded">FULL</div>}
    </div>
  );
}

function PCMiniature({ slots, selectedItem, onClickAdd, onRemove }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_1.6fr_1fr] gap-3">
        <DroppableSlot
          slotId="subheadline"
          label="서브헤드라인"
          max={1}
          items={slots.subheadline}
          selectedItem={selectedItem}
          source="articles"
          onClickAdd={(it) => onClickAdd('subheadline', it)}
          onRemove={(id) => onRemove('subheadline', id)}
          accent="blue"
        />
        <DroppableSlot
          slotId="headline"
          label="헤드라인 슬라이더 (중앙)"
          max={2}
          items={slots.headline}
          selectedItem={selectedItem}
          source="articles"
          onClickAdd={(it) => onClickAdd('headline', it)}
          onRemove={(id) => onRemove('headline', id)}
          accent="red"
        />
        <div className="rounded-md border-2 border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-500 flex items-center justify-center text-center leading-snug">
          카테고리 카드 4개<br />(자동 — 슬롯 X)
        </div>
      </div>

      <DroppableSlot
        slotId="focus"
        label="닥터포커스 (흐름)"
        max={null}
        items={slots.focus}
        selectedItem={selectedItem}
        source="articles"
        onClickAdd={(it) => onClickAdd('focus', it)}
        onRemove={(id) => onRemove('focus', id)}
        accent="brand"
      />

      <div className="grid grid-cols-[1.6fr_1fr] gap-3">
        <DroppableSlot
          slotId="news"
          label="최신뉴스 목록 (메인)"
          max={null}
          items={slots.news}
          selectedItem={selectedItem}
          source="articles"
          onClickAdd={(it) => onClickAdd('news', it)}
          onRemove={(id) => onRemove('news', id)}
          accent="gray"
        />
        <DroppableSlot
          slotId="opinion"
          label="오피니언 (사이드)"
          max={3}
          items={slots.opinion}
          selectedItem={selectedItem}
          source="opinions"
          onClickAdd={(it) => onClickAdd('opinion', it)}
          onRemove={(id) => onRemove('opinion', id)}
          accent="violet"
        />
      </div>
    </div>
  );
}

function MobileMiniature({ slots, selectedItem, onClickAdd, onRemove }) {
  return (
    <div className="max-w-sm mx-auto space-y-3">
      <DroppableSlot
        slotId="headline"
        label="헤드라인 슬라이더 (상단)"
        max={2}
        items={slots.headline}
        selectedItem={selectedItem}
        source="articles"
        onClickAdd={(it) => onClickAdd('headline', it)}
        onRemove={(id) => onRemove('headline', id)}
        accent="red"
      />
      <DroppableSlot
        slotId="focus"
        label="닥터포커스 (흐름)"
        max={null}
        items={slots.focus}
        selectedItem={selectedItem}
        source="articles"
        onClickAdd={(it) => onClickAdd('focus', it)}
        onRemove={(id) => onRemove('focus', id)}
        accent="brand"
      />
      <DroppableSlot
        slotId="news"
        label="최신뉴스 목록"
        max={null}
        items={slots.news}
        selectedItem={selectedItem}
        source="articles"
        onClickAdd={(it) => onClickAdd('news', it)}
        onRemove={(id) => onRemove('news', id)}
        accent="gray"
      />
      <DroppableSlot
        slotId="subheadline"
        label="서브헤드라인"
        max={1}
        items={slots.subheadline}
        selectedItem={selectedItem}
        source="articles"
        onClickAdd={(it) => onClickAdd('subheadline', it)}
        onRemove={(id) => onRemove('subheadline', id)}
        accent="blue"
      />
      <DroppableSlot
        slotId="opinion"
        label="오피니언 기고란"
        max={3}
        items={slots.opinion}
        selectedItem={selectedItem}
        source="opinions"
        onClickAdd={(it) => onClickAdd('opinion', it)}
        onRemove={(id) => onRemove('opinion', id)}
        accent="violet"
      />
    </div>
  );
}

export default function SlotManager({ articles = [], opinions = [], slots: rawSlots, setSlots: rawSetSlots, onSave, saving }) {
  const [device, setDevice] = useState('pc');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeDrag, setActiveDrag] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [poolTab, setPoolTab] = useState('articles');

  const slots = useMemo(() => ({
    headline: rawSlots?.headline || [],
    subheadline: rawSlots?.subheadline || [],
    news: rawSlots?.news || [],
    focus: rawSlots?.focus || [],
    opinion: rawSlots?.opinion || [],
  }), [rawSlots]);

  const setSlots = (next) => {
    if (typeof next === 'function') {
      rawSetSlots((prev) => next({
        headline: prev?.headline || [],
        subheadline: prev?.subheadline || [],
        news: prev?.news || [],
        focus: prev?.focus || [],
        opinion: prev?.opinion || [],
      }));
    } else {
      rawSetSlots(next);
    }
  };

  const allArticleSlotIds = useMemo(() => {
    return new Set(
      ['headline', 'subheadline', 'news', 'focus']
        .flatMap((p) => slots[p].map((a) => a.id))
    );
  }, [slots]);

  const allOpinionSlotIds = useMemo(() => {
    return new Set(slots.opinion.map((o) => o.id));
  }, [slots]);

  const categories = useMemo(() => {
    const set = new Set();
    articles.forEach((a) => a.category && set.add(a.category));
    return ['all', ...Array.from(set).sort()];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (allArticleSlotIds.has(a.id)) return false;
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      const d = getItemDate(a);
      if (dateFrom && (!d || d < dateFrom)) return false;
      if (dateTo && (!d || d > dateTo)) return false;
      if (q && !a.title?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [articles, allArticleSlotIds, categoryFilter, dateFrom, dateTo, search]);

  const filteredOpinions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return opinions.filter((o) => {
      if (allOpinionSlotIds.has(o.id)) return false;
      const d = getItemDate(o);
      if (dateFrom && (!d || d < dateFrom)) return false;
      if (dateTo && (!d || d > dateTo)) return false;
      if (q && !o.title?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [opinions, allOpinionSlotIds, dateFrom, dateTo, search]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function placeItem(slotId, item) {
    const spec = SlotSpec(slotId);
    if (!spec) return;
    const current = slots[slotId] || [];
    if (current.some((it) => it.id === item.id)) return;
    if (spec.max !== null && current.length >= spec.max) {
      alert(`${spec.label}은 최대 ${spec.max}개까지 가능합니다.`);
      return;
    }
    const next = { ...slots };
    if (spec.source === 'articles') {
      ['headline', 'subheadline', 'news', 'focus'].forEach((p) => {
        if (p !== slotId) next[p] = (next[p] || []).filter((it) => it.id !== item.id);
      });
    }
    next[slotId] = [...(next[slotId] || []), item];
    setSlots(next);
    setSelectedItem(null);
  }

  function removeFromSlot(slotId, itemId) {
    setSlots({
      ...slots,
      [slotId]: (slots[slotId] || []).filter((it) => it.id !== itemId),
    });
  }

  function handleDragStart(e) {
    setActiveDrag(e.active.data.current);
  }

  function handleDragEnd(e) {
    setActiveDrag(null);
    const over = e.over;
    if (!over) return;
    const overId = over.id;
    if (!String(overId).startsWith('slot-')) return;
    const targetSlot = String(overId).replace('slot-', '');
    const { item, source } = e.active.data.current || {};
    if (!item || !source) return;
    const spec = SlotSpec(targetSlot);
    if (!spec || spec.source !== source) return;
    placeItem(targetSlot, item);
  }

  function handlePoolClick(item, source) {
    if (selectedItem && selectedItem.item.id === item.id && selectedItem.source === source) {
      setSelectedItem(null);
    } else {
      setSelectedItem({ item, source });
    }
  }

  function clearDateFilter() {
    setDateFrom('');
    setDateTo('');
  }

  const MiniatureComponent = device === 'pc' ? PCMiniature : MobileMiniature;
  const hasDateFilter = !!(dateFrom || dateTo);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-5 text-base">
        {/* 헤더: 탭 + 저장 */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-navy">슬롯 관리</h2>
            <p className="text-base text-gray-600 mt-1.5">
              왼쪽 풀에서 기사를 <strong>드래그</strong>해 슬롯에 놓거나, <strong>클릭으로 선택</strong>한 뒤 슬롯을 클릭하면 배치됩니다.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="inline-flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setDevice('pc')}
                className={`px-4 py-2 text-base font-semibold ${device === 'pc' ? 'bg-navy text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                PC
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`px-4 py-2 text-base font-semibold ${device === 'mobile' ? 'bg-navy text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                모바일
              </button>
            </div>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2 bg-brand-600 text-white text-base font-bold hover:bg-brand-700 disabled:opacity-50 rounded"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        {/* 본문: 좌측 풀 + 우측 미니어처 */}
        <div className="grid grid-cols-[360px_1fr] gap-5">
          {/* 좌측 풀 — viewport 높이 기반으로 자동 늘림 */}
          <aside className="border border-gray-200 bg-gray-50 rounded flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
            <div className="p-3 border-b border-gray-200 space-y-2.5">
              {/* 기사/오피니언 탭 */}
              <div className="inline-flex border border-gray-300 rounded overflow-hidden w-full">
                <button
                  onClick={() => setPoolTab('articles')}
                  className={`flex-1 px-3 py-2 text-base font-semibold ${poolTab === 'articles' ? 'bg-navy text-white' : 'bg-white text-gray-700'}`}
                >
                  기사 ({filteredArticles.length})
                </button>
                <button
                  onClick={() => setPoolTab('opinions')}
                  className={`flex-1 px-3 py-2 text-base font-semibold ${poolTab === 'opinions' ? 'bg-navy text-white' : 'bg-white text-gray-700'}`}
                >
                  오피니언 ({filteredOpinions.length})
                </button>
              </div>

              {/* 검색 */}
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="제목 검색"
                className="w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              {/* 카테고리 필터 (기사 탭에서만) */}
              {poolTab === 'articles' && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c === 'all' ? '전체 카테고리' : c}</option>
                  ))}
                </select>
              )}

              {/* 날짜 범위 필터 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">작성 날짜</span>
                  {hasDateFilter && (
                    <button
                      onClick={clearDateFilter}
                      className="text-sm text-brand-600 hover:underline"
                    >
                      초기화
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="flex-1 min-w-0 px-2 py-2 text-base border border-gray-300 rounded"
                  />
                  <span className="text-gray-500 text-base">~</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="flex-1 min-w-0 px-2 py-2 text-base border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* 선택됨 알림 */}
            {selectedItem && (
              <div className="mx-3 mt-3 px-3 py-2.5 bg-brand-50 border border-brand-300 rounded">
                <div className="text-sm text-brand-700 font-bold mb-1">선택됨 (슬롯 클릭하면 배치)</div>
                <div className="line-clamp-1 text-base text-gray-800">{selectedItem.item.title}</div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-sm text-gray-500 hover:text-red-600 mt-1"
                >
                  선택 취소
                </button>
              </div>
            )}

            {/* 스크롤 영역 (flex-1로 남은 공간 가득 채움) */}
            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
              {poolTab === 'articles'
                ? filteredArticles.map((a) => (
                    <DraggablePoolItem
                      key={a.id}
                      item={a}
                      source="articles"
                      isSelected={selectedItem?.item.id === a.id && selectedItem?.source === 'articles'}
                      onClick={() => handlePoolClick(a, 'articles')}
                    />
                  ))
                : filteredOpinions.map((o) => (
                    <DraggablePoolItem
                      key={o.id}
                      item={o}
                      source="opinions"
                      isSelected={selectedItem?.item.id === o.id && selectedItem?.source === 'opinions'}
                      onClick={() => handlePoolClick(o, 'opinions')}
                    />
                  ))}
              {((poolTab === 'articles' && filteredArticles.length === 0) ||
                (poolTab === 'opinions' && filteredOpinions.length === 0)) && (
                <div className="text-center text-base text-gray-400 py-10">
                  배치 가능한 항목 없음
                </div>
              )}
            </div>
          </aside>

          {/* 우측 미니어처 */}
          <section className="border border-gray-200 bg-gray-100 p-5 rounded">
            <div className="text-sm font-semibold text-gray-600 mb-3">
              {device === 'pc' ? '🖥️ PC 레이아웃 미리보기' : '📱 모바일 레이아웃 미리보기'}
            </div>
            <MiniatureComponent
              slots={slots}
              selectedItem={selectedItem}
              onClickAdd={placeItem}
              onRemove={removeFromSlot}
            />
          </section>
        </div>
      </div>

      <DragOverlay>
        {activeDrag ? (
          <div className="rounded-md border border-brand-600 bg-white px-3 py-2 text-base shadow-lg max-w-xs">
            <span className="line-clamp-1 text-gray-800 font-medium">{activeDrag.item?.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
