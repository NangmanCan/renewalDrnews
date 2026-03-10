'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { articles as staticArticles } from '@/data/articles';
import { ceoReports as staticCeoReports } from '@/data/ceoReports';
import { opinions as staticOpinions } from '@/data/opinions';
import { initialBanners as staticBanners } from '@/data/banners';
import { uploadImage } from '@/lib/storage';
import TipTapEditor from '@/components/TipTapEditor';

// API 유틸리티 함수
const api = {
  async fetchData(endpoint) {
    try {
      // 캐시 방지를 위해 타임스탬프 + 헤더 추가
      const res = await fetch(`/api/${endpoint}?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return null;
    }
  },
  async create(endpoint, data) {
    const res = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create');
    }
    return await res.json();
  },
  async update(endpoint, id, data) {
    const res = await fetch(`/api/${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update');
    }
    return await res.json();
  },
  async remove(endpoint, id) {
    const res = await fetch(`/api/${endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete');
    }
    return await res.json();
  },
};

// 게재영역 정의
const PLACEMENT_OPTIONS = [
  { id: 'headline', label: '헤드라인 슬라이더', color: 'red', max: 2 },
  { id: 'subheadline', label: '서브헤드라인', color: 'blue', max: 1 },
  { id: 'news', label: '최신뉴스 목록', color: 'gray', max: null },
  { id: 'opinion', label: '오피니언 기고란', color: 'violet', max: 3 },
];

// 이미지 사이즈 가이드
const IMAGE_GUIDES = {
  headline: { width: 800, height: 400, label: '헤드라인 (800x400)' },
  subheadline: { width: 640, height: 360, label: '서브헤드라인 (640x360)' },
  news: { width: 320, height: 200, label: '뉴스목록 (320x200)' },
  opinion: { width: 100, height: 100, label: '프로필 (100x100)' },
  ceo: { width: 100, height: 100, label: '프로필 (100x100)' },
};

const ARTICLE_IMAGE_PLACEHOLDER = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop';

// 사이드바 컴포넌트
function AdminSidebar({ currentMenu, setCurrentMenu }) {
  const router = useRouter();
  const menuItems = [
    { id: 'articles', label: '기사 관리', icon: '📰' },
    { id: 'ceo', label: 'CEO 리포트', icon: '✍️' },
    { id: 'slots', label: '슬롯 관리', icon: '📋' },
    { id: 'ads', label: '광고 관리', icon: '📊' },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="w-64 bg-navy min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <Link href="/" className="text-xl font-bold text-white">
          Dr.News
        </Link>
        <p className="text-gray-400 text-sm mt-1">관리자 페이지</p>
      </div>

      <nav className="space-y-2 flex-1">
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

      <div className="mt-8 pt-8 border-t border-slate-700 space-y-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          사이트로 돌아가기
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors w-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          로그아웃
        </button>
      </div>
    </aside>
  );
}

// 이미지 업로더 컴포넌트
// allowGif: GIF 애니메이션 파일 허용 여부 (헤드라인 기사 이미지 제외)
// folder: Storage 저장 폴더 (articles, opinions, ceo, banners)
// 이미지 리사이징 함수
async function resizeImage(file, maxWidth, maxHeight) {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // 비율 유지하면서 최대 크기에 맞춤
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          const resizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        },
        'image/jpeg',
        0.9
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

function ImageUploader({ currentImage, onImageChange, guide, allowGif = false, folder = 'articles' }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentImage || '');
  const [isGif, setIsGif] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // guide에서 규격 파싱 (예: "1200x300" → {width: 1200, height: 300})
  const parseGuide = (guideStr) => {
    if (!guideStr) return null;
    const str = typeof guideStr === 'object' ? guideStr.imageGuide || guideStr.label : guideStr;
    const match = str?.match(/(\d+)x(\d+)/);
    if (match) {
      return { width: parseInt(match[1]), height: parseInt(match[2]) };
    }
    return null;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (10MB 제한)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    const gif = file.type === 'image/gif';
    setIsGif(gif);
    setUploadError(null);
    setUploading(true);

    // 로컬 미리보기 (빠른 UX)
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      // GIF가 아니면 리사이징
      let fileToUpload = file;
      if (!gif) {
        const size = parseGuide(guide);
        if (size) {
          fileToUpload = await resizeImage(file, size.width, size.height);
        }
      }

      // Supabase Storage에 업로드
      const { url, error } = await uploadImage(fileToUpload, folder);

      if (error) {
        throw error;
      }

      // 성공: Storage URL로 교체
      setPreview(url);
      onImageChange(url);
      
      // 로컬 미리보기 URL 해제
      URL.revokeObjectURL(localPreview);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || '업로드에 실패했습니다.');
      setPreview('');
      URL.revokeObjectURL(localPreview);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlInput = (url) => {
    setUploadError(null);
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

      {/* 에러 메시지 */}
      {uploadError && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {uploadError}
        </div>
      )}

      {/* 미리보기 */}
      {preview && (
        <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
          <Image src={preview} alt="미리보기" fill className="object-cover" unoptimized={isGif || preview.endsWith('.gif')} />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="flex items-center gap-2 text-white">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>업로드 중...</span>
              </div>
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={() => { setPreview(''); onImageChange(''); setUploadError(null); }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* 업로드 옵션 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              업로드 중...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              파일 업로드
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={allowGif ? "image/*,.gif" : "image/jpeg,image/png,image/webp"}
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
        disabled={uploading}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50"
      />
    </div>
  );
}

function PreviewModal({ isOpen, onClose, form }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedDate = new Date().toLocaleDateString('ko-KR');
  const imageSrc = form.image || ARTICLE_IMAGE_PLACEHOLDER;
  const htmlContent = /<[^>]+>/.test(form.content)
    ? form.content
    : form.content.replace(/\n/g, '<br />');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 p-4 md:p-6 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-6 md:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          aria-label="미리보기 닫기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <span className="inline-block px-3 py-1 bg-navy text-white text-sm font-medium rounded mb-4">
              {form.category || '카테고리'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4 leading-tight">
              {form.title || '제목을 입력하세요'}
            </h2>
            <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
              <span className="font-medium">{form.author || '작성자'}</span>
              <span>|</span>
              <time>{formattedDate}</time>
            </div>

            <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-lg bg-gray-100">
              <Image
                src={imageSrc}
                alt={form.title || '기사 미리보기 이미지'}
                fill
                className="object-cover"
                unoptimized={imageSrc.endsWith('.gif')}
              />
            </div>
          </header>

          <div className="bg-gray-50 border-l-4 border-sky-600 p-4 mb-8 rounded-r-lg">
            <p className="text-gray-700 font-medium">{form.summary || '요약을 입력하세요'}</p>
          </div>

          <div className="max-w-none mb-2">
            <div
              className="text-[18px] text-gray-800 leading-[1.9] [&_p]:mb-6"
              dangerouslySetInnerHTML={{ __html: htmlContent || '본문을 입력하세요' }}
            />
          </div>
        </article>
      </div>
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const articleCategories = ['정책', '학술', '병원', '산업', 'AI', '제약·바이오', '해외뉴스'];
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
          allowGif={form.placement !== 'headline'}
          folder={form.placement === 'opinion' ? 'opinions' : 'articles'}
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
          <TipTapEditor
            content={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
            placeholder="기사 본문을 입력하세요..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            미리보기
          </button>
          <button
            type="submit"
            className={`py-3 text-white font-medium rounded-lg transition-colors ${
              article ? 'bg-green-600 hover:bg-green-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {article ? '수정 완료' : '발행하기'}
          </button>
        </div>
      </form>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        form={form}
      />
    </div>
  );
}

// 기사 관리 탭
function ArticleManager({ articles, setArticles, opinions, setOpinions, onRefresh }) {
  const [activeTab, setActiveTab] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [filterPlacement, setFilterPlacement] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [saving, setSaving] = useState(false);

  // 기사와 오피니언 합쳐서 표시
  const allItems = [
    ...articles.map(a => ({ ...a, type: 'article', placement: a.placement || (a.is_headline || a.isHeadline ? 'headline' : 'news') })),
    ...opinions.map(o => ({ ...o, type: 'opinion', placement: 'opinion' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const parseItemDate = (dateValue) => {
    if (!dateValue) return null;
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const isInDateRange = (itemDate) => {
    if (dateFilter === 'all') return true;
    const date = parseItemDate(itemDate);
    if (!date) return false;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateFilter === 'today') {
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);
      return date >= startOfToday && date < endOfToday;
    }

    if (dateFilter === 'week') {
      const day = startOfToday.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
      return date >= startOfWeek;
    }

    if (dateFilter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= startOfMonth;
    }

    return true;
  };

  const filteredItems = allItems.filter((item) => {
    const placementMatched = filterPlacement === 'all' || item.placement === filterPlacement;
    const query = searchQuery.trim().toLowerCase();
    const searchMatched = !query || [item.title, item.content]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(query));
    const dateMatched = isInDateRange(item.date);

    return placementMatched && searchMatched && dateMatched;
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (form.placement === 'opinion') {
        // 오피니언으로 저장
        const opinionData = {
          title: form.title,
          summary: form.summary,
          content: form.content,
          author: form.author.split('/')[0]?.trim() || form.author,
          authorTitle: form.author.split('/')[1]?.trim() || '',
          authorImage: form.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          category: form.category,
        };

        if (editingItem?.type === 'opinion') {
          await api.update('opinions', editingItem.id, opinionData);
        } else {
          await api.create('opinions', opinionData);
        }
      } else {
        // 일반 기사로 저장
        const articleData = {
          title: form.title,
          summary: form.summary,
          content: form.content,
          category: form.category,
          author: form.author,
          image: form.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop',
          placement: form.placement,
          isHeadline: form.placement === 'headline',
        };

        if (editingItem?.type === 'article') {
          await api.update('articles', editingItem.id, articleData);
        } else {
          await api.create('articles', articleData);
        }
      }

      // 먼저 데이터를 새로고침하고, 그 후에 UI 상태 변경
      if (onRefresh) await onRefresh();
      setEditingItem(null);
      setActiveTab('list');
      alert(editingItem ? '수정되었습니다.' : '발행되었습니다.');
    } catch (error) {
      console.error('Error saving:', error);
      alert(`저장 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      if (item.type === 'opinion') {
        await api.remove('opinions', item.id);
      } else {
        await api.remove('articles', item.id);
      }
      if (onRefresh) await onRefresh();
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting:', error);
      alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
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
          {/* 검색 */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              placeholder="제목 또는 내용으로 검색..."
            />
          </div>

          {/* 필터 */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
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

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">날짜:</span>
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1 text-sm rounded-lg ${dateFilter === 'all' ? 'bg-navy text-white' : 'bg-gray-100'}`}
              >
                전체
              </button>
              <button
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1 text-sm rounded-lg ${dateFilter === 'today' ? 'bg-navy text-white' : 'bg-gray-100'}`}
              >
                오늘
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-3 py-1 text-sm rounded-lg ${dateFilter === 'week' ? 'bg-navy text-white' : 'bg-gray-100'}`}
              >
                이번주
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-3 py-1 text-sm rounded-lg ${dateFilter === 'month' ? 'bg-navy text-white' : 'bg-gray-100'}`}
              >
                이번달
              </button>
            </div>
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
          allowGif
          folder="ceo"
        />

        {/* 본문 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
          <TipTapEditor
            content={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
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
function CeoReportManager({ reports, setReports, onRefresh }) {
  const [activeTab, setActiveTab] = useState('list');
  const [editingReport, setEditingReport] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const reportData = {
        title: form.title,
        subtitle: form.subtitle,
        content: form.content,
        category: form.category,
        author: form.author,
        authorTitle: form.authorTitle,
        authorImage: form.authorImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
        weekNumber: form.weekNumber,
      };

      if (editingReport) {
        await api.update('ceo-reports', editingReport.id, reportData);
      } else {
        await api.create('ceo-reports', reportData);
      }

      // 먼저 데이터를 새로고침하고, 그 후에 UI 상태 변경
      if (onRefresh) await onRefresh();
      setEditingReport(null);
      setActiveTab('list');
      alert(editingReport ? '수정되었습니다.' : '발행되었습니다.');
    } catch (error) {
      console.error('Error saving CEO report:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.remove('ceo-reports', id);
      if (onRefresh) await onRefresh();
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting CEO report:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
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
function SlotManager({ articles, opinions, slots, setSlots, onRefresh }) {
  const [saving, setSaving] = useState(false);

  // 기사 슬롯 옵션 (오피니언 제외)
  const articlePlacementOptions = PLACEMENT_OPTIONS.filter(opt => opt.id !== 'opinion');
  const opinionOption = PLACEMENT_OPTIONS.find(opt => opt.id === 'opinion');

  const getSlotItems = (placement) => {
    return slots[placement] || [];
  };

  // 슬롯 저장
  const saveSlots = async () => {
    setSaving(true);
    try {
      const updates = [];

      // --- 기사 슬롯 저장 (headline, subheadline, news) ---
      const articleSlotIds = new Set(
        ['headline', 'subheadline', 'news']
          .flatMap(p => (slots[p] || []).map(a => a.id))
      );

      // 1. 기사 슬롯에 배치된 기사들: placement가 변경된 경우만 업데이트
      for (const placement of ['headline', 'subheadline', 'news']) {
        for (const article of (slots[placement] || [])) {
          if (article.placement !== placement) {
            updates.push(
              api.update('articles', article.id, {
                ...article,
                placement,
                isHeadline: placement === 'headline',
              })
            );
          }
        }
      }

      // 2. 기사 슬롯에서 제거된 기사들은 미배치('none')로 변경
      for (const article of articles) {
        if (!articleSlotIds.has(article.id) && article.placement !== 'none') {
          updates.push(
            api.update('articles', article.id, {
              ...article,
              placement: 'none',
              isHeadline: false,
            })
          );
        }
      }

      // --- 오피니언 슬롯 저장 (is_featured 업데이트) ---
      const featuredOpinionIds = new Set((slots.opinion || []).map(o => o.id));
      for (const opinion of opinions) {
        const shouldBeFeatured = featuredOpinionIds.has(opinion.id);
        const currentlyFeatured = opinion.isFeatured !== false;
        if (shouldBeFeatured !== currentlyFeatured) {
          updates.push(
            api.update('opinions', opinion.id, {
              ...opinion,
              isFeatured: shouldBeFeatured,
            })
          );
        }
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }
      if (onRefresh) await onRefresh();
      alert('슬롯 배치가 저장되었습니다.');
    } catch (error) {
      console.error('Error saving slots:', error);
      alert(`저장 중 오류가 발생했습니다: ${error.message}\n\n데이터가 Supabase에 실제로 존재하는지 확인하세요.\n(정적 데이터는 저장할 수 없습니다)`);
    } finally {
      setSaving(false);
    }
  };

  // 기사 슬롯에 배치되지 않은 기사들
  const availableArticles = articles.filter(a => {
    const allArticleSlotIds = ['headline', 'subheadline', 'news']
      .flatMap(p => (slots[p] || []).map(a => a.id));
    return !allArticleSlotIds.includes(a.id);
  });

  // 오피니언 슬롯에 배치되지 않은 오피니언들
  const availableOpinions = opinions.filter(o => {
    const opinionSlotIds = (slots.opinion || []).map(o => o.id);
    return !opinionSlotIds.includes(o.id);
  });

  const addToSlot = (placement, item) => {
    const opt = PLACEMENT_OPTIONS.find(o => o.id === placement);
    const currentSlot = slots[placement] || [];

    if (opt.max && currentSlot.length >= opt.max) {
      alert(`${opt.label}은 최대 ${opt.max}개까지 가능합니다.`);
      return;
    }

    setSlots({
      ...slots,
      [placement]: [...currentSlot, item],
    });
  };

  const removeFromSlot = (placement, itemId) => {
    setSlots({
      ...slots,
      [placement]: (slots[placement] || []).filter(a => a.id !== itemId),
    });
  };

  const SlotSection = ({ placement, label, color, max }) => {
    const slotItems = getSlotItems(placement);
    const borderColors = {
      red: 'border-red-300 bg-red-50',
      blue: 'border-blue-300 bg-blue-50',
      violet: 'border-violet-300 bg-violet-50',
      gray: 'border-gray-300 bg-gray-50',
    };
    const isOpinion = placement === 'opinion';

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700">{label}</h3>
          <span className="text-sm text-gray-400">
            {slotItems.length}{max ? ` / ${max}` : ''}개
          </span>
        </div>
        <div className={`p-4 border-2 border-dashed rounded-lg min-h-[80px] ${borderColors[color]}`}>
          {slotItems.length > 0 ? (
            <div className="space-y-2">
              {slotItems.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-gray-400">{idx + 1}</span>
                    <span className="text-sm font-medium truncate">{item.title}</span>
                    {isOpinion && item.author && (
                      <span className="text-xs text-violet-500 flex-shrink-0">{item.author}</span>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromSlot(placement, item.id)}
                    className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center text-sm py-4">
              {isOpinion ? '오피니언을 배치하세요' : '기사를 배치하세요'}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 좌측: 기사 / 오피니언 선택 */}
      <div className="space-y-6">
        {/* 기사 선택 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">기사 선택</h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
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
                    {articlePlacementOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => addToSlot(opt.id, article)}
                        className="text-[10px] px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded whitespace-nowrap"
                      >
                        {opt.label.replace(' 슬라이더', '').replace(' 목록', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {availableArticles.length === 0 && (
              <p className="text-center text-gray-400 py-4">모든 기사가 배치되었습니다</p>
            )}
          </div>
        </div>

        {/* 오피니언 선택 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">오피니언 선택</h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {availableOpinions.map((opinion) => (
              <div key={opinion.id} className="p-3 border border-violet-200 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-600 rounded">
                        {opinion.category}
                      </span>
                      <span className="text-xs text-gray-400">{opinion.author}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{opinion.title}</p>
                  </div>
                  <button
                    onClick={() => addToSlot('opinion', opinion)}
                    className="text-[10px] px-2 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded whitespace-nowrap"
                  >
                    오피니언
                  </button>
                </div>
              </div>
            ))}
            {availableOpinions.length === 0 && (
              <p className="text-center text-gray-400 py-4">모든 오피니언이 배치되었습니다</p>
            )}
          </div>
        </div>
      </div>

      {/* 우측: 슬롯 배치 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">슬롯 배치</h2>
          <button
            onClick={saveSlots}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                저장 중...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                저장
              </>
            )}
          </button>
        </div>
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
      imageGuide: '1200x300',
      description: 'PC 사이드바 및 모바일 뉴스 사이에 노출 (4:1 비율)',
    },
    gnb: {
      label: 'GNB 상단배너',
      imageGuide: '234x60',
      description: '상단 로고 옆에 표시되는 소형 배너',
    },
  };

  const info = typeInfo[adType] || typeInfo.sidebar;

  const [form, setForm] = useState({
    title: ad?.title || '',
    description: ad?.description || '',
    image: ad?.image || '',
    link: ad?.link || '',
    positions: ad?.positions || {},
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
            <label className="block text-sm font-medium text-gray-700">광고 이미지</label>
            <span className="text-xs text-gray-400">권장: {info.imageGuide}</span>
          </div>
          <ImageUploader
            currentImage={form.image}
            onImageChange={(url) => setForm({ ...form, image: url })}
            guide={info.imageGuide}
            allowGif={adType !== 'headline'}
            folder="banners"
          />
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

        {/* 사이드바 광고 안내 */}
        {adType === 'sidebar' && (
          <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            등록된 사이드바 광고는 PC 사이드바 및 모바일 뉴스 목록에 자동 롤링 노출됩니다.
          </p>
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
function AdManager({ banners, setBanners, onRefresh }) {
  const [selectedType, setSelectedType] = useState('headline');
  const [activeTab, setActiveTab] = useState('list');
  const [editingAd, setEditingAd] = useState(null);
  const [saving, setSaving] = useState(false);

  const typeLabels = {
    headline: '헤드라인 광고',
    sidebar: '사이드바 광고',
    gnb: 'GNB 상단배너',
  };

  const filteredBanners = banners
    .filter((b) => b.type === selectedType)
    .sort((a, b) => a.order - b.order);

  const [toggling, setToggling] = useState(null);

  const toggleActive = async (id) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;

    setToggling(id);
    try {
      await api.update('banners', id, { ...banner, isActive: !banner.isActive });
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Error toggling active:', error);
      alert(`광고 상태 변경 실패: ${error.message}\n\nCloudflare에 SUPABASE_SERVICE_ROLE_KEY가 설정되어 있는지 확인하세요.`);
    } finally {
      setToggling(null);
    }
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const maxOrder = filteredBanners.reduce((max, b) => Math.max(max, b.order || 0), 0);

      const bannerData = {
        title: form.title,
        description: form.description,
        image: form.image,
        link: form.link || '#',
        type: selectedType,
        isActive: editingAd?.isActive ?? true,
        order: editingAd?.order ?? maxOrder + 1,
        positions: selectedType === 'sidebar' ? form.positions : undefined,
      };

      if (editingAd) {
        await api.update('banners', editingAd.id, bannerData);
      } else {
        await api.create('banners', bannerData);
      }

      // 먼저 데이터를 새로고침하고, 그 후에 UI 상태 변경
      if (onRefresh) await onRefresh();
      setEditingAd(null);
      setActiveTab('list');
      alert(editingAd ? '수정되었습니다.' : '등록되었습니다.');
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.remove('banners', id);
      if (onRefresh) await onRefresh();
      alert('삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
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
                      disabled={toggling === banner.id}
                      className={`px-4 py-2 rounded-full font-medium min-w-[60px] ${
                        banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-300'
                      } ${toggling === banner.id ? 'opacity-50' : ''}`}
                    >
                      {toggling === banner.id ? '...' : (banner.isActive ? 'ON' : 'OFF')}
                    </button>
                  </div>
                </div>

                {/* 사이드바 광고 노출 안내 */}
                {selectedType === 'sidebar' && banner.isActive && (
                  <p className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    PC 사이드바 + 모바일 뉴스 목록에 자동 롤링 노출
                  </p>
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
  const [articles, setArticles] = useState(staticArticles);
  const [ceoReports, setCeoReports] = useState(staticCeoReports);
  const [opinions, setOpinions] = useState(staticOpinions);
  const [banners, setBanners] = useState(staticBanners);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState({
    headline: staticArticles.filter(a => a.isHeadline),
    subheadline: staticArticles.filter(a => !a.isHeadline).slice(0, 1),
    news: staticArticles.filter(a => !a.isHeadline).slice(1),
    opinion: [],
  });

  // 데이터 로드
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [articlesData, opinionsData, ceoData, bannersData] = await Promise.all([
        api.fetchData('articles'),
        api.fetchData('opinions'),
        api.fetchData('ceo-reports'),
        api.fetchData('banners'),
      ]);

      if (articlesData) setArticles(articlesData);
      if (opinionsData) setOpinions(opinionsData);
      if (ceoData) setCeoReports(ceoData);
      if (bannersData) setBanners(bannersData);

      // 슬롯 데이터 업데이트
      // - 기사 슬롯: articles의 placement 필드 기준
      // - 오피니언 슬롯: opinions의 isFeatured 필드 기준
      // - placement가 'none'이거나 null인 기사 / isFeatured=false인 오피니언 → 미배치 풀
      const newSlots = {
        headline: (articlesData || []).filter(a => a.placement === 'headline'),
        subheadline: (articlesData || []).filter(a => a.placement === 'subheadline'),
        news: (articlesData || []).filter(a => a.placement === 'news' || (!a.placement && !a.is_headline && !a.isHeadline)),
        opinion: (opinionsData || []).filter(o => o.isFeatured !== false),
      };
      setSlots(newSlots);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{menuTitles[currentMenu]}</h1>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                로딩 중...
              </>
            ) : (
              '새로고침'
            )}
          </button>
        </div>

        {currentMenu === 'articles' && (
          <ArticleManager
            articles={articles}
            setArticles={setArticles}
            opinions={opinions}
            setOpinions={setOpinions}
            onRefresh={loadData}
          />
        )}
        {currentMenu === 'ceo' && (
          <CeoReportManager reports={ceoReports} setReports={setCeoReports} onRefresh={loadData} />
        )}
        {currentMenu === 'slots' && (
          <SlotManager articles={articles} opinions={opinions} slots={slots} setSlots={setSlots} onRefresh={loadData} />
        )}
        {currentMenu === 'ads' && (
          <AdManager banners={banners} setBanners={setBanners} onRefresh={loadData} />
        )}
      </main>
    </div>
  );
}
