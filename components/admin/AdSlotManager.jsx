'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
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

// 광고 슬롯 정의 — 메인 페이지 그리드 위치와 매핑
const AD_SLOTS = [
  { id: 'gnb',      label: 'GNB 상단배너',       guide: '480×128',   accent: 'gray',   max: 1 },
  { id: 'strip',    label: '띠배너',              guide: '2400×180',  accent: 'brand',  max: null },
  { id: 'headline', label: '헤드라인 슬라이더 광고', guide: '1600×800',  accent: 'red',    max: null },
  { id: 'sidebar',  label: '사이드바 광고',        guide: '576×192',  accent: 'violet', max: null },
];

const POOL_ID = 'pool-inactive';

const accentBorder = {
  red: 'border-red-300',
  gray: 'border-gray-300',
  brand: 'border-brand-300',
  violet: 'border-violet-300',
};

function AdCard({ ad, isSelected, onClick, draggable = true, compact = false }) {
  const dragId = `ad-${ad.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { ad },
    disabled: !draggable,
  });

  return (
    <div
      ref={setNodeRef}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
      onClick={(e) => {
        if (isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
      }}
      className={`group cursor-grab active:cursor-grabbing select-none rounded-md border bg-white transition-colors ${
        isSelected ? 'border-brand-600 ring-2 ring-brand-200' : 'border-gray-200 hover:border-gray-400'
      } ${isDragging ? 'opacity-30' : ''} ${compact ? 'p-1.5 mb-1' : 'p-2 mb-1.5'}`}
      title={ad.title}
    >
      <div className="flex items-center gap-2">
        {ad.image && (
          <div className={`relative flex-shrink-0 bg-gray-100 overflow-hidden ${compact ? 'w-12 h-8' : 'w-16 h-10'}`}>
            <Image
              src={ad.image}
              alt={ad.title || ''}
              fill
              sizes={compact ? '48px' : '64px'}
              className="object-cover"
              unoptimized={ad.image?.endsWith?.('.gif')}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-gray-800 line-clamp-1">{ad.title || '(제목 없음)'}</div>
          {!compact && ad.link && (
            <div className="text-[11px] text-gray-400 line-clamp-1">{ad.link}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function DroppableAdSlot({ slotId, label, guide, accent, max, ads, selectedAd, onClickAdd }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${slotId}` });
  const isFull = max !== null && ads.length >= max;
  const canPlaceSelected = selectedAd && !ads.some((a) => a.id === selectedAd.id) && !isFull;

  return (
    <div
      ref={setNodeRef}
      onClick={() => canPlaceSelected && onClickAdd(selectedAd)}
      className={`relative rounded-md border-2 border-dashed ${accentBorder[accent] || 'border-gray-300'} bg-white/60 p-3 transition-colors ${
        isOver ? 'bg-brand-50 border-brand-500 border-solid' : ''
      } ${canPlaceSelected ? 'cursor-pointer hover:bg-brand-50 hover:border-brand-400' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-base font-bold text-gray-800">{label}</span>
          <span className="text-xs text-gray-400">{guide}</span>
        </div>
        <span className="text-sm text-gray-500 flex-shrink-0">
          {ads.length}{max !== null ? ` / ${max}` : ''}
        </span>
      </div>

      <div className="space-y-1">
        {ads.length === 0 ? (
          <div className="text-sm text-gray-400 py-3 text-center">
            {canPlaceSelected ? '클릭해서 여기 배치' : '활성 광고 없음'}
          </div>
        ) : (
          ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} compact />
          ))
        )}
      </div>

      {isFull && <div className="absolute top-2 right-2 text-xs text-red-600 font-bold bg-white px-1.5 rounded">FULL</div>}
    </div>
  );
}

function PCAdMiniature({ slotsAds, selectedAd, onClickAddToSlot }) {
  const make = (slotId) => (ad) => onClickAddToSlot(slotId, ad);
  return (
    <div className="space-y-3">
      <DroppableAdSlot slotId="gnb" label="GNB 상단배너 (헤더 우측)" guide="480×128" accent="gray" max={1}
        ads={slotsAds.gnb} selectedAd={selectedAd} onClickAdd={make('gnb')} />
      <DroppableAdSlot slotId="strip" label="띠배너 (DOCTOR'S PICK 아래)" guide="2400×180" accent="brand" max={null}
        ads={slotsAds.strip} selectedAd={selectedAd} onClickAdd={make('strip')} />
      <DroppableAdSlot slotId="headline" label="헤드라인 슬라이더 광고 (HERO 중앙)" guide="1600×800" accent="red" max={null}
        ads={slotsAds.headline} selectedAd={selectedAd} onClickAdd={make('headline')} />
      <DroppableAdSlot slotId="sidebar" label="사이드바 광고 (PC 우측 컬럼)" guide="576×192" accent="violet" max={null}
        ads={slotsAds.sidebar} selectedAd={selectedAd} onClickAdd={make('sidebar')} />
    </div>
  );
}

function MobileAdMiniature({ slotsAds, selectedAd, onClickAddToSlot }) {
  const make = (slotId) => (ad) => onClickAddToSlot(slotId, ad);
  return (
    <div className="max-w-sm mx-auto space-y-3">
      <DroppableAdSlot slotId="strip" label="띠배너 (모바일 상단)" guide="2400×180" accent="brand" max={null}
        ads={slotsAds.strip} selectedAd={selectedAd} onClickAdd={make('strip')} />
      <DroppableAdSlot slotId="headline" label="헤드라인 슬라이더 광고" guide="1600×800" accent="red" max={null}
        ads={slotsAds.headline} selectedAd={selectedAd} onClickAdd={make('headline')} />
      <DroppableAdSlot slotId="sidebar" label="사이드바 광고 (모바일 인라인)" guide="576×192" accent="violet" max={null}
        ads={slotsAds.sidebar} selectedAd={selectedAd} onClickAdd={make('sidebar')} />
      {/* GNB는 모바일에선 안 보임 */}
    </div>
  );
}

export default function AdSlotManager({ banners = [], onUpdate, onRefresh }) {
  const [device, setDevice] = useState('pc');
  const [selectedAd, setSelectedAd] = useState(null);
  const [activeDrag, setActiveDrag] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [saving, setSaving] = useState(false);

  const slotsAds = useMemo(() => ({
    gnb:      banners.filter((b) => b.type === 'gnb' && b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)),
    strip:    banners.filter((b) => b.type === 'strip' && b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)),
    headline: banners.filter((b) => b.type === 'headline' && b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)),
    sidebar:  banners.filter((b) => b.type === 'sidebar' && b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)),
  }), [banners]);

  // 비활성 광고만 풀에 노출
  const inactiveAds = useMemo(() => {
    return banners.filter((b) => !b.isActive);
  }, [banners]);

  const filteredPool = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inactiveAds.filter((b) => {
      if (typeFilter !== 'all' && b.type !== typeFilter) return false;
      if (q && !(b.title || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [inactiveAds, typeFilter, search]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function activateAndMove(ad, targetType) {
    const spec = AD_SLOTS.find((s) => s.id === targetType);
    if (!spec) return;
    // max 체크
    const currentInTarget = slotsAds[targetType] || [];
    if (spec.max !== null && currentInTarget.length >= spec.max && ad.type !== targetType) {
      alert(`${spec.label}은 최대 ${spec.max}개까지 가능합니다.`);
      return;
    }
    setSaving(true);
    try {
      await onUpdate(ad.id, { ...ad, type: targetType, isActive: true });
      await onRefresh?.();
    } catch (e) {
      console.error(e);
      alert('변경 실패: ' + e.message);
    } finally {
      setSaving(false);
      setSelectedAd(null);
    }
  }

  async function deactivate(ad) {
    setSaving(true);
    try {
      await onUpdate(ad.id, { ...ad, isActive: false });
      await onRefresh?.();
    } catch (e) {
      console.error(e);
      alert('비활성화 실패: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDragStart(e) { setActiveDrag(e.active.data.current); }

  async function handleDragEnd(e) {
    setActiveDrag(null);
    const over = e.over;
    if (!over) return;
    const overId = String(over.id);
    const ad = e.active.data.current?.ad;
    if (!ad) return;
    if (overId.startsWith('slot-')) {
      const targetType = overId.replace('slot-', '');
      await activateAndMove(ad, targetType);
    } else if (overId === POOL_ID) {
      await deactivate(ad);
    }
  }

  function handlePoolClick(ad) {
    if (selectedAd?.id === ad.id) setSelectedAd(null);
    else setSelectedAd(ad);
  }

  function PoolDropArea({ children }) {
    const { setNodeRef, isOver } = useDroppable({ id: POOL_ID });
    return (
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 overflow-y-auto px-3 py-3 transition-colors ${isOver ? 'bg-gray-200/70' : ''}`}
      >
        {children}
      </div>
    );
  }

  const Miniature = device === 'pc' ? PCAdMiniature : MobileAdMiniature;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-5 text-base">
        {/* 상단 안내 + 컨트롤 */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-base text-gray-600 leading-snug">
            왼쪽 풀(비활성 광고)에서 광고를 <strong>드래그</strong>해 슬롯에 놓거나, <strong>클릭으로 선택</strong>한 뒤 슬롯을 클릭하면 활성화·배치됩니다. 슬롯 안 광고를 풀로 다시 끌면 비활성화됩니다. 광고 등록/수정은 <strong>광고 소재 만들기</strong> 탭에서 진행합니다.
          </p>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="inline-flex border border-gray-300 rounded overflow-hidden">
              <button onClick={() => setDevice('pc')} className={`px-4 py-2 text-base font-semibold ${device === 'pc' ? 'bg-navy text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>PC</button>
              <button onClick={() => setDevice('mobile')} className={`px-4 py-2 text-base font-semibold ${device === 'mobile' ? 'bg-navy text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>모바일</button>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="grid grid-cols-[320px_1fr] gap-5">
          {/* 좌측 풀 */}
          <aside className="border border-gray-200 bg-gray-50 rounded flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
            <div className="p-3 border-b border-gray-200 space-y-2.5">
              <div className="text-base font-bold text-navy">
                비활성 광고 풀 <span className="text-sm text-gray-500 font-medium">({filteredPool.length})</span>
              </div>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="제목 검색"
                className="w-full px-3 py-2 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded bg-white"
              >
                <option value="all">전체 타입</option>
                {AD_SLOTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {selectedAd && (
              <div className="mx-3 mt-3 px-3 py-2.5 bg-brand-50 border border-brand-300 rounded">
                <div className="text-sm text-brand-700 font-bold mb-1">선택됨 (슬롯 클릭하면 배치)</div>
                <div className="line-clamp-1 text-base text-gray-800">{selectedAd.title || '(제목 없음)'}</div>
                <button onClick={() => setSelectedAd(null)} className="text-sm text-gray-500 hover:text-red-600 mt-1">선택 취소</button>
              </div>
            )}

            <PoolDropArea>
              {filteredPool.length === 0 ? (
                <div className="text-center text-base text-gray-400 py-10">
                  비활성 광고 없음
                </div>
              ) : (
                filteredPool.map((ad) => (
                  <AdCard
                    key={ad.id}
                    ad={ad}
                    isSelected={selectedAd?.id === ad.id}
                    onClick={() => handlePoolClick(ad)}
                  />
                ))
              )}
            </PoolDropArea>
          </aside>

          {/* 우측 미니어처 */}
          <section className="border border-gray-200 bg-gray-100 p-5 rounded">
            <div className="text-sm font-semibold text-gray-600 mb-3">
              {device === 'pc' ? '🖥️ PC 광고 배치' : '📱 모바일 광고 배치'}
            </div>
            <Miniature
              slotsAds={slotsAds}
              selectedAd={selectedAd}
              onClickAddToSlot={(slotId, ad) => activateAndMove(ad, slotId)}
            />
          </section>
        </div>
      </div>

      <DragOverlay>
        {activeDrag?.ad && (
          <div className="rounded-md border border-brand-600 bg-white px-2 py-1.5 text-sm shadow-lg max-w-xs">
            <span className="line-clamp-1 text-gray-800 font-medium">{activeDrag.ad.title}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
