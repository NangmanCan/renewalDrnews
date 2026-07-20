// Dr.News 워터마크 유틸 (브라우저 전용, 클라이언트 컴포넌트에서만 import)
// InlinePhotoModal / ImageUploader 등에서 공용으로 사용.

// object URL로 이미지 로드
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
    img.src = src;
  });
}

/**
 * public/logo.png 를 워터마크용 캔버스로 전처리.
 * 로고는 흰 배경 + 검정 세리프 텍스트라, 밝은(배경) 픽셀은 투명 처리하고
 * 어두운(텍스트) 픽셀은 흰색으로 치환한다. 렌더 시 검정 그림자를 함께 그려
 * 밝은 사진/어두운 사진 모두에서 로고가 보이도록 한다.
 * @returns {Promise<HTMLCanvasElement>} 흰색 로고 실루엣 캔버스
 */
export async function buildWatermarkCanvas() {
  const logo = await loadImage('/logo.png');
  const canvas = document.createElement('canvas');
  canvas.width = logo.naturalWidth;
  canvas.height = logo.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(logo, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  // 밝기 기준으로 배경/텍스트 분리
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    if (luminance > 160) {
      // 밝은 배경 → 완전 투명
      data[i + 3] = 0;
    } else {
      // 어두운 텍스트 → 흰색 실루엣 (알파는 원본 어두움에 비례해 안티에일리어싱 유지)
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      // luminance 0(가장 진함)→불투명, 160 근처→투명. 부드러운 경계 유지
      data[i + 3] = Math.round(255 * (1 - luminance / 160));
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * 사진 캔버스 우측 하단에 워터마크 로고 합성.
 * 로고 폭 = 사진 폭의 18%, 여백 = 사진 폭의 2%, 불투명도 0.45.
 * 어두운 사진에서도 보이도록 흰 로고 밑에 검정 그림자(offset 2px, alpha 0.5).
 */
export function drawWatermark(photoCanvas, wmCanvas) {
  const ctx = photoCanvas.getContext('2d');
  const targetW = Math.round(photoCanvas.width * 0.18);
  const scale = targetW / wmCanvas.width;
  const targetH = Math.round(wmCanvas.height * scale);
  const margin = Math.round(photoCanvas.width * 0.02);
  const x = photoCanvas.width - targetW - margin;
  const y = photoCanvas.height - targetH - margin;

  ctx.save();
  ctx.globalAlpha = 0.45;
  // 검정 그림자로 밝은 배경에서의 가독성 확보
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.drawImage(wmCanvas, x, y, targetW, targetH);
  ctx.restore();
}
