'use client';

import { useMemo, useState, useEffect } from 'react';
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
  { id: 'strip',    label: '띠배너',              guide: '2400×180',  accent: 'brand',  max: 4, rolling: true },
  { id: 'headline', label: '헤드라인 슬라이더 광고', guide: '1600×800',  accent: 'red',    max: 4, rolling: true },
  { id: 'sidebar',  label: '사이드바 광고',        guide: '576×192',  accent: 'violet', max: 4, rolling: false },
  { id: 'hero_ad',  label: 'HERO 카드 하단 광고',  guide: '576×144',  accent: 'gray',   max: 4, rolling: true },
];

const DEFAULT_SLOT_SETTING = { rolling: true, interval: 5 };

const POOL_ID = 'pool-inactive';

const accentBorder = {
  red: 'border-red-300',
  gray: 'border-gray-300',
  brand: 'border-brand-300',
  violet: 'border-violet-300',
};

// 오늘 날짜 (YYYY-MM-DD)
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// MM.DD 표기
function fmtMD(dateStr) {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${m}.${d}`;
}

// 게재 기간 → 상태 배지 정보 (없으면 null)
function scheduleBadge(ad) {
  const today = todayStr();
  const start = ad.startDate;
  const end = ad.endDate;
  if (start && start > today) {
    return { label: '예약', className: 'bg-blue-100 text-blue-700' };
  }
  if (end && end < today) {
    return { label: '만료', className: 'bg-red-100 text-red-700' };
  }
  if (end) {
    // 종료 7일 이내면 D-n (문자열 날짜 → UTC 자정 기준 일수 차)
    const diffDays = Math.round((new Date(end + 'T00:00:00Z') - new Date(today + 'T00:00:00Z')) / 86400000);
    if (diffDays >= 0 && diffDays <= 7) {
      return { label: `D-${diffDays}`, className: 'bg-orange-100 text-orange-700' };
    }
  }
  return null;
}

function AdCard({ ad, isSelected, onClick, draggable = true, compact = false, order, onMoveUp, onMoveDown, canMoveUp, canMoveDown }) {
  const dragId = `ad-${ad.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { ad },
    disabled: !draggable,
  });
  const reorderable = onMoveUp || onMoveDown;

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
        {typeof order === 'number' && (
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">{order}</span>
        )}
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
          <div className="flex items-center gap-1.5 min-w-0">
            {(() => {
              const badge = scheduleBadge(ad);
              return badge ? (
                <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.className}`}>{badge.label}</span>
              ) : null;
            })()}
            <span className="text-[13px] font-bold text-gray-800 line-clamp-1">{ad.title || '(제목 없음)'}</span>
            {ad.advertiser && (
              <span className="flex-shrink-0 text-[11px] text-gray-400">· {ad.advertiser}</span>
            )}
          </div>
          {(ad.startDate || ad.endDate) && (
            <div className="text-[10px] text-gray-400 line-clamp-1">
              {fmtMD(ad.startDate) || '상시'}~{fmtMD(ad.endDate) || '상시'}
            </div>
          )}
          {!compact && ad.link && (
            <div className="text-[11px] text-gray-400 line-clamp-1">{ad.link}</div>
          )}
        </div>
        {reorderable && (
          <div className="flex flex-col flex-shrink-0">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onMoveUp?.(); }}
              disabled={!canMoveUp}
              className="px-1 leading-none text-gray-400 hover:text-brand-600 disabled:opacity-20 disabled:hover:text-gray-400"
              aria-label="순서 위로"
            >▲</button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onMoveDown?.(); }}
              disabled={!canMoveDown}
              className="px-1 leading-none text-gray-400 hover:text-brand-600 disabled:opacity-20 disabled:hover:text-gray-400"
              aria-label="순서 아래로"
            >▼</button>
          </div>
        )}
      </div>
    </div>
  );
}

function DroppableAdSlot({ slotId, label, guide, accent, max, ads, selectedAd, onClickAdd, configurable = false, setting = DEFAULT_SLOT_SETTING, onSettingChange, onReorder }) {
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

      {/* 노출 방식 설정 */}
      {configurable ? (
        <div className="flex items-center gap-3 mb-2 text-sm" onClick={(e) => e.stopPropagation()}>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={!!setting.rolling}
              onChange={(e) => onSettingChange?.({ rolling: e.target.checked })}
              className="w-4 h-4 accent-brand-600"
            />
            <span className="font-medium text-gray-700">자동 롤링</span>
          </label>
          {setting.rolling ? (
            <label className="flex items-center gap-1 text-gray-600">
              간격
              <input
                type="number"
                min="1"
                max="60"
                value={setting.interval}
                onChange={(e) => onSettingChange?.({ interval: Number(e.target.value) })}
                className="w-14 px-1.5 py-0.5 border border-gray-300 rounded text-center"
              />
              초
            </label>
          ) : (
            <span className="text-gray-400">순서 1번만 고정 노출</span>
          )}
        </div>
      ) : (
        <div className="mb-2 text-sm text-gray-400">동시 노출 (활성 광고 전체 표시)</div>
      )}

      <div className="space-y-1">
        {ads.length === 0 ? (
          <div className="text-sm text-gray-400 py-3 text-center">
            {canPlaceSelected ? '클릭해서 여기 배치' : '활성 광고 없음'}
          </div>
        ) : (
          ads.map((ad, idx) => (
            <AdCard
              key={ad.id}
              ad={ad}
              compact
              order={idx + 1}
              onMoveUp={onReorder ? () => onReorder(idx, idx - 1) : undefined}
              onMoveDown={onReorder ? () => onReorder(idx, idx + 1) : undefined}
              canMoveUp={idx > 0}
              canMoveDown={idx < ads.length - 1}
            />
          ))
        )}
      </div>

      {isFull && <div className="absolute top-2 right-2 text-xs text-red-600 font-bold bg-white px-1.5 rounded">FULL</div>}
    </div>
  );
}

function PCAdMiniature({ slotsAds, selectedAd, onClickAddToSlot, slotSettings, onSettingChange, onReorderSlot }) {
  const make = (slotId) => (ad) => onClickAddToSlot(slotId, ad);
  const cfg = (slotId) => ({
    configurable: AD_SLOTS.find((s) => s.id === slotId)?.rolling ?? false,
    setting: slotSettings?.[slotId] || DEFAULT_SLOT_SETTING,
    onSettingChange: (patch) => onSettingChange(slotId, patch),
    onReorder: (from, to) => onReorderSlot(slotId, from, to),
  });
  return (
    <div className="space-y-3">
      <DroppableAdSlot slotId="strip" label="띠배너 (DOCTOR'S PICK 아래)" guide="2400×180" accent="brand" max={4}
        ads={slotsAds.strip} selectedAd={selectedAd} onClickAdd={make('strip')} {...cfg('strip')} />
      <DroppableAdSlot slotId="headline" label="헤드라인 슬라이더 광고 (HERO 중앙)" guide="1600×800" accent="red" max={4}
        ads={slotsAds.headline} selectedAd={selectedAd} onClickAdd={make('headline')} {...cfg('headline')} />
      <DroppableAdSlot slotId="sidebar" label="사이드바 광고 (PC 우측 컬럼)" guide="576×192" accent="violet" max={4}
        ads={slotsAds.sidebar} selectedAd={selectedAd} onClickAdd={make('sidebar')} {...cfg('sidebar')} />
      <DroppableAdSlot slotId="hero_ad" label="HERO 카드 하단 광고 (우측 카테고리 카드 아래)" guide="576×144" accent="gray" max={4}
        ads={slotsAds.hero_ad} selectedAd={selectedAd} onClickAdd={make('hero_ad')} {...cfg('hero_ad')} />
      <p className="text-xs text-gray-500 px-1 leading-snug">
        ※ 사이드바 광고는 모바일 네이티브 광고(기사 목록 사이)에도 재사용됩니다.
      </p>
    </div>
  );
}

function MobileAdMiniature({ slotsAds, selectedAd, onClickAddToSlot, slotSettings, onSettingChange, onReorderSlot }) {
  const make = (slotId) => (ad) => onClickAddToSlot(slotId, ad);
  const cfg = (slotId) => ({
    configurable: AD_SLOTS.find((s) => s.id === slotId)?.rolling ?? false,
    setting: slotSettings?.[slotId] || DEFAULT_SLOT_SETTING,
    onSettingChange: (patch) => onSettingChange(slotId, patch),
    onReorder: (from, to) => onReorderSlot(slotId, from, to),
  });
  return (
    <div className="max-w-sm mx-auto space-y-3">
      <DroppableAdSlot slotId="strip" label="띠배너 (모바일 상단)" guide="2400×180" accent="brand" max={4}
        ads={slotsAds.strip} selectedAd={selectedAd} onClickAdd={make('strip')} {...cfg('strip')} />
      <DroppableAdSlot slotId="headline" label="헤드라인 슬라이더 광고" guide="1600×800" accent="red" max={4}
        ads={slotsAds.headline} selectedAd={selectedAd} onClickAdd={make('headline')} {...cfg('headline')} />
      <DroppableAdSlot slotId="sidebar" label="사이드바 광고 (모바일 인라인)" guide="576×192" accent="violet" max={4}
        ads={slotsAds.sidebar} selectedAd={selectedAd} onClickAdd={make('sidebar')} {...cfg('sidebar')} />
      <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-2 leading-snug">
        ※ HERO 카드 하단 광고는 PC 전용입니다.<br />
        ※ 모바일 네이티브 광고(기사 목록 사이)에도 사이드바 배너가 재사용됩니다.
      </p>
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
  const [slotSettings, setSlotSettings] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let active = true;
    fetch('/api/settings/ad-slots')
      .then((r) => r.json())
      .then((data) => { if (active) setSlotSettings(data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const slotsAds = useMemo(() => ({
    strip:    banners.filter((b) => b.type === 'strip' && b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)),
    headline: banners.filter((b) => b.type === 'headline' && b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)),
    sidebar:  banners.filter((b) => b.type === 'sidebar' && b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)),
    hero_ad:  banners.filter((b) => b.type === 'hero_ad' && b.isActive).sort((a, b) => (a.order || 0) - (b.order || 0)),
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
      showToast(`${spec.label}은 최대 ${spec.max}개까지 가능합니다.`, 'error');
      return;
    }
    setSaving(true);
    try {
      await onUpdate(ad.id, { ...ad, type: targetType, isActive: true });
      await onRefresh?.();
    } catch (e) {
      console.error(e);
      showToast('변경 실패: ' + e.message, 'error');
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
      showToast('비활성화 실패: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  // 슬롯 내 광고 순서 변경 (sort_order 재부여) — bulk PATCH 한 번으로 처리
  async function reorderSlot(slotId, fromIndex, toIndex) {
    const arr = [...(slotsAds[slotId] || [])];
    if (toIndex < 0 || toIndex >= arr.length || fromIndex === toIndex) return;
    const [moved] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, moved);
    const orders = arr.map((ad, i) => ({ id: ad.id, order: i + 1 }));
    setSaving(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '순서 변경 실패');
      }
      await onRefresh?.();
    } catch (e) {
      console.error(e);
      showToast('순서 변경 실패: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  // 슬롯 노출 설정(롤링/간격) 변경 — 즉시 저장
  async function updateSlotSetting(slotId, patch) {
    const base = slotSettings || {};
    const next = {
      ...base,
      [slotId]: { ...DEFAULT_SLOT_SETTING, ...(base[slotId] || {}), ...patch },
    };
    setSlotSettings(next);
    try {
      await fetch('/api/settings/ad-slots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
    } catch (e) {
      console.error('슬롯 설정 저장 실패', e);
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
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white transition-all ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {toast.message}
        </div>
      )}
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
              slotSettings={slotSettings}
              onSettingChange={updateSlotSetting}
              onReorderSlot={reorderSlot}
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
