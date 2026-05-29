'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

const TYPE_LABELS = {
  headline: '헤드라인 슬라이더',
  sidebar: '사이드바',
  gnb: 'GNB 상단',
  strip: '띠배너',
};

const TYPE_GUIDES = {
  headline: '1600×800',
  sidebar: '576×192',
  gnb: '480×128',
  strip: '2400×180',
};

const NEW_BLANK = { mode: 'new', ad: null, type: 'headline' };

// --- 광고 위치 미리보기 ---
function AdPreview({ type, image }) {
  const isType = (t) => type === t;

  const ImageOrPlaceholder = ({ active, label, className }) => (
    <div className={`relative bg-white border border-gray-300 rounded overflow-hidden ${className} ${active ? 'ring-2 ring-brand-500 ring-offset-2' : ''}`}>
      {active && image ? (
        <Image
          src={image}
          alt={label}
          fill
          sizes="400px"
          className="object-cover"
          unoptimized={image?.endsWith?.('.gif')}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-500 px-2 text-center leading-snug">
          {label}
        </div>
      )}
    </div>
  );

  return (
    <div className="border border-gray-200 bg-white rounded p-5">
      <div className="text-lg font-bold text-navy mb-1">📍 노출 위치 미리보기</div>
      <div className="text-sm text-gray-600 mb-4 leading-snug">
        선택한 광고 타입의 위치가 <span className="text-brand-600 font-bold">브랜드 컬러</span>로 강조됩니다. 이미지를 업로드하면 슬롯 안에 그대로 표시됩니다.
      </div>

      <div className="bg-gray-100 rounded-md p-3 space-y-2.5">
        {/* Header + GNB */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white border border-gray-300 rounded px-3 py-2.5 text-sm font-semibold text-gray-600">
            🌐 Dr.News
          </div>
          <ImageOrPlaceholder active={isType('gnb')} label="GNB" className="w-28 h-12 flex-shrink-0" />
        </div>

        {/* Brand line */}
        <div className="h-1 bg-brand-600 rounded" />

        {/* DOCTOR'S PICK */}
        <div className="bg-white border border-gray-200 rounded px-3 py-2 text-sm text-gray-500 text-center font-medium">
          DOCTOR&apos;S PICK
        </div>

        {/* Strip 띠배너 */}
        <ImageOrPlaceholder active={isType('strip')} label="띠배너" className="w-full h-12" />

        {/* HERO 3컬럼 */}
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-2">
          <div className="bg-white border border-gray-200 rounded h-36 text-sm font-medium text-gray-500 flex items-center justify-center text-center leading-snug">
            보조<br />헤드
          </div>
          <ImageOrPlaceholder active={isType('headline')} label="헤드라인 슬라이더" className="h-36" />
          <div className="bg-white border border-gray-200 rounded h-36 text-sm font-medium text-gray-500 flex items-center justify-center text-center leading-snug">
            카테고리<br />카드
          </div>
        </div>

        {/* 메인 + 사이드 */}
        <div className="grid grid-cols-[2fr_1fr] gap-2">
          <div className="bg-white border border-gray-200 rounded h-40 text-sm font-medium text-gray-500 flex items-center justify-center">
            최신뉴스 목록
          </div>
          <ImageOrPlaceholder active={isType('sidebar')} label="사이드바 광고" className="h-40" />
        </div>

        {/* 안내 */}
        <div className="text-sm text-gray-600 text-center pt-2 leading-relaxed">
          {type === 'headline' && '※ 헤드라인 광고는 슬라이더 안에서 일반 헤드라인 기사와 번갈아 노출됩니다'}
          {type === 'sidebar' && '※ 사이드바는 PC 우측 컬럼·카테고리카드 하단·모바일 뉴스 사이 등에 노출'}
          {type === 'gnb' && '※ GNB 배너는 헤더 우측에 항상 고정 노출'}
          {type === 'strip' && '※ 띠배너는 DOCTOR\'S PICK 직하 전체폭에 노출'}
        </div>
      </div>
    </div>
  );
}

export default function AdCreationManager({
  banners = [],
  onUpdate,
  onDelete,
  onRefresh,
  renderEditor,
}) {
  const [editing, setEditing] = useState(NEW_BLANK);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [formPreview, setFormPreview] = useState({ image: '', title: '' });

  const filtered = useMemo(() => {
    const list = filter === 'all' ? banners : banners.filter((b) => b.type === filter);
    return [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [banners, filter]);

  const handleSave = async (form) => {
    const ad = editing.ad;
    const type = editing.type;
    const sameType = banners.filter((b) => b.type === type);
    const maxOrder = sameType.reduce((m, b) => Math.max(m, b.order || 0), 0);
    const bannerData = {
      title: form.title,
      description: form.description,
      image: form.image,
      link: form.link || '#',
      type,
      isActive: ad?.isActive ?? true,
      order: ad?.order ?? (maxOrder + 1),
      positions: type === 'sidebar' ? form.positions : undefined,
    };
    try {
      await onUpdate(ad ? ad.id : null, bannerData);
      await onRefresh?.();
      setEditing({ ...NEW_BLANK, type });
      setFormPreview({ image: '', title: '' });
      alert(ad ? '수정되었습니다.' : '등록되었습니다.');
    } catch (e) {
      console.error('Error saving banner:', e);
      alert('저장 실패: ' + e.message);
    }
  };

  const handleDelete = async (ad) => {
    if (!confirm(`"${ad.title || '광고'}"를 삭제하시겠어요?`)) return;
    setBusyId(ad.id);
    try {
      await onDelete(ad.id);
      await onRefresh?.();
      if (editing.ad?.id === ad.id) setEditing(NEW_BLANK);
    } catch (e) {
      console.error(e);
      alert('삭제 실패: ' + e.message);
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = async (ad) => {
    setBusyId(ad.id);
    try {
      await onUpdate(ad.id, { ...ad, isActive: !ad.isActive });
      await onRefresh?.();
    } catch (e) {
      console.error(e);
      alert('상태 변경 실패: ' + e.message);
    } finally {
      setBusyId(null);
    }
  };

  const boxClass = 'border border-gray-200 bg-white rounded-lg p-5 shadow-sm';
  const headerClass = 'flex items-center justify-between mb-4 gap-3 min-h-[36px]';

  return (
    <div className="grid grid-cols-[360px_minmax(0,1fr)_480px] gap-5 items-start">
      {/* 좌: 광고 등록/수정 폼 */}
      <div className={`${boxClass} sticky top-4`}>
        <div className={headerClass}>
          <h3 className="text-lg font-bold text-navy">
            {editing.mode === 'edit' ? '광고 수정' : '새 광고 등록'}
          </h3>
          {editing.mode === 'edit' && (
            <button
              onClick={() => { setEditing(NEW_BLANK); setFormPreview({ image: '', title: '' }); }}
              className="text-sm text-gray-500 hover:text-navy"
            >
              새로 등록
            </button>
          )}
        </div>

        {editing.mode === 'new' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">광고 타입</label>
            <select
              value={editing.type}
              onChange={(e) => setEditing({ ...editing, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-base bg-white"
            >
              <option value="headline">{TYPE_LABELS.headline} ({TYPE_GUIDES.headline})</option>
              <option value="sidebar">{TYPE_LABELS.sidebar} ({TYPE_GUIDES.sidebar})</option>
              <option value="gnb">{TYPE_LABELS.gnb}배너 ({TYPE_GUIDES.gnb})</option>
              <option value="strip">{TYPE_LABELS.strip} ({TYPE_GUIDES.strip})</option>
            </select>
          </div>
        )}

        {renderEditor({
          ad: editing.ad,
          type: editing.type,
          onSave: handleSave,
          onCancel: () => { setEditing(NEW_BLANK); setFormPreview({ image: '', title: '' }); },
          onFormChange: setFormPreview,
        })}
      </div>

      {/* 가운데: 광고 소재 목록 */}
      <div className={boxClass}>
        <div className={headerClass}>
          <h3 className="text-lg font-bold text-navy">
            광고 소재 <span className="text-gray-500 font-medium">({filtered.length})</span>
          </h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
          >
            <option value="all">전체</option>
            <option value="headline">{TYPE_LABELS.headline}</option>
            <option value="sidebar">{TYPE_LABELS.sidebar}</option>
            <option value="gnb">{TYPE_LABELS.gnb}</option>
            <option value="strip">{TYPE_LABELS.strip}</option>
          </select>
        </div>

        <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 260px)' }}>
          {filtered.length === 0 ? (
            <div className="text-center text-base text-gray-400 py-10 bg-gray-50 rounded">
              등록된 광고 없음
            </div>
          ) : (
            filtered.map((ad) => {
              const isEditing = editing.ad?.id === ad.id;
              return (
                <div
                  key={ad.id}
                  className={`p-3 rounded border transition-colors ${
                    isEditing
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 w-20 h-12 relative bg-gray-100 rounded overflow-hidden border border-gray-200">
                      {ad.image && (
                        <Image
                          src={ad.image}
                          alt={ad.title || ''}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized={ad.image?.endsWith?.('.gif')}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-navy line-clamp-1">{ad.title || '(제목 없음)'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded mr-1.5">
                          {TYPE_LABELS[ad.type] || ad.type}
                        </span>
                        {TYPE_GUIDES[ad.type] || ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleActive(ad)}
                      disabled={busyId === ad.id}
                      className={`flex-shrink-0 px-2 py-1 text-xs font-bold rounded ${
                        ad.isActive
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      } disabled:opacity-50`}
                    >
                      {ad.isActive ? '활성' : '비활성'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing({ mode: 'edit', ad, type: ad.type })}
                      className="flex-1 px-3 py-1.5 text-sm font-semibold text-navy border border-gray-300 rounded hover:bg-gray-50"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ad)}
                      disabled={busyId === ad.id}
                      className="flex-1 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 우: 노출 위치 미리보기 (sticky) */}
      <div className="sticky top-4">
        <AdPreview type={editing.type} image={formPreview.image || editing.ad?.image || ''} />
      </div>
    </div>
  );
}
