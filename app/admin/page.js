'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { articles as initialArticles } from '@/data/articles';
import { ceoReports as initialCeoReports } from '@/data/ceoReports';
import { opinions as initialOpinions } from '@/data/opinions';
import { initialBanners } from '@/data/banners';

// 게재영역 정의
const PLACEMENT_OPTIONS = [
  { id: 'headline', label: '헤드라인 슬라이더', color: 'red', max: 1 },
  { id: 'subheadline', label: '서브헤드라인', color: 'blue', max: 1 },
  { id: 'news', label: '최신뉴스 목록', color: 'gray', max: null },
  { id: 'opinion', label: '오피니언 기고란', color: 'violet', max: 2 },
];

// 이미지 사이즈 가이드
const IMAGE_GUIDES = {
  headline: { width: 800, height: 400, label: '헤드라인 (800x400)' },
  subheadline: { width: 640, height: 360, label: '서브헤드라인 (640x360)' },
  news: { width: 320, height: 200, label: '뉴스목록 (320x200)' },
  opinion: { width: 100, height: 100, label: '프로필 (100x100)' },
  ceo: { width: 100, height: 100, label: '프로필 (100x100)' },
};

// 사이드바 컴포넌트
function AdminSidebar({ currentMenu, setCurrentMenu }) {
  const menuItems = [
    { id: 'articles', label: '기사 관리', icon: '📰' },
    { id: 'ceo', label: 'CEO 리포트', icon: '✍️' },
    { id: 'slots', label: '슬롯 관리', icon: '📋' },
    { id: 'ads', label: '광고 관리', icon: '📊' },
  ];

  return (
    <aside className="w-64 bg-navy min-h-screen p-4">
      <div className="mb-8">
        <Link href="/" className="text-xl font-bold text-white">
          Dr.News
        </Link>
        <p className="text-gray-400 text-sm mt-1">관리자 페이지</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentMenu(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentMenu === item.id
                ? 'bg-sky-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-slate-700">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          사이트로 돌아가기
        </Link>
      </div>
    </aside>
  );
}

// 이미지 업로더 컴포넌트
function ImageUploader({ currentImage, onImageChange, guide }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentImage || '');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 실제로는 서버에 업로드하고 URL을 받아야 함
      // 여기서는 미리보기용 Data URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlInput = (url) => {
    setPreview(url);
    onImageChange(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium text-gray-700">대표 이미지</label>
        {guide && (
          <span className="text-xs text-gray-400">권장: {guide.label}</span>
        )}
      </div>

      {/* 미리보기 */}
      {preview && (
        <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
          <Image src={preview} alt="미리보기" fill className="object-cover" />
          <button
            type="button"
            onClick={() => { setPreview(''); onImageChange(''); }}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 업로드 옵션 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          파일 업로드
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* URL 입력 */}
      <input
        type="text"
        placeholder="또는 이미지 URL 입력"
        value={preview}
        onChange={(e) => handleUrlInput(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      />
    </div>
  );
}

// 기사 에디터 컴포넌트
function ArticleEditor({ article, onSave, onCancel, placement }) {
  const initialPlacement = article?.placement || placement || 'news';
  const defaultCategory = initialPlacement === 'opinion' ? '칼럼' : '정책';

  const [form, setForm] = useState({
    title: article?.title || '',
    category: article?.category || defaultCategory,
    author: article?.author || '',
    summary: article?.summary || '',
    content: article?.content || '',
    image: article?.image || '',
    placement: initialPlacement,
  });

  const articleCategories = ['정책', '학술', '병원', '산업', 'AI', '제약·바이오'];
  const opinionCategories = ['칼럼', '기고'];
  const categories = form.placement === 'opinion' ? opinionCategories : articleCategories;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('제목과 본문을 입력해주세요.');
      return;
    }
    onSave(form);
  };

  const currentGuide = IMAGE_GUIDES[form.placement] || IMAGE_GUIDES.news;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {article ? '기사 수정' : '기사 작성'}
        </h2>
        {onCancel && (
          <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
            취소
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 게재영역 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">게재영역</label>
          <div className="flex flex-wrap gap-2">
            {PLACEMENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  const newCategory = opt.id === 'opinion' ? '칼럼' : '정책';
                  setForm({ ...form, placement: opt.id, category: newCategory });
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  form.placement === opt.id
                    ? `bg-${opt.color}-500 text-white`
                    : `bg-${opt.color}-50 text-${opt.color}-600 hover:bg-${opt.color}-100`
                }`}
                style={{
                  backgroundColor: form.placement === opt.id
                    ? (opt.color === 'red' ? '#ef4444' : opt.color === 'blue' ? '#3b82f6' : opt.color === 'violet' ? '#8b5cf6' : '#6b7280')
                    : undefined,
                  color: form.placement === opt.id ? 'white' : undefined
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="기사 제목을 입력하세요"
          />
        </div>

        {/* 카테고리 & 기자명 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.placement === 'opinion' ? '기고자명 / 직함' : '기자명'}
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder={form.placement === 'opinion' ? '홍길동 / 의료경영학 박사' : '김기자'}
            />
          </div>
        </div>

        {/* 이미지 업로드 */}
        <ImageUploader
          currentImage={form.image}
          onImageChange={(url) => setForm({ ...form, image: url })}
          guide={currentGuide}
        />

        {/* 요약 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">요약</label>
          <input
            type="text"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="기사 요약을 입력하세요"
          />
        </div>

        {/* 본문 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
            placeholder="기사 본문을 입력하세요"
          />
        </div>

        <button
          type="submit"
          className={`w-full py-3 text-white font-medium rounded-lg transition-colors ${
            article ? 'bg-green-600 hover:bg-green-700' : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          {article ? '수정 완료' : '발행하기'}
        </button>
      </form>
    </div>
  );
}

// 기사 관리 탭
function ArticleManager({ articles, setArticles, opinions, setOpinions }) {
  const [activeTab, setActiveTab] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [filterPlacement, setFilterPlacement] = useState('all');

  // 기사와 오피니언 합쳐서 표시
  const allItems = [
    ...articles.map(a => ({ ...a, type: 'article', placement: a.placement || 'news' })),
    ...opinions.map(o => ({ ...o, type: 'opinion', placement: 'opinion' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredItems = filterPlacement === 'all'
    ? allItems
    : allItems.filter(item => item.placement === filterPlacement);

  const handleSave = (form) => {
    if (form.placement === 'opinion') {
      // 오피니언으로 저장
      const newOpinion = {
        id: editingItem?.id || Date.now(),
        title: form.title,
        summary: form.summary,
        content: form.content,
        author: form.author.split('/')[0]?.trim() || form.author,
        authorTitle: form.author.split('/')[1]?.trim() || '',
        authorImage: form.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        date: editingItem?.date || new Date().toISOString().split('T')[0],
        category: form.category,
      };
      if (editingItem?.type === 'opinion') {
        setOpinions(opinions.map(o => o.id === editingItem.id ? newOpinion : o));
      } else {
        setOpinions([newOpinion, ...opinions]);
      }
    } else {
      // 일반 기사로 저장
      const newArticle = {
        id: editingItem?.id || Date.now(),
        ...form,
        date: editingItem?.date || new Date().toISOString().split('T')[0],
        image: form.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop',
        isHeadline: form.placement === 'headline',
        views: editingItem?.views || 0,
      };
      if (editingItem?.type === 'article') {
        setArticles(articles.map(a => a.id === editingItem.id ? newArticle : a));
      } else {
        setArticles([newArticle, ...articles]);
      }
    }
    setEditingItem(null);
    setActiveTab('list');
    alert(editingItem ? '수정되었습니다.' : '발행되었습니다.');
  };

  const handleDelete = (item) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    if (item.type === 'opinion') {
      setOpinions(opinions.filter(o => o.id !== item.id));
    } else {
      setArticles(articles.filter(a => a.id !== item.id));
    }
  };

  const getPlacementBadge = (placement) => {
    const opt = PLACEMENT_OPTIONS.find(o => o.id === placement);
    if (!opt) return null;
    const colors = {
      red: 'bg-red-100 text-red-600',
      blue: 'bg-blue-100 text-blue-600',
      violet: 'bg-violet-100 text-violet-600',
      gray: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded ${colors[opt.color]}`}>
        {opt.label}
      </span>
    );
  };

  return (
    <div>
      {/* 탭 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => { setActiveTab('list'); setEditingItem(null); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'list' ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          기사 목록
        </button>
        <button
          onClick={() => { setActiveTab('write'); setEditingItem(null); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'write' ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          새 기사 작성
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* 필터 */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">게재영역:</span>
            <button
              onClick={() => setFilterPlacement('all')}
              className={`px-3 py-1 text-sm rounded-lg ${filterPlacement === 'all' ? 'bg-navy text-white' : 'bg-gray-100'}`}
            >
              전체
            </button>
            {PLACEMENT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setFilterPlacement(opt.id)}
                className={`px-3 py-1 text-sm rounded-lg ${filterPlacement === opt.id ? 'bg-navy text-white' : 'bg-gray-100'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 목록 */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getPlacementBadge(item.placement)}
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                    <p className="font-medium text-gray-900 mb-1">{item.title}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{item.summary}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingItem(item); setActiveTab('write'); }}
                      className="px-3 py-1.5 text-sm bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'write' && (
        <ArticleEditor
          article={editingItem}
          onSave={handleSave}
          onCancel={() => { setEditingItem(null); setActiveTab('list'); }}
        />
      )}
    </div>
  );
}

// CEO 리포트 에디터
function CeoReportEditor({ report, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: report?.title || '',
    subtitle: report?.subtitle || '',
    content: report?.content || '',
    author: report?.author || '김의료',
    authorTitle: report?.authorTitle || 'Dr.News 대표',
    authorImage: report?.authorImage || '',
    category: report?.category || '경영철학',
    weekNumber: report?.weekNumber || Math.ceil((new Date().getDate()) / 7),
  });

  const categories = ['경영철학', '리더십', '의료혁신', '미래전망'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('제목과 본문을 입력해주세요.');
      return;
    }
    onSave(form);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {report ? 'CEO 리포트 수정' : 'CEO 리포트 작성'}
        </h2>
        {onCancel && (
          <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
            취소
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            placeholder="의료의 본질, 다시 환자 중심으로"
          />
        </div>

        {/* 부제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">부제목</label>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            placeholder="디지털 전환 시대, 우리가 놓치지 말아야 할 것"
          />
        </div>

        {/* 카테고리 & 주차 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">주차</label>
            <input
              type="number"
              value={form.weekNumber}
              onChange={(e) => setForm({ ...form, weekNumber: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              min="1"
              max="52"
            />
          </div>
        </div>

        {/* 저자 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">저자명</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">직함</label>
            <input
              type="text"
              value={form.authorTitle}
              onChange={(e) => setForm({ ...form, authorTitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* 프로필 이미지 */}
        <ImageUploader
          currentImage={form.authorImage}
          onImageChange={(url) => setForm({ ...form, authorImage: url })}
          guide={IMAGE_GUIDES.ceo}
        />

        {/* 본문 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 resize-none"
            placeholder="철학적인 에세이 내용을 작성하세요..."
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-lg"
        >
          {report ? '수정 완료' : '발행하기'}
        </button>
      </form>
    </div>
  );
}

// CEO 리포트 관리 탭
function CeoReportManager({ reports, setReports }) {
  const [activeTab, setActiveTab] = useState('list');
  const [editingReport, setEditingReport] = useState(null);

  const handleSave = (form) => {
    const newReport = {
      id: editingReport?.id || Date.now(),
      ...form,
      date: editingReport?.date || new Date().toISOString().split('T')[0],
      authorImage: form.authorImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
    };

    if (editingReport) {
      setReports(reports.map(r => r.id === editingReport.id ? newReport : r));
    } else {
      setReports([newReport, ...reports]);
    }
    setEditingReport(null);
    setActiveTab('list');
    alert(editingReport ? '수정되었습니다.' : '발행되었습니다.');
  };

  const handleDelete = (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setReports(reports.filter(r => r.id !== id));
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => { setActiveTab('list'); setEditingReport(null); }}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'list' ? 'bg-navy text-white' : 'bg-gray-100'}`}
        >
          리포트 목록
        </button>
        <button
          onClick={() => { setActiveTab('write'); setEditingReport(null); }}
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'write' ? 'bg-navy text-white' : 'bg-gray-100'}`}
        >
          새 리포트 작성
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {reports.map((report) => (
              <div key={report.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-600 rounded">
                        {report.category}
                      </span>
                      <span className="text-xs text-gray-400">{report.date} · 제{report.weekNumber}주차</span>
                    </div>
                    <p className="font-medium text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-500 italic">"{report.subtitle}"</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingReport(report); setActiveTab('write'); }}
                      className="px-3 py-1.5 text-sm bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'write' && (
        <CeoReportEditor
          report={editingReport}
          onSave={handleSave}
          onCancel={() => { setEditingReport(null); setActiveTab('list'); }}
        />
      )}
    </div>
  );
}

// 슬롯 관리 탭
function SlotManager({ articles, slots, setSlots }) {
  const getSlotArticles = (placement) => {
    return slots[placement] || [];
  };

  const availableArticles = articles.filter(a => {
    // 이미 슬롯에 배치된 기사 제외
    const allSlotIds = Object.values(slots).flat().map(a => a.id);
    return !allSlotIds.includes(a.id);
  });

  const addToSlot = (placement, article) => {
    const opt = PLACEMENT_OPTIONS.find(o => o.id === placement);
    const currentSlot = slots[placement] || [];

    if (opt.max && currentSlot.length >= opt.max) {
      alert(`${opt.label}은 최대 ${opt.max}개까지 가능합니다.`);
      return;
    }

    setSlots({
      ...slots,
      [placement]: [...currentSlot, article],
    });
  };

  const removeFromSlot = (placement, articleId) => {
    setSlots({
      ...slots,
      [placement]: (slots[placement] || []).filter(a => a.id !== articleId),
    });
  };

  const SlotSection = ({ placement, label, color, max }) => {
    const slotArticles = getSlotArticles(placement);
    const borderColors = {
      red: 'border-red-300 bg-red-50',
      blue: 'border-blue-300 bg-blue-50',
      violet: 'border-violet-300 bg-violet-50',
      gray: 'border-gray-300 bg-gray-50',
    };

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700">{label}</h3>
          <span className="text-sm text-gray-400">
            {slotArticles.length}{max ? ` / ${max}` : ''}개
          </span>
        </div>
        <div className={`p-4 border-2 border-dashed rounded-lg min-h-[80px] ${borderColors[color]}`}>
          {slotArticles.length > 0 ? (
            <div className="space-y-2">
              {slotArticles.map((article, idx) => (
                <div key={article.id} className="flex items-center justify-between bg-white p-2 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">{idx + 1}</span>
                    <span className="text-sm font-medium truncate">{article.title}</span>
                  </div>
                  <button
                    onClick={() => removeFromSlot(placement, article.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center text-sm py-4">기사를 배치하세요</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 좌측: 기사 선택 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">기사 선택</h2>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {availableArticles.map((article) => (
            <div key={article.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400">{article.date}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {PLACEMENT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => addToSlot(opt.id, article)}
                      className="text-[10px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded whitespace-nowrap"
                    >
                      {opt.label.replace(' 슬라이더', '').replace(' 목록', '').replace(' 기고란', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {availableArticles.length === 0 && (
            <p className="text-center text-gray-400 py-8">모든 기사가 배치되었습니다</p>
          )}
        </div>
      </div>

      {/* 우측: 슬롯 배치 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">슬롯 배치</h2>
        {PLACEMENT_OPTIONS.map(opt => (
          <SlotSection
            key={opt.id}
            placement={opt.id}
            label={opt.label}
            color={opt.color}
            max={opt.max}
          />
        ))}
      </div>
    </div>
  );
}

// 광고 에디터 컴포넌트
function AdEditor({ ad, adType, onSave, onCancel }) {
  const typeInfo = {
    headline: {
      label: '헤드라인 슬라이더 광고',
      imageGuide: '800x400',
      description: '메인 상단 슬라이더에 노출되는 대형 광고',
    },
    sidebar: {
      label: '사이드바 광고',
      imageGuide: '800x400',
      description: 'PC 사이드바 및 모바일 뉴스 사이에 노출',
    },
    gnb: {
      label: 'GNB 상단배너',
      imageGuide: '160x50',
      description: '상단 로고 옆에 표시되는 소형 배너',
    },
  };

  const info = typeInfo[adType] || typeInfo.sidebar;

  const [form, setForm] = useState({
    title: ad?.title || '',
    description: ad?.description || '',
    image: ad?.image || '',
    link: ad?.link || '',
    positions: ad?.positions || {
      sidebarPC: true,
      mobileBetween: true,
      mobileInline: true,
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.image) {
      alert('제목과 이미지를 입력해주세요.');
      return;
    }
    onSave(form);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {ad ? '광고 수정' : '새 광고 등록'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{info.description}</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
            취소
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">광고 제목</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="의료기기 박람회 2026"
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">광고 설명</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="국내 최대 의료기기 전시회"
          />
        </div>

        {/* 이미지 */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-sm font-medium text-gray-700">이미지 URL</label>
            <span className="text-xs text-gray-400">권장: {info.imageGuide}</span>
          </div>
          <input
            type="text"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="https://images.unsplash.com/..."
          />
          {form.image && (
            <div className="mt-2 relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
              <Image src={form.image} alt="미리보기" fill className="object-cover" />
            </div>
          )}
        </div>

        {/* 링크 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">클릭 URL</label>
          <input
            type="text"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="https://example.com"
          />
        </div>

        {/* 사이드바 광고일 때 노출 위치 선택 */}
        {adType === 'sidebar' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">노출 위치</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'sidebarPC', label: 'PC 사이드바' },
                { key: 'mobileBetween', label: '모바일: 뉴스 사이' },
                { key: 'mobileInline', label: '모바일: 목록 내' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                    form.positions[key]
                      ? 'bg-sky-100 text-sky-700 border border-sky-300'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.positions[key]}
                    onChange={() => setForm({
                      ...form,
                      positions: { ...form.positions, [key]: !form.positions[key] },
                    })}
                    className="sr-only"
                  />
                  <span className={`w-3 h-3 rounded-full ${form.positions[key] ? 'bg-sky-500' : 'bg-gray-300'}`} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-3 text-white font-medium rounded-lg transition-colors ${
            ad ? 'bg-green-600 hover:bg-green-700' : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          {ad ? '수정 완료' : '등록하기'}
        </button>
      </form>
    </div>
  );
}

// 광고 관리
function AdManager({ banners, setBanners }) {
  const [selectedType, setSelectedType] = useState('headline');
  const [activeTab, setActiveTab] = useState('list');
  const [editingAd, setEditingAd] = useState(null);

  const typeLabels = {
    headline: '헤드라인 광고',
    sidebar: '사이드바 광고',
    gnb: 'GNB 상단배너',
  };

  const positionLabels = {
    sidebarPC: 'PC 사이드바',
    mobileBetween: '모바일: 뉴스 사이',
    mobileInline: '모바일: 목록 내',
  };

  const filteredBanners = banners
    .filter((b) => b.type === selectedType)
    .sort((a, b) => a.order - b.order);

  const toggleActive = (id) => {
    setBanners(banners.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
  };

  const togglePosition = (id, position) => {
    setBanners(banners.map((b) => {
      if (b.id === id) {
        const newPositions = {
          ...(b.positions || { sidebarPC: true, mobileBetween: true, mobileInline: true }),
          [position]: !(b.positions?.[position] ?? true),
        };
        return { ...b, positions: newPositions };
      }
      return b;
    }));
  };

  const handleSave = (form) => {
    const maxOrder = filteredBanners.reduce((max, b) => Math.max(max, b.order), 0);

    const newBanner = {
      id: editingAd?.id || Date.now(),
      title: form.title,
      description: form.description,
      image: form.image,
      link: form.link || '#',
      type: selectedType,
      isActive: editingAd?.isActive ?? true,
      order: editingAd?.order ?? maxOrder + 1,
      ...(selectedType === 'sidebar' && { positions: form.positions }),
    };

    if (editingAd) {
      setBanners(banners.map((b) => (b.id === editingAd.id ? newBanner : b)));
    } else {
      setBanners([...banners, newBanner]);
    }

    setEditingAd(null);
    setActiveTab('list');
    alert(editingAd ? '수정되었습니다.' : '등록되었습니다.');
  };

  const handleDelete = (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setBanners(banners.filter((b) => b.id !== id));
  };

  return (
    <div>
      {/* 타입 선택 탭 */}
      <div className="flex gap-2 mb-4">
        {Object.entries(typeLabels).map(([type, label]) => (
          <button
            key={type}
            onClick={() => {
              setSelectedType(type);
              setActiveTab('list');
              setEditingAd(null);
            }}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedType === type ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 서브 탭: 목록/등록 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => { setActiveTab('list'); setEditingAd(null); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'list' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          광고 목록
        </button>
        <button
          onClick={() => { setActiveTab('create'); setEditingAd(null); }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'create' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          새 광고 등록
        </button>
      </div>

      {/* 광고 목록 */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{typeLabels[selectedType]} 목록</h2>

          <div className="space-y-4">
            {filteredBanners.map((banner) => (
              <div
                key={banner.id}
                className={`p-4 border rounded-lg ${
                  banner.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-24 h-14 relative rounded overflow-hidden flex-shrink-0">
                    <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{banner.title}</p>
                    <p className="text-sm text-gray-500">{banner.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingAd(banner); setActiveTab('create'); }}
                      className="px-3 py-1.5 text-sm bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg"
                    >
                      삭제
                    </button>
                    <button
                      onClick={() => toggleActive(banner.id)}
                      className={`px-4 py-2 rounded-full font-medium ${
                        banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-300'
                      }`}
                    >
                      {banner.isActive ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* 사이드바 광고일 때 노출 위치 선택 */}
                {selectedType === 'sidebar' && banner.isActive && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-2">노출 위치</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(positionLabels).map(([key, label]) => {
                        const isChecked = banner.positions?.[key] ?? true;
                        return (
                          <label
                            key={key}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-sky-100 text-sky-700 border border-sky-300'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePosition(banner.id, key)}
                              className="sr-only"
                            />
                            <span className={`w-3 h-3 rounded-full ${isChecked ? 'bg-sky-500' : 'bg-gray-300'}`} />
                            {label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredBanners.length === 0 && (
            <p className="text-center text-gray-500 py-8">등록된 배너가 없습니다.</p>
          )}
        </div>
      )}

      {/* 광고 등록/수정 폼 */}
      {activeTab === 'create' && (
        <AdEditor
          ad={editingAd}
          adType={selectedType}
          onSave={handleSave}
          onCancel={() => { setEditingAd(null); setActiveTab('list'); }}
        />
      )}
    </div>
  );
}

// 메인 관리자 페이지
export default function AdminPage() {
  const [currentMenu, setCurrentMenu] = useState('articles');
  const [articles, setArticles] = useState(initialArticles);
  const [ceoReports, setCeoReports] = useState(initialCeoReports);
  const [opinions, setOpinions] = useState(initialOpinions);
  const [banners, setBanners] = useState(initialBanners);
  const [slots, setSlots] = useState({
    headline: initialArticles.filter(a => a.isHeadline),
    subheadline: initialArticles.filter(a => !a.isHeadline).slice(0, 1),
    news: initialArticles.filter(a => !a.isHeadline).slice(1),
    opinion: [],
  });

  const menuTitles = {
    articles: '기사 관리',
    ceo: 'CEO 리포트',
    slots: '슬롯 관리',
    ads: '광고 관리',
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentMenu={currentMenu} setCurrentMenu={setCurrentMenu} />

      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{menuTitles[currentMenu]}</h1>
        </div>

        {currentMenu === 'articles' && (
          <ArticleManager
            articles={articles}
            setArticles={setArticles}
            opinions={opinions}
            setOpinions={setOpinions}
          />
        )}
        {currentMenu === 'ceo' && (
          <CeoReportManager reports={ceoReports} setReports={setCeoReports} />
        )}
        {currentMenu === 'slots' && (
          <SlotManager articles={articles} slots={slots} setSlots={setSlots} />
        )}
        {currentMenu === 'ads' && (
          <AdManager banners={banners} setBanners={setBanners} />
        )}
      </main>
    </div>
  );
}
