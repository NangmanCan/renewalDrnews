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
import Pica from 'pica';
import TipTapEditor from '@/components/TipTapEditor';
import NewsSourceManager from '@/components/admin/NewsSourceManager';
import DoctorPickManager from '@/components/admin/DoctorPickManager';
import SlotManagerUI from '@/components/admin/SlotManager';
import ImageCropModal from '@/components/admin/ImageCropModal';
import { buildWatermarkCanvas, drawWatermark } from '@/lib/watermark';
import AdSlotManagerUI from '@/components/admin/AdSlotManager';
import AdCreationManagerUI from '@/components/admin/AdCreationManager';

// pica 인스턴스(WebWorker 풀)를 매번 새로 만들면 워커가 누적되므로 모듈 레벨에서 1개만 유지
const picaInstance = typeof window !== 'undefined' ? Pica() : null;

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
  { id: 'focus', label: '닥터포커스', color: 'sky', max: null },
  { id: 'category_card', label: '카테고리 카드(PC 우측)', color: 'brand', max: 4 },
  { id: 'opinion', label: '오피니언 기고란', color: 'violet', max: 3 },
  { id: 'doctor_interview', label: '닥터인터뷰', color: 'emerald', max: null },
];

// 이미지 사이즈 가이드 (retina 대응: 표시 폭 × 2 기준)
const IMAGE_GUIDES = {
  headline: { width: 1600, height: 800, label: '헤드라인 (1600x800, retina 대응)' },
  subheadline: { width: 1280, height: 720, label: '서브헤드라인 (1280x720, retina 대응)' },
  news: { width: 640, height: 400, label: '뉴스목록 (640x400, retina 대응)' },
  opinion: { width: 200, height: 200, label: '기고자 프로필 (200x200, retina 대응)' },
  doctor_interview: { width: 200, height: 200, label: '인터뷰이 프로필 (200x200, retina 대응)' },
};

// 본문 HTML에서 첫 번째 이미지 src 추출 (대표 이미지 공란 시 대체용)
function firstImageFromContent(html) {
  if (!html) return null;
  const m = html.match(/<img[^>]*src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

// 사이드바 컴포넌트
function AdminSidebar({ currentMenu, setCurrentMenu }) {
  const router = useRouter();
  const menuItems = [
    { id: 'articles', label: '기사 관리', icon: '📰' },
    { id: 'doctor-picks', label: "DOCTOR'S PICK", icon: '⭐' },
    { id: 'ceo', label: 'CEO 리포트', icon: '✍️' },
    { id: 'slots', label: '슬롯 관리', icon: '📋' },
    { id: 'ads', label: '광고 관리', icon: '📢' },
    { id: 'stats', label: '통계', icon: '📊' },
    { id: 'news-sources', label: '기사 작성 도우미', icon: '🔍' },
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
// 이미지 리사이징 함수 (pica Lanczos3 사용)
async function resizeImage(file, maxWidth, maxHeight) {
  // 포맷 판별 (MIME 우선, 없으면 확장자 fallback)
  const ext = file.name.split('.').pop()?.toLowerCase();
  const isPng = file.type === 'image/png' || ext === 'png';
  const isGif = file.type === 'image/gif' || ext === 'gif';
  const isWebP = file.type === 'image/webp' || ext === 'webp';

  // GIF는 리사이징하면 움짤이 깨지므로 원본 반환
  if (isGif) return file;

  // PNG, WebP는 원본 포맷 유지, 나머지는 JPEG
  const outputType = isPng ? 'image/png' : isWebP ? 'image/webp' : 'image/jpeg';
  const outputQuality = isPng ? undefined : 0.92; // PNG는 무손실, JPEG/WebP는 92%

  // 원본 이미지 로드
  const objectUrl = URL.createObjectURL(file);
  let img;
  try {
    img = await new Promise((resolve, reject) => {
      const im = document.createElement('img');
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
      im.src = objectUrl;
    });
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }

  // 비율 유지하면서 최대 크기에 맞춤
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  width = Math.round(width);
  height = Math.round(height);

  // 축소가 필요 없으면 원본 그대로 반환 (재인코딩 손실 방지)
  if (width >= img.naturalWidth && height >= img.naturalHeight) {
    URL.revokeObjectURL(objectUrl);
    return file;
  }

  // pica Lanczos3로 리사이즈
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  try {
    await picaInstance.resize(img, canvas, {
      quality: 3,       // 3 = Lanczos3 (최고 품질)
      alpha: isPng,     // PNG일 때만 알파 채널 보존
      unsharpAmount: 80, // 다운스케일 후 약한 샤프닝으로 디테일 보강
      unsharpRadius: 0.6,
      unsharpThreshold: 2,
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  const blob = await picaInstance.toBlob(canvas, outputType, outputQuality);
  if (!blob) throw new Error('이미지 변환에 실패했습니다.');

  const extension = isPng ? '.png' : isWebP ? '.webp' : '.jpg';
  const fileName = file.name.replace(/\.[^.]+$/, '') + extension;
  return new File([blob], fileName, {
    type: outputType,
    lastModified: Date.now(),
  });
}

// 업로드 직전 파일에 Dr.News 워터마크 합성 (우측 하단).
// GIF는 애니메이션이 깨지므로 호출부에서 제외. 재인코딩은 원본 포맷 유지(png/webp/jpeg).
async function applyWatermarkToFile(file) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const isPng = file.type === 'image/png' || ext === 'png';
  const isWebP = file.type === 'image/webp' || ext === 'webp';
  const outputType = isPng ? 'image/png' : isWebP ? 'image/webp' : 'image/jpeg';
  const outputQuality = isPng ? undefined : 0.92;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const im = document.createElement('img');
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
      im.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);

    const wmCanvas = await buildWatermarkCanvas();
    drawWatermark(canvas, wmCanvas);

    const blob = await picaInstance.toBlob(canvas, outputType, outputQuality);
    if (!blob) throw new Error('이미지 변환에 실패했습니다.');
    const extension = isPng ? '.png' : isWebP ? '.webp' : '.jpg';
    const fileName = file.name.replace(/\.[^.]+$/, '') + extension;
    return new File([blob], fileName, { type: outputType, lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function ImageUploader({ currentImage, onImageChange, guide, allowGif = false, folder = 'articles', label = '대표 이미지', allowWatermark = true, allowBasePx = true }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentImage || '');
  const [isGif, setIsGif] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [cropTarget, setCropTarget] = useState(null); // { file, size }
  const [watermark, setWatermark] = useState(false);
  const [basePx, setBasePx] = useState(null); // 출력 폭 프리셋. null=권장(가이드 크기)

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

  // 실제 업로드 (crop 후 호출되거나, GIF/가이드 없을 때 직접 호출)
  const doUpload = async (fileToUpload) => {
    setUploadError(null);
    setUploading(true);
    // 워터마크 옵션 ON이면 업로드 직전 합성 (GIF는 미지원 → 원본 유지)
    let finalFile = fileToUpload;
    if (allowWatermark && watermark) {
      if (fileToUpload.type === 'image/gif') {
        setUploadError('GIF는 워터마크를 지원하지 않습니다. 원본 그대로 업로드됩니다.');
      } else {
        try {
          finalFile = await applyWatermarkToFile(fileToUpload);
        } catch (err) {
          console.error('Watermark failed:', err);
          setUploadError(err.message || '워터마크 합성에 실패했습니다.');
          setUploading(false);
          return;
        }
      }
    }
    const localPreview = URL.createObjectURL(finalFile);
    setPreview(localPreview);
    try {
      const { url, error } = await uploadImage(finalFile, folder);
      if (error) throw error;
      setPreview(url);
      onImageChange(url);
      URL.revokeObjectURL(localPreview);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || '업로드에 실패했습니다.');
      setPreview(currentImage || '');
      URL.revokeObjectURL(localPreview);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (10MB 제한)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('파일 크기는 10MB 이하여야 합니다.');
      e.target.value = '';
      return;
    }

    const gif = file.type === 'image/gif';
    setIsGif(gif);
    setUploadError(null);

    const size = parseGuide(guide);

    // GIF이거나 가이드가 없으면 크롭 모달 없이 바로 업로드 (리사이즈만)
    if (gif || !size) {
      let fileToUpload = file;
      if (!gif && size) {
        try {
          // 프리셋 px 선택 시 가이드 비율 유지 + 폭만 프리셋으로, 아니면 가이드 크기
          const w = basePx || size.width;
          const h = Math.round((size.height * w) / size.width);
          fileToUpload = await resizeImage(file, w, h);
        } catch (err) {
          setUploadError(err.message || '리사이즈 실패');
          return;
        }
      }
      await doUpload(fileToUpload);
      e.target.value = '';
      return;
    }

    // 가이드 있고 GIF 아니면 크롭 모달 띄움
    setCropTarget({ file, size });
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile) => {
    setCropTarget(null);
    await doUpload(croppedFile);
  };

  const handleCropCancel = () => {
    setCropTarget(null);
  };

  const handleUrlInput = (url) => {
    setUploadError(null);
    setPreview(url);
    onImageChange(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
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

      {/* 미리보기 — 권장 사이즈 비율 그대로, 실제 폭(px)까지 (화면 폭에 맞춰 축소) */}
      {preview && (() => {
        const ps = parseGuide(guide);
        const previewStyle = ps
          ? { aspectRatio: `${ps.width} / ${ps.height}`, maxWidth: `${ps.width}px`, width: '100%' }
          : { aspectRatio: '16 / 9', maxWidth: '640px', width: '100%' };
        return (
        <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={previewStyle}>
          <Image src={preview} alt="미리보기" fill className="object-contain" unoptimized={isGif || preview.endsWith('.gif')} />
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
        );
      })()}

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

      {/* 기준크기 프리셋 (가이드 있을 때만 · 출력 폭 결정) */}
      {(() => {
        if (!allowBasePx) return null; // 프로필 등 크기 고정 용도
        const gsize = parseGuide(guide);
        if (!gsize) return null;
        const presets = [
          { label: '권장 (가이드 크기)', value: null },
          { label: '1280px', value: 1280 },
          { label: '960px', value: 960 },
          { label: '600px', value: 600 },
        ];
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">기준크기</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => {
                const active = basePx === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBasePx(preset.value)}
                    disabled={uploading}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-50 ${
                      active
                        ? 'bg-sky-600 border-sky-600 text-white font-semibold'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {basePx
                ? `출력 폭: ${basePx}px (가이드 비율 유지 · 원본이 작으면 그대로)`
                : `출력: 가이드 크기 ${gsize.width} × ${gsize.height}`}
            </p>
          </div>
        );
      })()}

      {/* 워터마크 옵션 (파일 업로드에만 적용, URL 입력에는 미적용) */}
      {allowWatermark && (
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={watermark}
            onChange={(e) => setWatermark(e.target.checked)}
            disabled={uploading}
            className="accent-sky-600 w-4 h-4"
          />
          워터마크 (우측 하단 Dr.News 로고 합성)
        </label>
      )}

      {/* URL 입력 */}
      <input
        type="text"
        placeholder="또는 이미지 URL 입력"
        value={preview}
        onChange={(e) => handleUrlInput(e.target.value)}
        disabled={uploading}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50"
      />

      {/* 크롭 모달 */}
      {cropTarget && (
        <ImageCropModal
          file={cropTarget.file}
          guide={cropTarget.size}
          outputWidth={basePx}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
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
  const imageSrc = form.image || firstImageFromContent(form.content);
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

            {imageSrc && (
              <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-lg bg-gray-100">
                <Image
                  src={imageSrc}
                  alt={form.title || '기사 미리보기 이미지'}
                  fill
                  className="object-cover"
                  unoptimized={imageSrc.endsWith('.gif')}
                />
              </div>
            )}
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
function ArticleEditor({ article, onSave, onCancel, placement, saving = false }) {
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
  const [autoSaveTime, setAutoSaveTime] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showRestoreButton, setShowRestoreButton] = useState(false);

  const autoSaveKey = `article_autosave_${article?.id || 'new'}`;

  // 임시저장 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem(autoSaveKey);
    if (saved && !article) {
      setShowRestoreButton(true);
    }
  }, [autoSaveKey, article]);

  // 폼 변경 감지
  useEffect(() => {
    if (form.title || form.content) {
      setHasUnsavedChanges(true);
    }
  }, [form]);

  // 자동저장 (30초 간격)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      localStorage.setItem(autoSaveKey, JSON.stringify(form));
      setAutoSaveTime(new Date().toLocaleTimeString('ko-KR'));
      setHasUnsavedChanges(false);
    }, 30000);

    return () => clearTimeout(timer);
  }, [form, hasUnsavedChanges, autoSaveKey]);

  // 페이지 이탈 경고
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 임시저장 복원
  const handleRestore = () => {
    const saved = localStorage.getItem(autoSaveKey);
    if (saved) {
      const restoredForm = JSON.parse(saved);
      setForm(restoredForm);
      setShowRestoreButton(false);
      alert('임시저장된 내용을 복원했습니다.');
    }
  };

  // 수동 임시저장
  const handleManualSave = () => {
    localStorage.setItem(autoSaveKey, JSON.stringify(form));
    setAutoSaveTime(new Date().toLocaleTimeString('ko-KR'));
    setHasUnsavedChanges(false);
    alert('임시저장되었습니다.');
  };

  const articleCategories = ['정책', '학술', '병원', '산업', 'AI', '제약·바이오', '해외뉴스'];
  const opinionCategories = ['칼럼', '기고'];
  const categories = form.placement === 'opinion' ? opinionCategories : articleCategories;

  // 오피니언·닥터인터뷰는 기고자/인터뷰이 프로필(200x200 고정) 형식을 공유
  const isProfilePlacement = form.placement === 'opinion' || form.placement === 'doctor_interview';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('제목과 본문을 입력해주세요.');
      return;
    }
    // 발행 완료 시 임시저장 데이터 삭제
    localStorage.removeItem(autoSaveKey);
    setHasUnsavedChanges(false);
    onSave(form);
  };

  const currentGuide = IMAGE_GUIDES[form.placement] || IMAGE_GUIDES.news;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {article ? '기사 수정' : '기사 작성'}
          </h2>
          {autoSaveTime && (
            <p className="text-xs text-gray-500 mt-1">
              마지막 저장: {autoSaveTime}
            </p>
          )}
          {hasUnsavedChanges && (
            <p className="text-xs text-orange-500 mt-1">
              저장되지 않은 변경사항이 있습니다
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showRestoreButton && (
            <button
              onClick={handleRestore}
              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg"
            >
              임시저장 복원
            </button>
          )}
          <button
            onClick={handleManualSave}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            임시저장
          </button>
          {onCancel && (
            <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
              취소
            </button>
          )}
        </div>
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
                    ? (opt.color === 'red' ? '#ef4444' : opt.color === 'blue' ? '#3b82f6' : opt.color === 'violet' ? '#8b5cf6' : opt.color === 'emerald' ? '#059669' : '#6b7280')
                    : (opt.color === 'emerald' ? '#ecfdf5' : undefined),
                  color: form.placement === opt.id
                    ? 'white'
                    : (opt.color === 'emerald' ? '#059669' : undefined)
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

        {/* 카테고리 & 기자명 — 닥터인터뷰는 카테고리 select 숨김 */}
        <div className={`grid ${form.placement === 'doctor_interview' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          {form.placement !== 'doctor_interview' && (
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
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isProfilePlacement ? '기고자명 / 직함' : '기자명'}
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder={isProfilePlacement ? '홍길동 / 의료경영학 박사' : '김기자'}
            />
          </div>
        </div>

        {/* 이미지 업로드 — 오피니언·닥터인터뷰는 프로필(200x200 고정, 워터마크·크기 프리셋 없음) */}
        <ImageUploader
          currentImage={form.image}
          onImageChange={(url) => setForm({ ...form, image: url })}
          guide={currentGuide}
          allowGif={form.placement !== 'headline'}
          folder={isProfilePlacement ? 'opinions' : 'articles'}
          label={isProfilePlacement ? '기고자 프로필' : '대표 이미지'}
          allowBasePx={!isProfilePlacement}
          allowWatermark={!isProfilePlacement}
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
            enableInlinePhoto
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
            disabled={saving}
            className={`py-3 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              article ? 'bg-green-600 hover:bg-green-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {saving ? '저장 중…' : article ? '수정 완료' : '발행하기'}
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
function ArticleManager({ articles, setArticles, opinions, setOpinions, doctorInterviews, setDoctorInterviews, onRefresh }) {
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
    ...(doctorInterviews || []).map(d => ({ ...d, type: 'doctor_interview', placement: 'doctor_interview' })),
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
      if (form.placement === 'doctor_interview') {
        // 닥터인터뷰로 저장 (author 분리 로직은 오피니언과 동일, 카테고리 없음)
        const interviewData = {
          title: form.title,
          summary: form.summary,
          content: form.content,
          author: form.author.split('/')[0]?.trim() || form.author,
          authorTitle: form.author.split('/')[1]?.trim() || '',
          authorImage: form.image || '', // 프로필 공란 시 본문 사진을 쓰지 않음 (이니셜 아바타 표시)
        };

        if (editingItem?.type === 'doctor_interview') {
          await api.update('doctor-interviews', editingItem.id, interviewData);
        } else {
          await api.create('doctor-interviews', interviewData);
        }
      } else if (form.placement === 'opinion') {
        // 오피니언으로 저장
        const opinionData = {
          title: form.title,
          summary: form.summary,
          content: form.content,
          author: form.author.split('/')[0]?.trim() || form.author,
          authorTitle: form.author.split('/')[1]?.trim() || '',
          authorImage: form.image || '', // 프로필 공란 시 본문 사진을 쓰지 않음 (이니셜 아바타 표시)
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
          // 대표 이미지 공란이면 본문 첫 이미지 사용, 둘 다 없으면 이미지 없이 저장
          image: form.image || firstImageFromContent(form.content) || null,
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
      if (item.type === 'doctor_interview') {
        await api.remove('doctor-interviews', item.id);
      } else if (item.type === 'opinion') {
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
      emerald: 'bg-emerald-100 text-emerald-600',
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
          saving={saving}
          onCancel={() => { setEditingItem(null); setActiveTab('list'); }}
        />
      )}
    </div>
  );
}

// CEO 리포트 에디터
function CeoReportEditor({ report, onSave, onCancel, saving = false }) {
  const [form, setForm] = useState({
    title: report?.title || '',
    subtitle: report?.subtitle || '',
    content: report?.content || '',
    author: report?.author || '김의료',
    authorTitle: report?.authorTitle || 'Dr.News 대표',
    authorImage: report?.authorImage || '',
    category: report?.category || '경영철학',
    weekNumber: report?.weekNumber || Math.ceil((new Date().getDate()) / 7),
    backgroundImage: report?.backgroundImage || null,
  });
  const [autoSaveTime, setAutoSaveTime] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showRestoreButton, setShowRestoreButton] = useState(false);

  const autoSaveKey = `ceo_report_autosave_${report?.id || 'new'}`;

  const categories = ['경영철학', '리더십', '의료혁신', '미래전망'];

  // 엽서 프레임 프리셋 (public/frames/*)
  const framePresets = [
    { label: '한지', value: '/frames/ceo-hanji.jpg' },
    { label: '수묵', value: '/frames/ceo-sumuk.jpg' },
    { label: '봄', value: '/frames/ceo-spring.jpg' },
    { label: '물빛', value: '/frames/ceo-water.jpg' },
  ];
  const isPreset = framePresets.some((f) => f.value === form.backgroundImage);

  // 임시저장 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem(autoSaveKey);
    if (saved && !report) {
      setShowRestoreButton(true);
    }
  }, [autoSaveKey, report]);

  // 폼 변경 감지
  useEffect(() => {
    if (form.title || form.content) {
      setHasUnsavedChanges(true);
    }
  }, [form]);

  // 자동저장 (30초 간격)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      localStorage.setItem(autoSaveKey, JSON.stringify(form));
      setAutoSaveTime(new Date().toLocaleTimeString('ko-KR'));
      setHasUnsavedChanges(false);
    }, 30000);

    return () => clearTimeout(timer);
  }, [form, hasUnsavedChanges, autoSaveKey]);

  // 페이지 이탈 경고
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 임시저장 복원
  const handleRestore = () => {
    const saved = localStorage.getItem(autoSaveKey);
    if (saved) {
      const restoredForm = JSON.parse(saved);
      setForm(restoredForm);
      setShowRestoreButton(false);
      alert('임시저장된 내용을 복원했습니다.');
    }
  };

  // 수동 임시저장
  const handleManualSave = () => {
    localStorage.setItem(autoSaveKey, JSON.stringify(form));
    setAutoSaveTime(new Date().toLocaleTimeString('ko-KR'));
    setHasUnsavedChanges(false);
    alert('임시저장되었습니다.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert('제목과 본문을 입력해주세요.');
      return;
    }
    // 발행 완료 시 임시저장 데이터 삭제
    localStorage.removeItem(autoSaveKey);
    setHasUnsavedChanges(false);
    onSave(form);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {report ? 'CEO 리포트 수정' : 'CEO 리포트 작성'}
          </h2>
          {autoSaveTime && (
            <p className="text-xs text-gray-500 mt-1">
              마지막 저장: {autoSaveTime}
            </p>
          )}
          {hasUnsavedChanges && (
            <p className="text-xs text-orange-500 mt-1">
              저장되지 않은 변경사항이 있습니다
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showRestoreButton && (
            <button
              onClick={handleRestore}
              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg"
            >
              임시저장 복원
            </button>
          )}
          <button
            onClick={handleManualSave}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            임시저장
          </button>
          {onCancel && (
            <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
              취소
            </button>
          )}
        </div>
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

        {/* 본문 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
          <TipTapEditor
            content={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
            placeholder="철학적인 에세이 내용을 작성하세요..."
          />
        </div>

        {/* 엽서 배경 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">엽서 배경</label>
          <p className="text-xs text-gray-500 mb-2">상세 페이지 본문에 엽서 프레임 배경을 입힙니다.</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {/* 없음(기본) */}
            <button
              type="button"
              onClick={() => setForm({ ...form, backgroundImage: null })}
              className={`flex-shrink-0 w-20 h-24 rounded-lg border flex flex-col items-center justify-center text-xs font-medium transition-all ${
                !form.backgroundImage
                  ? 'ring-2 ring-sky-500 border-sky-500 text-sky-700 bg-sky-50'
                  : 'border-gray-300 text-gray-500 bg-gray-50 hover:border-gray-400'
              }`}
            >
              없음
              <span className="text-[10px] text-gray-400">(기본)</span>
            </button>

            {/* 프리셋 4종 */}
            {framePresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setForm({ ...form, backgroundImage: preset.value })}
                className={`flex-shrink-0 w-20 rounded-lg overflow-hidden border transition-all ${
                  form.backgroundImage === preset.value
                    ? 'ring-2 ring-sky-500 border-sky-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preset.value} alt={preset.label} className="w-full h-24 object-cover" />
                <span className="block py-1 text-xs font-medium text-gray-700 bg-white">{preset.label}</span>
              </button>
            ))}
          </div>

          {/* 직접 업로드 */}
          <div className="mt-3">
            <ImageUploader
              currentImage={isPreset ? '' : (form.backgroundImage || '')}
              onImageChange={(url) => setForm({ ...form, backgroundImage: url || null })}
              folder="ceo"
              label="배경 직접 업로드"
              allowWatermark={false}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '저장 중…' : report ? '수정 완료' : '발행하기'}
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
        authorImage: form.authorImage || '',
        weekNumber: form.weekNumber,
        backgroundImage: form.backgroundImage ?? null,
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
                      <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-600 rounded">
                        {report.category}
                      </span>
                      <span className="text-xs text-gray-400">{report.date}</span>
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
          saving={saving}
          onCancel={() => { setEditingReport(null); setActiveTab('list'); }}
        />
      )}
    </div>
  );
}

// 슬롯 관리 탭
function SlotManager({ articles, opinions, slots, setSlots, onRefresh }) {
  const [saving, setSaving] = useState(false);

  // 슬롯 저장
  const saveSlots = async () => {
    setSaving(true);
    try {
      const updates = [];

      // --- 기사 슬롯 저장 (headline, subheadline, news, focus, category_card) ---
      const articleSlotIds = new Set(
        ['headline', 'subheadline', 'news', 'focus', 'category_card']
          .flatMap(p => (slots[p] || []).map(a => a.id))
      );

      // 1. 기사 슬롯에 배치된 기사들: placement가 변경된 경우만 업데이트
      for (const placement of ['headline', 'subheadline', 'news', 'focus', 'category_card']) {
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

  return (
    <SlotManagerUI
      articles={articles}
      opinions={opinions}
      slots={slots}
      setSlots={setSlots}
      onSave={saveSlots}
      saving={saving}
    />
  );
}


// 광고 에디터 컴포넌트
function AdEditor({ ad, adType, onSave, onCancel, onFormChange }) {
  // 표시 폭 × 2 (retina 대응). pica Lanczos3로 다운스케일되어 업로드됨.
  const typeInfo = {
    headline: {
      label: '헤드라인 슬라이더 광고',
      imageGuide: '1600x800',
      description: '메인 상단 슬라이더에 노출되는 대형 광고 (retina 대응)',
    },
    sidebar: {
      label: '사이드바 광고',
      imageGuide: '576x192',
      description: 'PC 사이드바·모바일 뉴스 사이에 노출 (3:1 비율, retina 대응)',
    },
    strip: {
      label: '띠배너 광고',
      imageGuide: '2400x180',
      description: 'Header 아래 전체폭 띠배너 (PC 90px / Mobile 60px 표시, retina 대응)',
    },
    hero_ad: {
      label: 'HERO 카드 하단 광고',
      imageGuide: '576x144',
      description: '메인 우측 카테고리 카드 4개 바로 아래 노출 (4:1 비율, retina 대응)',
    },
  };

  const info = typeInfo[adType] || typeInfo.sidebar;

  const [form, setForm] = useState({
    title: ad?.title || '',
    description: ad?.description || '',
    image: ad?.image || '',
    link: ad?.link || '',
    advertiser: ad?.advertiser || '',
    startDate: ad?.startDate || '',
    endDate: ad?.endDate || '',
    memo: ad?.memo || '',
  });

  // 폼 변경 시 외부에 알림 (미리보기용)
  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.image) {
      alert('제목과 이미지를 입력해주세요.');
      return;
    }
    onSave(form);
  };

  return (
    <div>
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
        <ImageUploader
          currentImage={form.image}
          onImageChange={(url) => setForm({ ...form, image: url })}
          guide={info.imageGuide}
          allowGif={adType !== 'headline'}
          folder="banners"
          label="광고 이미지"
          allowWatermark={false}
        />

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

        {/* 광고주 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">광고주</label>
          <input
            type="text"
            value={form.advertiser}
            onChange={(e) => setForm({ ...form, advertiser: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="(주)메디컬파트너스"
          />
        </div>

        {/* 게재 기간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">게재 기간</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <span className="text-gray-400">~</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">기간 미설정 시 상시 게재됩니다.</p>
        </div>

        {/* 계약 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">계약 메모</label>
          <textarea
            value={form.memo}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="계약 조건·담당자 등 내부 메모"
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

// 광고 관리 — 서브탭(광고 배치 / 광고 소재 만들기)
function AdManager({ banners, setBanners, onRefresh }) {
  const [subTab, setSubTab] = useState('placement'); // 'placement' | 'creation'

  // 통합 update 핸들러 — id=null이면 create
  const updateOrCreate = (id, data) =>
    id ? api.update('banners', id, data) : api.create('banners', data);

  return (
    <div className="space-y-5">
      {/* 서브탭 */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSubTab('placement')}
          className={`px-5 py-2.5 text-base font-bold border-b-2 -mb-px transition-colors ${
            subTab === 'placement'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-navy'
          }`}
        >
          📐 광고 배치
        </button>
        <button
          onClick={() => setSubTab('creation')}
          className={`px-5 py-2.5 text-base font-bold border-b-2 -mb-px transition-colors ${
            subTab === 'creation'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-navy'
          }`}
        >
          ✍️ 광고 소재 만들기
        </button>
      </div>

      {subTab === 'placement' && (
        <AdSlotManagerUI
          banners={banners}
          onUpdate={(id, data) => api.update('banners', id, data)}
          onRefresh={onRefresh}
        />
      )}

      {subTab === 'creation' && (
        <AdCreationManagerUI
          banners={banners}
          onUpdate={updateOrCreate}
          onDelete={(id) => api.remove('banners', id)}
          onRefresh={onRefresh}
          renderEditor={({ ad, type, onSave, onCancel, onFormChange }) => (
            <AdEditor
              key={ad?.id || `new-${type}`}
              ad={ad}
              adType={type}
              onSave={onSave}
              onCancel={onCancel}
              onFormChange={onFormChange}
            />
          )}
        />
      )}
    </div>
  );
}

// 기간별 인기 기사 탭 라벨
const PERIOD_TABS = [
  { key: 'today', label: '오늘' },
  { key: 'week', label: '이번 주' },
  { key: 'month', label: '이번 달' },
  { key: 'custom', label: '직접 선택' },
];

// YYYY-MM-DD (로컬/KST 브라우저 기준) 문자열 생성
function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// YYYY-MM-DD → 'M/D' 라벨 (차트 제목용)
function toShortLabel(dateStr) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return dateStr;
  return `${Number(m[2])}/${Number(m[3])}`;
}

// 최근 N일 날짜 배열 생성 (KST 기준 M/D 키 포함, 빈 날 0 채움용)
function buildDailyChartData(dailySeries, days = 30) {
  // dailySeries.day(YYYY-MM-DD, KST 일 단위) → 조회/방문 매핑
  const map = {};
  (dailySeries || []).forEach((row) => {
    map[row.day] = { views: row.views || 0, visitors: row.visitors || 0 };
  });

  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const key = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const hit = map[key] || { views: 0, visitors: 0 };
    result.push({
      key,
      label: `${month}/${date}`,
      views: hit.views,
      visitors: hit.visitors,
    });
  }
  return result;
}

// 커스텀 범위(start~end, YYYY-MM-DD 포함)용 차트 데이터 — 빈 날 0 채움
function buildRangeChartData(dailySeries, start, end) {
  const map = {};
  (dailySeries || []).forEach((row) => {
    map[row.day] = { views: row.views || 0, visitors: row.visitors || 0 };
  });

  const result = [];
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return result;
  }
  // 과도한 반복 방지 (최대 366일)
  const maxDays = 366;
  let count = 0;
  for (let d = new Date(startDate); d <= endDate && count < maxDays; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const key = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const hit = map[key] || { views: 0, visitors: 0 };
    result.push({
      key,
      label: `${month}/${date}`,
      views: hit.views,
      visitors: hit.visitors,
    });
    count += 1;
  }
  return result;
}

function StatsManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodStats, setPeriodStats] = useState({
    today: { uniqueVisitors: 0, totalViews: 0 },
    week: { uniqueVisitors: 0, totalViews: 0 },
    month: { uniqueVisitors: 0, totalViews: 0 },
  });
  const [topArticles, setTopArticles] = useState([]); // 역대 누적 TOP 10
  const [bannerStats, setBannerStats] = useState([]);
  const [dailySeries, setDailySeries] = useState([]); // 최근 30일 추이
  const [referrers, setReferrers] = useState([]); // 유입 경로 (선택된 기간)
  // 기간별 인기 기사 TOP 10 — 기간 탭과 연동 (today|week|month|custom)
  const [articlePeriod, setArticlePeriod] = useState('week');
  const [topArticlesPeriod, setTopArticlesPeriod] = useState([]);

  // 직접 선택(커스텀 범위) 관련 상태
  // 기본값: 시작=30일 전, 종료=오늘 (KST 브라우저 기준)
  const todayStr = toDateInputValue(new Date());
  const defaultStartStr = toDateInputValue(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
  const [customStart, setCustomStart] = useState(defaultStartStr); // date input(시작)
  const [customEnd, setCustomEnd] = useState(todayStr); // date input(종료)
  // 실제 적용(재조회)된 범위 — null이면 프리셋 모드
  const [appliedRange, setAppliedRange] = useState(null); // { start, end }

  // 프리셋 조회 (period 기반)
  const fetchPeriodStats = useCallback(async (period) => {
    const res = await fetch(`/api/analytics/stats?period=${period}&t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    if (!res.ok) {
      throw new Error('통계 데이터를 불러오지 못했습니다.');
    }
    return res.json();
  }, []);

  // 커스텀 범위 조회 (start/end 기반)
  const fetchRangeStats = useCallback(async (start, end) => {
    const res = await fetch(
      `/api/analytics/stats?start=${start}&end=${end}&t=${Date.now()}`,
      {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
    if (!res.ok) {
      throw new Error('통계 데이터를 불러오지 못했습니다.');
    }
    return res.json();
  }, []);

  const loadStats = useCallback(async (period = articlePeriod) => {
    setLoading(true);
    setError('');

    try {
      // 방문자 카드는 3개 기간 모두 필요. dailySeries는 어느 응답에나 동일(30일 고정)하므로 한 번만 사용.
      const [today, week, month] = await Promise.all([
        fetchPeriodStats('today'),
        fetchPeriodStats('week'),
        fetchPeriodStats('month'),
      ]);

      setPeriodStats({
        today: {
          uniqueVisitors: today.uniqueVisitors || 0,
          totalViews: today.totalViews || 0,
        },
        week: {
          uniqueVisitors: week.uniqueVisitors || 0,
          totalViews: week.totalViews || 0,
        },
        month: {
          uniqueVisitors: month.uniqueVisitors || 0,
          totalViews: month.totalViews || 0,
        },
      });
      setTopArticles(month.topArticles || []);
      setBannerStats((month.bannerStats || []).slice(0, 20));

      // 커스텀 범위가 적용된 상태면 그 범위 데이터로 차트/기사/유입 경로 갱신 (방문자 카드는 위 프리셋 유지)
      if (appliedRange) {
        const rangeData = await fetchRangeStats(appliedRange.start, appliedRange.end);
        setDailySeries(rangeData.dailySeries || []);
        setTopArticlesPeriod(rangeData.topArticlesPeriod || []);
        setReferrers(rangeData.referrers || []);
      } else {
        // dailySeries는 30일 고정이라 어느 프리셋 응답이든 동일 → month 응답에서 한 번만 취함
        setDailySeries(month.dailySeries || []);
        // 선택된 기간에 해당하는 응답에서 기간별 인기 기사 / 유입 경로 반영
        const selected = period === 'today' ? today : period === 'week' ? week : month;
        setTopArticlesPeriod(selected.topArticlesPeriod || []);
        setReferrers(selected.referrers || []);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(err.message || '통계를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [fetchPeriodStats, fetchRangeStats, articlePeriod, appliedRange]);

  useEffect(() => {
    loadStats();
    // 최초 1회만 로드 (탭 전환은 별도 핸들러에서 처리)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 기간 탭 전환 (오늘/주/월/직접선택)
  const handlePeriodTab = useCallback(async (period) => {
    if (period === articlePeriod) return;
    setArticlePeriod(period);

    // "직접 선택" 탭: date input만 노출, 조회는 "적용" 버튼에서. 기존 프리셋 데이터는 유지.
    if (period === 'custom') {
      return;
    }

    // 프리셋 탭으로 복귀: 커스텀 범위 해제 후 프리셋 데이터로 차트/기사/유입 경로 갱신
    setAppliedRange(null);
    try {
      const data = await fetchPeriodStats(period);
      setDailySeries(data.dailySeries || []); // 프리셋은 30일 고정 추이로 복원
      setTopArticlesPeriod(data.topArticlesPeriod || []);
      setReferrers(data.referrers || []);
    } catch (err) {
      console.error('Error loading period stats:', err);
      setError(err.message || '기간별 통계를 불러오는 중 오류가 발생했습니다.');
    }
  }, [articlePeriod, fetchPeriodStats]);

  // 직접 선택 범위 "적용" — start/end로 재조회하여 차트/기사/유입 경로 갱신
  const handleApplyCustomRange = useCallback(async () => {
    if (!customStart || !customEnd) {
      setError('시작일과 종료일을 모두 선택해주세요.');
      return;
    }
    if (customStart > customEnd) {
      setError('시작일은 종료일보다 앞서야 합니다.');
      return;
    }
    setError('');
    try {
      const data = await fetchRangeStats(customStart, customEnd);
      setAppliedRange({ start: customStart, end: customEnd });
      setDailySeries(data.dailySeries || []);
      setTopArticlesPeriod(data.topArticlesPeriod || []);
      setReferrers(data.referrers || []);
    } catch (err) {
      console.error('Error loading custom range stats:', err);
      setError(err.message || '기간별 통계를 불러오는 중 오류가 발생했습니다.');
    }
  }, [customStart, customEnd, fetchRangeStats]);

  // 차트 데이터 (빈 날 0 채움) — 커스텀 범위면 그 범위, 아니면 최근 30일
  const chartData = appliedRange
    ? buildRangeChartData(dailySeries, appliedRange.start, appliedRange.end)
    : buildDailyChartData(dailySeries, 30);
  // 차트 제목: 커스텀이면 "기간 추이 (M/D~M/D)", 아니면 "최근 30일 추이"
  const chartTitle = appliedRange
    ? `기간 추이 (${toShortLabel(appliedRange.start)}~${toShortLabel(appliedRange.end)})`
    : '최근 30일 추이';
  const chartMaxViews = Math.max(1, ...chartData.map((d) => d.views));
  const chartTotalViews = chartData.reduce((sum, d) => sum + d.views, 0);
  const chartTotalVisitors = chartData.reduce((sum, d) => sum + d.visitors, 0);

  // 유입 경로 비중 계산용 총합 — 방문자 기준 (중복 뷰 왜곡 방지, 구응답 호환 count fallback)
  const referrerTotal = referrers.reduce((sum, r) => sum + (r.visitors ?? r.count ?? 0), 0);

  const BANNER_TYPE_LABELS = {
    headline: '헤드라인 슬라이더',
    sidebar: '사이드바',
    strip: '띠배너',
    hero_ad: 'HERO 카드 하단',
  };

  const resetBannerMetrics = async (banner) => {
    if (!confirm(`"${banner.title || '배너'}"의 노출·클릭 수치를 0으로 초기화할까요? (계약 갱신 시 이전 수치 혼재 방지)`)) return;
    try {
      const res = await fetch(`/api/banners/${banner.id}/reset-metrics`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '초기화 실패');
      }
      await loadStats();
    } catch (err) {
      console.error('Error resetting metrics:', err);
      setError(err.message || '수치 초기화에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">방문 및 광고 통계</h2>
        <button
          onClick={loadStats}
          disabled={loading}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
        >
          {loading ? '갱신 중...' : '통계 새로고침'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: 'today', label: '오늘 방문자' },
          { key: 'week', label: '이번 주 방문자' },
          { key: 'month', label: '이번 달 방문자' },
        ].map((card) => (
          <div key={card.key} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900">
              {(periodStats[card.key]?.uniqueVisitors || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              페이지뷰 {(periodStats[card.key]?.totalViews || 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* 최근 30일 추이 — CSS 막대 차트 (라이브러리 미사용) */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{chartTitle}</h3>
          <p className="text-xs text-gray-500">
            총 조회 {chartTotalViews.toLocaleString()} · 순방문 {chartTotalVisitors.toLocaleString()}
          </p>
        </div>
        <div className="flex items-end gap-[3px] h-40 border-b border-gray-200">
          {chartData.map((d) => (
            <div
              key={d.key}
              className="flex-1 flex items-end justify-center h-full"
              title={`${d.label} · 조회 ${d.views.toLocaleString()} · 방문 ${d.visitors.toLocaleString()}`}
            >
              <div
                className="w-full bg-sky-500 hover:bg-sky-600 rounded-t transition-colors"
                style={{ height: `${(d.views / chartMaxViews) * 100}%`, minHeight: d.views > 0 ? '2px' : '0' }}
              />
            </div>
          ))}
        </div>
        {/* 5일 간격 날짜 라벨 */}
        <div className="flex gap-[3px] mt-2">
          {chartData.map((d, idx) => (
            <div key={d.key} className="flex-1 text-center text-[10px] text-gray-400">
              {idx % 5 === 0 ? d.label : ''}
            </div>
          ))}
        </div>
        {!loading && chartTotalViews === 0 && (
          <p className="py-4 text-center text-gray-500 text-sm">
            {appliedRange ? '해당 기간 집계된 조회수가 없습니다.' : '최근 30일 집계된 조회수가 없습니다.'}
          </p>
        )}
      </div>

      {/* 기간별 인기 기사 TOP 10 — 기간 탭 연동 (탭은 차트·기사·유입 경로를 함께 지배) */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">기간별 인기 기사 TOP 10</h3>
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handlePeriodTab(tab.key)}
                className={`px-3 py-1.5 text-sm font-medium ${
                  articlePeriod === tab.key
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 직접 선택 탭: 시작/종료 date input + 적용 버튼 */}
        {articlePeriod === 'custom' && (
          <div className="flex flex-wrap items-end gap-3 mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">시작일</label>
              <input
                type="date"
                value={customStart}
                max={todayStr}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">종료일</label>
              <input
                type="date"
                value={customEnd}
                max={todayStr}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyCustomRange}
              className="px-4 py-1.5 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700"
            >
              적용
            </button>
            {appliedRange && (
              <span className="text-xs text-gray-500 pb-1.5">
                적용됨: {appliedRange.start} ~ {appliedRange.end}
              </span>
            )}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4">순위</th>
                <th className="py-2 pr-4">제목</th>
                <th className="py-2 text-right">기간 조회수</th>
              </tr>
            </thead>
            <tbody>
              {topArticlesPeriod.map((article, idx) => (
                <tr key={article.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-semibold text-gray-700">{idx + 1}</td>
                  <td className="py-3 pr-4 text-gray-800">
                    <a
                      href={`/article/${article.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-sky-600 hover:underline"
                    >
                      {article.title}
                    </a>
                  </td>
                  <td className="py-3 text-right font-medium text-gray-900">
                    {(article.views || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && topArticlesPeriod.length === 0 && (
            <p className="py-6 text-center text-gray-500">해당 기간 집계된 기사 조회수가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 유입 경로 — 검색 등록 효과 측정 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">유입 경로</h3>
        <p className="text-xs text-gray-400 mb-4">방문자 기준 · 새로고침 등 중복 조회는 뷰 수에만 반영 (선택한 기간 기준)</p>
        <div className="space-y-3">
          {referrers.map((r) => {
            const visitorCount = r.visitors ?? r.count ?? 0;
            const ratio = referrerTotal > 0 ? (visitorCount / referrerTotal) * 100 : 0;
            return (
              <div key={r.source} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm text-gray-700">{r.source}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full"
                    style={{ width: `${ratio}%` }}
                  />
                </div>
                <span className="w-36 shrink-0 text-right text-sm text-gray-600">
                  {visitorCount.toLocaleString()}명 ({ratio.toFixed(1)}%) · {(r.count || 0).toLocaleString()}뷰
                </span>
              </div>
            );
          })}
        </div>
        {!loading && referrers.length === 0 && (
          <p className="py-6 text-center text-gray-500">해당 기간 집계된 유입 경로가 없습니다.</p>
        )}
      </div>

      {/* 역대 조회수 TOP 10 (전체 누적) */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">역대 조회수 TOP 10 (전체 누적)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4">순위</th>
                <th className="py-2 pr-4">제목</th>
                <th className="py-2 text-right">조회수</th>
              </tr>
            </thead>
            <tbody>
              {topArticles.map((article, idx) => (
                <tr key={article.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 font-semibold text-gray-700">{idx + 1}</td>
                  <td className="py-3 pr-4 text-gray-800">{article.title}</td>
                  <td className="py-3 text-right font-medium text-gray-900">
                    {(article.views || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && topArticles.length === 0 && (
            <p className="py-6 text-center text-gray-500">집계된 기사 조회수가 없습니다.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">배너 광고 성과 (전체 누적)</h3>
        <p className="text-xs text-gray-400 mb-4">기간과 무관한 전체 누적 노출·클릭 수치입니다. 계약 갱신 시 리셋으로 이전 수치와 혼재를 방지하세요.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4">배너명</th>
                <th className="py-2 pr-4">슬롯</th>
                <th className="py-2 pr-4">광고주</th>
                <th className="py-2 pr-4 text-right">노출수</th>
                <th className="py-2 pr-4 text-right">클릭수</th>
                <th className="py-2 pr-4 text-right">CTR</th>
                <th className="py-2 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {bannerStats.map((banner) => (
                <tr key={banner.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 text-gray-800">{banner.title}</td>
                  <td className="py-3 pr-4 text-gray-600">{BANNER_TYPE_LABELS[banner.type] || banner.type || '-'}</td>
                  <td className="py-3 pr-4 text-gray-600">{banner.advertiser || '-'}</td>
                  <td className="py-3 pr-4 text-right text-gray-900">{banner.impressions.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right text-gray-900">{banner.clicks.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right font-medium text-sky-700">{(banner.ctr || 0).toFixed(2)}%</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => resetBannerMetrics(banner)}
                      className="px-2.5 py-1 text-xs font-semibold text-red-600 border border-red-200 rounded hover:bg-red-50"
                    >
                      리셋
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && bannerStats.length === 0 && (
            <p className="py-6 text-center text-gray-500">집계된 배너 통계가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// 메인 관리자 페이지
export default function AdminPage() {
  const [currentMenu, setCurrentMenu] = useState('articles');
  const [articles, setArticles] = useState(staticArticles);
  const [ceoReports, setCeoReports] = useState(staticCeoReports);
  const [opinions, setOpinions] = useState(staticOpinions);
  const [doctorInterviews, setDoctorInterviews] = useState([]);
  const [banners, setBanners] = useState(staticBanners);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState({
    headline: staticArticles.filter(a => a.isHeadline),
    subheadline: staticArticles.filter(a => !a.isHeadline).slice(0, 1),
    news: staticArticles.filter(a => !a.isHeadline).slice(1),
    focus: [],
    category_card: [],
    opinion: [],
  });

  // 데이터 로드
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [articlesData, opinionsData, doctorInterviewsData, ceoData, bannersData] = await Promise.all([
        api.fetchData('articles'),
        api.fetchData('opinions'),
        api.fetchData('doctor-interviews'),
        api.fetchData('ceo-reports'),
        api.fetchData('banners'),
      ]);

      if (articlesData) setArticles(articlesData);
      if (opinionsData) setOpinions(opinionsData);
      if (doctorInterviewsData) setDoctorInterviews(doctorInterviewsData);
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
        focus: (articlesData || []).filter(a => a.placement === 'focus'),
        category_card: (articlesData || []).filter(a => a.placement === 'category_card'),
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
    stats: '통계',
    'news-sources': '기사 작성 도우미',
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
            doctorInterviews={doctorInterviews}
            setDoctorInterviews={setDoctorInterviews}
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
        {currentMenu === 'stats' && (
          <StatsManager />
        )}
        {currentMenu === 'news-sources' && (
          <NewsSourceManager />
        )}
        {currentMenu === 'doctor-picks' && (
          <DoctorPickManager />
        )}
      </main>
    </div>
  );
}
