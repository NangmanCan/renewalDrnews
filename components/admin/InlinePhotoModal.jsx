'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Pica from 'pica';
import { uploadImage } from '@/lib/storage';
import { buildWatermarkCanvas, drawWatermark } from '@/lib/watermark';

const picaInstance = typeof window !== 'undefined' ? Pica() : null;

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_WIDTH = 1600; // 다운스케일 기준 폭 ("원본" 프리셋)
const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// 기준크기(출력 폭 상한) 프리셋. value=null 이면 기존 1600 상한 동작.
const BASE_PX_PRESETS = [
  { label: '원본(최대 1600px)', value: null },
  { label: '1280px', value: 1280 },
  { label: '960px', value: 960 },
  { label: '600px', value: 600 },
  { label: '250px', value: 250 },
];

// object URL로 이미지 로드
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
    img.src = src;
  });
}

// HTML escape (캡션·출처는 사용자 입력이므로 안전 처리)
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 처리 파이프라인:
 *  1) (워터마크 ON) 원본 → 캔버스 → 로고 합성
 *  2) 출력 폭 상한(maxWidth) 초과 시 비율 유지 다운스케일 (pica Lanczos3)
 *  3) png는 png 유지, 그 외 jpeg(q=0.9)
 * gif는 이 함수에 오지 않음(원본 그대로 업로드).
 * maxWidth: 선택 프리셋 px(원본이 더 크면 이 폭으로 다운스케일, 작으면 업스케일 안 함).
 * @returns {Promise<File>}
 */
async function processImage(file, { watermark, maxWidth }) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const isPng = file.type === 'image/png' || ext === 'png';
  const outputType = isPng ? 'image/png' : 'image/jpeg';
  const outputQuality = isPng ? undefined : 0.9;

  const objectUrl = URL.createObjectURL(file);
  let img;
  try {
    img = await loadImage(objectUrl);
  } finally {
    // loadImage 성공 후에도 draw 전까지 URL 필요하므로 아래에서 revoke
  }

  try {
    // 원본을 그린 소스 캔버스
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = img.naturalWidth;
    srcCanvas.height = img.naturalHeight;
    srcCanvas.getContext('2d').drawImage(img, 0, 0);

    // 1) 워터마크 합성 (원본 해상도에서)
    if (watermark) {
      const wmCanvas = await buildWatermarkCanvas();
      drawWatermark(srcCanvas, wmCanvas);
    }

    // 2) 다운스케일 필요 여부 (선택 프리셋 px, 기본 1600 상한)
    const widthCap = maxWidth || MAX_WIDTH;
    let finalCanvas = srcCanvas;
    if (srcCanvas.width > widthCap) {
      const targetW = widthCap;
      const targetH = Math.round((srcCanvas.height * widthCap) / srcCanvas.width);
      finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetW;
      finalCanvas.height = targetH;
      await picaInstance.resize(srcCanvas, finalCanvas, {
        quality: 3,
        alpha: isPng,
        unsharpAmount: 80,
        unsharpRadius: 0.6,
        unsharpThreshold: 2,
      });
    }

    // 3) blob 인코딩
    const blob = await picaInstance.toBlob(finalCanvas, outputType, outputQuality);
    if (!blob) throw new Error('이미지 변환에 실패했습니다.');

    const extension = isPng ? '.png' : '.jpg';
    const fileName = file.name.replace(/\.[^.]+$/, '') + extension;
    return new File([blob], fileName, { type: outputType, lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function InlinePhotoModal({ onInsert, onCancel }) {
  const fileInputRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [source, setSource] = useState('');
  const [width, setWidth] = useState('medium'); // 'medium' | 'full'
  const [align, setAlign] = useState('center'); // 'left' | 'center' | 'right'
  const [basePx, setBasePx] = useState(null); // 기준크기 프리셋(출력 폭 상한). null=원본(1600 상한)
  const [naturalWidth, setNaturalWidth] = useState(null); // 원본 로드 후 실제 폭
  const [watermark, setWatermark] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC로 취소
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  // 미리보기 object URL 정리
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const isGif = file?.type === 'image/gif';

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    e.target.value = '';
    if (!selected) return;

    setError(null);

    if (!VALID_TYPES.includes(selected.type)) {
      setError('지원하는 형식: JPG, PNG, WebP, GIF');
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(selected);
    setFile(selected);
    setPreviewUrl(url);
    setNaturalWidth(null);
    // 원본 실제 폭 로드 (출력 예상 표기용)
    loadImage(url)
      .then((img) => setNaturalWidth(img.naturalWidth))
      .catch(() => setNaturalWidth(null));
  };

  const handleConfirm = useCallback(async () => {
    if (!file) return;
    setError(null);
    setProcessing(true);
    try {
      const gif = file.type === 'image/gif';
      // gif는 워터마크·리사이즈 없이 원본 업로드
      const fileToUpload = gif
        ? file
        : await processImage(file, { watermark, maxWidth: basePx });

      const { url, error: uploadErr } = await uploadImage(fileToUpload, 'articles');
      if (uploadErr) throw uploadErr;

      const trimmedCaption = caption.trim();
      const trimmedSource = source.trim();
      const alt = trimmedCaption || '기사 이미지';
      // 전체폭이면 정렬은 무의미(중앙 고정), 좌/우 정렬이면 전체폭 강제 해제
      const isFull = width === 'full';
      const effectiveAlign = isFull ? 'center' : align;
      const fullClass = isFull ? ' article-photo-full' : '';
      const alignClass =
        effectiveAlign === 'left'
          ? ' article-photo-left'
          : effectiveAlign === 'right'
          ? ' article-photo-right'
          : '';

      let figcaption = '';
      if (trimmedCaption || trimmedSource) {
        const sourceText = trimmedSource ? ` (사진=${escapeHtml(trimmedSource)})` : '';
        figcaption = `<figcaption>${escapeHtml(trimmedCaption)}${sourceText}</figcaption>`;
      }

      const html = `<figure class="article-photo${fullClass}${alignClass}"><img src="${escapeHtml(
        url
      )}" alt="${escapeHtml(alt)}">${figcaption}</figure>`;

      onInsert?.(html, {
        src: url,
        alt,
        caption: trimmedCaption,
        source: trimmedSource,
        full: isFull,
        align: effectiveAlign,
      });
    } catch (err) {
      console.error('Inline photo insert failed:', err);
      setError(err?.message || '이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  }, [file, watermark, basePx, caption, source, width, align, onInsert]);

  if (!mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4"
      style={{ zIndex: 2147483000 }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-navy">본문 사진 추가</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none w-8 h-8 flex items-center justify-center"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 본문 */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 파일 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사진 파일</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              {file ? file.name : '파일 선택 (JPG · PNG · WebP · GIF, 최대 10MB)'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
              aria-label="사진 파일 선택"
            />
          </div>

          {/* 미리보기 */}
          {previewUrl && (
            <div className="space-y-1.5">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="w-full max-h-64 object-contain"
                />
              </div>
              {!isGif && naturalWidth && (
                <p className="text-xs text-gray-400">
                  출력: 약 {Math.min(naturalWidth, basePx || MAX_WIDTH)}px 폭
                </p>
              )}
            </div>
          )}

          {/* 캡션 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              캡션 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="사진 설명"
            />
          </div>

          {/* 출처 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              출처 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="예: 보건복지부, 본지 촬영"
            />
          </div>

          {/* 기준크기 프리셋 (출력 폭 상한) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">기준크기</label>
            <div className="flex flex-wrap gap-2">
              {BASE_PX_PRESETS.map((preset) => {
                const active = basePx === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBasePx(preset.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
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
            {isGif && (
              <p className="mt-1 text-xs text-amber-600">
                GIF는 크기 조정을 지원하지 않습니다. 원본 그대로 업로드됩니다.
              </p>
            )}
          </div>

          {/* 표시 폭 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">표시 폭</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="inline-photo-width"
                  value="medium"
                  checked={width === 'medium'}
                  onChange={() => setWidth('medium')}
                  className="accent-sky-600"
                />
                중간 (본문 폭의 약 70%)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="inline-photo-width"
                  value="full"
                  checked={width === 'full'}
                  onChange={() => {
                    setWidth('full');
                    setAlign('center'); // 전체폭은 중앙 고정
                  }}
                  className="accent-sky-600"
                />
                전체폭
              </label>
            </div>
          </div>

          {/* 정렬 (전체폭이면 비활성) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">정렬</label>
            <div className="flex gap-4">
              {[
                { value: 'left', label: '왼쪽' },
                { value: 'center', label: '중앙' },
                { value: 'right', label: '오른쪽' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 text-sm cursor-pointer ${
                    width === 'full' ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="inline-photo-align"
                    value={opt.value}
                    checked={width === 'full' ? opt.value === 'center' : align === opt.value}
                    disabled={width === 'full'}
                    onChange={() => {
                      setAlign(opt.value);
                      // 좌/우 정렬은 전체폭과 조합 불가 → 표시 폭 중간으로 강제
                      if (opt.value !== 'center') setWidth('medium');
                    }}
                    className="accent-sky-600"
                  />
                  {opt.label}
                  {opt.value === 'center' && (
                    <span className="text-gray-400 font-normal">(기본)</span>
                  )}
                </label>
              ))}
            </div>
            {width === 'full' && (
              <p className="mt-1 text-xs text-gray-400">
                전체폭에서는 정렬을 사용할 수 없습니다 (중앙 고정).
              </p>
            )}
          </div>

          {/* 워터마크 토글 */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={watermark}
                onChange={(e) => setWatermark(e.target.checked)}
                className="accent-sky-600 w-4 h-4"
              />
              워터마크 (우측 하단에 Dr.News 로고 합성)
            </label>
            {isGif && watermark && (
              <p className="mt-1 text-xs text-amber-600">
                GIF는 워터마크를 지원하지 않습니다. 원본 그대로 업로드됩니다.
              </p>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!file || processing}
            className="px-4 py-2 bg-sky-600 text-white rounded text-sm font-bold hover:bg-sky-700 disabled:opacity-50"
          >
            {processing ? '처리 중...' : '삽입'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
