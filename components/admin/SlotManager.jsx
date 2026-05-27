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

/**
 * 슬롯 정의 — 실제 메인 페이지 그리드 위치와 매핑
 * - id: placement 값과 일치
 * - source: 'articles' | 'opinions'
 */
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

// 좌측 풀의 드래그 가능 카드
function DraggablePoolItem({ item, source, isSelected, onClick }) {
  const dragId = `pool-${source}-${item.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { item, source, from: 'pool' },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // 드래그 중에는 클릭 이벤트 무시
        if (isDragging) return;
        e.preventDefault();
        onClick?.();
      }}
      className={`group cursor-grab active:cursor-grabbing select-none rounded-md border bg-white px-2 py-1.5 mb-1 text-[12px] leading-snug transition-colors ${
        isSelected ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-200' : 'border-gray-200 hover:border-gray-400'
      } ${isDragging ? 'opacity-30' : ''}`}
      title={item.title}
    >
      <div className="flex items-center gap-1.5">
        {source === 'articles' && (
          <span className="text-[10px] font-bold text-brand-600 flex-shrink-0">
            {item.category || '미분류'}
          </span>
        )}
        <span className="line-clamp-1 text-gray-800 font-medium">{item.title}</span>
      </div>
    </div>
  );
}

// 슬롯 안에 배치된 아이템 (드래그로 다른 슬롯/풀로 이동 가능)
function PlacedItem({ item, slotId, source, onRemove }) {
  const dragId = `placed-${slotId}-${item.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { item, source, from: 'slot', slotId },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-1 bg-white border border-gray-300 rounded px-1.5 py-1 text-[11px] mb-1 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <span className="line-clamp-1 flex-1 text-gray-800">{item.title}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.();
        }}
        className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-600 text-base leading-none"
        title="이 슬롯에서 제거"
      >
        ×
      </button>
    </div>
  );
}

// 드롭 가능한 슬롯 박스
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
      className={`relative rounded-md border-2 border-dashed ${accentClass} bg-white/60 p-2 transition-colors ${
        isOver ? 'bg-brand-50 border-brand-500 border-solid' : ''
      } ${canPlaceSelected ? 'cursor-pointer hover:bg-brand-50 hover:border-brand-400' : ''}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-gray-700">{label}</span>
        <span className="text-[10px] text-gray-500">
          {items.length}{max !== null ? ` / ${max}` : ''}
        </span>
      </div>
      {children}
      <div className="space-y-0.5">
        {items.length === 0 ? (
          <div className="text-[11px] text-gray-400 py-2 text-center">
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
      {isFull && <div className="absolute top-1 right-1 text-[10px] text-red-600 font-bold">FULL</div>}
    </div>
  );
}

// PC 미니어처 레이아웃 (HERO 3컬럼 + 메인-사이드 2컬럼)
function PCMiniature({ slots, selectedItem, onClickAdd, onRemove }) {
  return (
    <div className="space-y-3">
      {/* HERO 3컬럼 */}
      <div className="grid grid-cols-[1fr_1.6fr_1fr] gap-2">
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
        {/* 우측 카테고리 카드는 카테고리 자동 — 슬롯 아님 */}
        <div className="rounded-md border-2 border-dashed border-gray-200 bg-gray-50 p-2 text-[11px] text-gray-400 flex items-center justify-center text-center">
          카테고리 카드 4개<br />(자동 — 슬롯 X)
        </div>
      </div>

      {/* 닥터포커스(흐름) */}
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

      {/* 메인 영역 + 사이드 */}
      <div className="grid grid-cols-[1.6fr_1fr] gap-2">
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

// 모바일 미니어처 레이아웃 (세로 stack)
function MobileMiniature({ slots, selectedItem, onClickAdd, onRemove }) {
  return (
    <div className="max-w-xs mx-auto space-y-2">
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

export default function SlotManager({ articles = [], opinions = [], slots, setSlots, onSave, saving }) {
  const [device, setDevice] = useState('pc'); // 'pc' | 'mobile'
  const [selectedItem, setSelectedItem] = useState(null); // { item, source }
  const [activeDrag, setActiveDrag] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [poolTab, setPoolTab] = useState('articles'); // 'articles' | 'opinions'

  const allArticleSlotIds = useMemo(() => {
    return new Set(
      ['headline', 'subheadline', 'news', 'focus']
        .flatMap((p) => (slots[p] || []).map((a) => a.id))
    );
  }, [slots]);

  const allOpinionSlotIds = useMemo(() => {
    return new Set((slots.opinion || []).map((o) => o.id));
  }, [slots]);

  const categories = useMemo(() => {
    const set = new Set();
    articles.forEach((a) => a.category && set.add(a.category));
    return ['all', ...Array.from(set).sort()];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (allArticleSlotIds.has(a.id)) return false;
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (search && !a.title?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [articles, allArticleSlotIds, categoryFilter, search]);

  const filteredOpinions = useMemo(() => {
    return opinions.filter((o) => {
      if (allOpinionSlotIds.has(o.id)) return false;
      if (search && !o.title?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [opinions, allOpinionSlotIds, search]);

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
    // 다른 슬롯에서 이동했다면 거기서 제거 (articles 슬롯들만, opinion은 자체로만)
    const next = { ...slots };
    if (spec.source === 'articles') {
      ['headline', 'subheadline', 'news', 'focus'].forEach((p) => {
        if (p !== slotId) next[p] = (next[p] || []).filter((it) => it.id !== item.id);
      });
    }
    next[slotId] = [...(next[slotId] || []), item];
    setSlots(next);
    // 클릭-배치 모드라면 선택 해제
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

  const MiniatureComponent = device === 'pc' ? PCMiniature : MobileMiniature;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {/* 헤더: 탭 + 저장 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy">슬롯 관리</h2>
            <p className="text-xs text-gray-500 mt-1">
              왼쪽 풀에서 기사를 <strong>드래그</strong>해 슬롯에 놓거나, 기사를 <strong>클릭해서 선택</strong>한 뒤 슬롯을 클릭하면 배치됩니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setDevice('pc')}
                className={`px-3 py-1.5 text-sm font-semibold ${device === 'pc' ? 'bg-navy text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                PC
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`px-3 py-1.5 text-sm font-semibold ${device === 'mobile' ? 'bg-navy text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                모바일
              </button>
            </div>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-1.5 bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        {/* 본문: 좌측 풀 + 우측 미니어처 */}
        <div className="grid grid-cols-[280px_1fr] gap-4">
          {/* 좌측 풀 */}
          <aside className="border border-gray-200 bg-gray-50 p-3 rounded">
            <div className="inline-flex border border-gray-300 rounded overflow-hidden mb-3 w-full">
              <button
                onClick={() => setPoolTab('articles')}
                className={`flex-1 px-2 py-1 text-xs font-semibold ${poolTab === 'articles' ? 'bg-navy text-white' : 'bg-white text-gray-700'}`}
              >
                기사 ({filteredArticles.length})
              </button>
              <button
                onClick={() => setPoolTab('opinions')}
                className={`flex-1 px-2 py-1 text-xs font-semibold ${poolTab === 'opinions' ? 'bg-navy text-white' : 'bg-white text-gray-700'}`}
              >
                오피니언 ({filteredOpinions.length})
              </button>
            </div>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제목 검색"
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />

            {poolTab === 'articles' && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded mb-2"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'all' ? '전체 카테고리' : c}</option>
                ))}
              </select>
            )}

            {selectedItem && (
              <div className="mb-2 px-2 py-1.5 bg-brand-50 border border-brand-300 rounded text-[11px]">
                <div className="text-brand-700 font-bold">선택됨 (슬롯 클릭하면 배치)</div>
                <div className="line-clamp-1 text-gray-700">{selectedItem.item.title}</div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-[10px] text-gray-500 hover:text-red-600 mt-0.5"
                >
                  선택 취소
                </button>
              </div>
            )}

            <div className="overflow-y-auto max-h-[600px] pr-1">
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
                <div className="text-center text-xs text-gray-400 py-6">
                  배치 가능한 항목 없음
                </div>
              )}
            </div>
          </aside>

          {/* 우측 미니어처 */}
          <section className="border border-gray-200 bg-gray-100 p-4 rounded">
            <div className="text-[11px] text-gray-500 mb-2">
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

      {/* 드래그 중인 카드 미리보기 */}
      <DragOverlay>
        {activeDrag ? (
          <div className="rounded-md border border-brand-600 bg-white px-2 py-1.5 text-[12px] shadow-lg max-w-xs">
            <span className="line-clamp-1 text-gray-800 font-medium">{activeDrag.item?.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
