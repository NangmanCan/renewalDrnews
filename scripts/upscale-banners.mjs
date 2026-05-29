import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC = './data/banners/old-drnews';
const OUT = path.join(SRC, 'processed');
const TARGET_W = 576;   // 사이드 배너 3:1 retina (표시 288x96 × 2)
const TARGET_H = 192;

fs.mkdirSync(OUT, { recursive: true });
const files = fs.readdirSync(SRC).filter((f) => /\.(jpe?g|png)$/i.test(f));

console.log(`사이드 배너 규격: ${TARGET_W}x${TARGET_H} (3:1)\n`);
for (const f of files) {
  const inp = path.join(SRC, f);
  const m = await sharp(inp).metadata();
  const out = path.join(OUT, f.replace(/\.(jpe?g|png)$/i, '.png'));
  // 1) Lanczos3 업스케일 + contain(비율 유지) + 흰 패딩  2) 언샤프로 엣지 보강
  await sharp(inp)
    .resize(TARGET_W, TARGET_H, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      kernel: 'lanczos3',
    })
    .sharpen({ sigma: 1.0 })
    .png({ compressionLevel: 9 })
    .toFile(out);
  const scale = (TARGET_H / m.height).toFixed(1);
  console.log(`✅ ${f} (${m.width}x${m.height}, ${scale}x) → ${path.basename(out)} (${TARGET_W}x${TARGET_H})`);
}
console.log(`\n📁 저장: ${OUT}`);
