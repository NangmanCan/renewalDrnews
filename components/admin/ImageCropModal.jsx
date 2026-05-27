'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import Pica from 'pica';

const picaInstance = typeof window !== 'undefined' ? Pica() : null;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// pixelCrop 영역만 잘라낸 후 가이드 크기로 pica Lanczos3 리사이즈
async function getCroppedFile(imageSrc, pixelCrop, guide, sourceFile) {
  const img = await loadImage(imageSrc);

  // 1) 픽셀 단위로 crop 영역만 캔버스에 그리기
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = Math.max(1, Math.round(pixelCrop.width));
  cropCanvas.height = Math.max(1, Math.round(pixelCrop.height));
  const ctx = cropCanvas.getContext('2d');
  ctx.drawImage(
    img,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    cropCanvas.width,
    cropCanvas.height
  );

  // 2) 가이드 사이즈로 pica 리사이즈 (이미 같거나 작으면 스킵)
  const ext = sourceFile.name.split('.').pop()?.toLowerCase() || 'jpg';
  const isPng = sourceFile.type === 'image/png' || ext === 'png';
  const isWebP = sourceFile.type === 'image/webp' || ext === 'webp';
  const outputType = isPng ? 'image/png' : isWebP ? 'image/webp' : 'image/jpeg';
  const outputQuality = isPng ? undefined : 0.92;

  let finalCanvas = cropCanvas;
  if (cropCanvas.width > guide.width || cropCanvas.height > guide.height) {
    finalCanvas = document.createElement('canvas');
    finalCanvas.width = guide.width;
    finalCanvas.height = guide.height;
    await picaInstance.resize(cropCanvas, finalCanvas, {
      quality: 3,
      alpha: isPng,
      unsharpAmount: 80,
      unsharpRadius: 0.6,
      unsharpThreshold: 2,
    });
  }

  const blob = await picaInstance.toBlob(finalCanvas, outputType, outputQuality);
  if (!blob) throw new Error('이미지 변환에 실패했습니다.');

  const extension = isPng ? '.png' : isWebP ? '.webp' : '.jpg';
  const fileName = sourceFile.name.replace(/\.[^.]+$/, '') + extension;
  return new File([blob], fileName, { type: outputType, lastModified: Date.now() });
}

export default function ImageCropModal({ file, guide, onComplete, onCancel }) {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixelCrop, setPixelCrop] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 파일 → object URL
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ESC로 취소
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const aspect = useMemo(() => {
    if (!guide?.width || !guide?.height) return 1;
    return guide.width / guide.height;
  }, [guide]);

  const onCropComplete = useCallback((_areaPercent, pixels) => {
    setPixelCrop(pixels);
  }, []);

  const apply = async () => {
    if (!src || !pixelCrop || !file) return;
    setProcessing(true);
    try {
      const cropped = await getCroppedFile(src, pixelCrop, guide, file);
      onComplete?.(cropped);
    } catch (err) {
      console.error(err);
      alert('이미지 크롭 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4"
      style={{ zIndex: 2147483000 }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy">이미지 영역 선택</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              권장: <strong>{guide.width} × {guide.height}</strong> · 마우스로 끌어 위치 조정, 휠 또는 슬라이더로 확대/축소
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none w-8 h-8 flex items-center justify-center"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="relative bg-gray-900" style={{ height: 440 }}>
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              minZoom={1}
              maxZoom={4}
              restrictPosition={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid
              objectFit="contain"
            />
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex items-center gap-4 bg-gray-50">
          <span className="text-sm font-semibold text-gray-700 flex-shrink-0">줌</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-brand-600"
          />
          <span className="text-sm text-gray-500 w-12 text-right">{Math.round(zoom * 100)}%</span>
          <div className="flex items-center gap-2 ml-2">
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
              onClick={apply}
              disabled={!pixelCrop || processing}
              className="px-4 py-2 bg-brand-600 text-white rounded text-sm font-bold hover:bg-brand-700 disabled:opacity-50"
            >
              {processing ? '처리 중...' : '적용'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
