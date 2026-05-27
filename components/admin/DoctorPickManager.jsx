'use client';

import { useEffect, useState } from 'react';

const EMPTY = { label: '', title: '', link: '', display_order: 0, is_active: true };

export default function DoctorPickManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // null = 신규 폼 닫힘
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctor-picks', { cache: 'no-store' });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing('new');
    setForm({ ...EMPTY, display_order: (items[items.length - 1]?.display_order || 0) + 1 });
  };

  const openEdit = (item) => {
    setEditing(item.id);
    setForm({
      label: item.label || '',
      title: item.title || '',
      link: item.link || '',
      display_order: item.display_order ?? 0,
      is_active: item.is_active ?? true,
    });
  };

  const cancel = () => {
    setEditing(null);
    setForm(EMPTY);
  };

  const save = async () => {
    if (!form.label.trim() || !form.link.trim()) {
      alert('라벨과 링크는 필수입니다.');
      return;
    }
    setSaving(true);
    try {
      const isNew = editing === 'new';
      const url = isNew ? '/api/doctor-picks' : `/api/doctor-picks/${editing}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e?.error || '저장 실패');
      }
      await load();
      cancel();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('이 픽을 삭제할까요?')) return;
    try {
      const res = await fetch(`/api/doctor-picks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleActive = async (item) => {
    try {
      const res = await fetch(`/api/doctor-picks/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      if (!res.ok) throw new Error('상태 변경 실패');
      await load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">DOCTOR&apos;S PICK 관리</h2>
          <p className="text-sm text-gray-500 mt-1">
            홈 상단 픽 영역에 노출되는 큐레이션 항목 (활성화된 항목 중 순서가 빠른 3개가 노출됩니다).
          </p>
        </div>
        {editing === null && (
          <button
            onClick={openNew}
            className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            + 신규 픽 추가
          </button>
        )}
      </div>

      {/* 폼 (신규 또는 수정) */}
      {editing !== null && (
        <div className="border border-gray-200 p-5 bg-gray-50 space-y-3">
          <h3 className="font-bold text-navy">{editing === 'new' ? '신규 픽' : '픽 수정'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">라벨 <span className="text-brand-600">*</span></span>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="예: 사설·칼럼"
                className="mt-1 w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">보조 제목 (선택, PC에만 노출)</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="예: 세상을 바라보는 창"
                className="mt-1 w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">링크 <span className="text-brand-600">*</span></span>
            <input
              type="text"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="/article/123 또는 https://..."
              className="mt-1 w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">노출 순서</span>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 accent-brand-600"
              />
              <span className="text-sm font-medium text-gray-700">활성화 (홈에 노출)</span>
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={cancel}
              className="px-4 py-2 border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 목록 */}
      <div className="border border-gray-200 bg-white">
        <div className="grid grid-cols-[60px_120px_1fr_1fr_80px_180px] gap-2 px-4 py-2 bg-gray-100 text-xs font-bold text-gray-700">
          <div>순서</div>
          <div>라벨</div>
          <div>보조 제목</div>
          <div>링크</div>
          <div>상태</div>
          <div>작업</div>
        </div>
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">등록된 픽이 없습니다.</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[60px_120px_1fr_1fr_80px_180px] gap-2 px-4 py-3 border-t border-gray-100 items-center text-sm"
            >
              <div className="text-gray-500">{item.display_order}</div>
              <div className="font-bold text-brand-600">{item.label}</div>
              <div className="text-gray-700 truncate">{item.title || '-'}</div>
              <div className="text-gray-500 truncate" title={item.link}>{item.link}</div>
              <div>
                <button
                  onClick={() => toggleActive(item)}
                  className={`px-2 py-0.5 text-xs font-medium ${
                    item.is_active ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {item.is_active ? '활성' : '비활성'}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="text-xs font-semibold text-navy hover:text-brand-600"
                >
                  수정
                </button>
                <button
                  onClick={() => remove(item.id)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
