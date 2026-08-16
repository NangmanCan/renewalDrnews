#!/usr/bin/env node
/**
 * 아카이브 이미지 백필: www.drnews.co.kr 호스트 미해석으로 누락된
 * 실제 기사 사진(upload/news/...)을 구 서버에서 내려받고
 * articles.jsonl의 localImages를 갱신한다. 광고 배너는 제외.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OLD_IP = '183.111.174.102';
const RESOLVE = `--resolve "drnews.co.kr:80:${OLD_IP}" --resolve "www.drnews.co.kr:80:${OLD_IP}"`;

const OUT_DIR = path.join(__dirname, '../data/archive/old-drnews');
const IMG_DIR = path.join(OUT_DIR, 'images');
const JSONL = path.join(OUT_DIR, 'articles.jsonl');

const isBanner = (u) => /\/upload\/banner\//.test(u);

function download(url, newsNo, idx) {
  const extMatch = url.match(/\.(jpe?g|png|gif|bmp|webp)/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
  const file = path.join(IMG_DIR, `${newsNo}_p${idx}.${ext}`);
  if (fs.existsSync(file) && fs.statSync(file).size > 500) return path.basename(file);
  try {
    // 인코딩된 URL 대응: 공백 등은 그대로 curl에 넘기되 따옴표로 감쌈
    execSync(`curl -s ${RESOLVE} --max-time 20 -o "${file}" "${url.replace(/"/g, '')}"`, { timeout: 25000 });
    if (fs.existsSync(file)) {
      const sz = fs.statSync(file).size;
      const head = fs.readFileSync(file).subarray(0, 20).toString('latin1');
      // HTML 에러 페이지 오저장 방지
      if (sz > 500 && !head.includes('<!DOC') && !head.includes('<html')) return path.basename(file);
      fs.unlinkSync(file);
    }
  } catch (e) { /* skip */ }
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const arts = fs.readFileSync(JSONL, 'utf-8').trim().split('\n').map((l) => JSON.parse(l));
  let dl = 0, fail = 0, done = 0;
  for (const a of arts) {
    const photos = a.images.filter((u) => !isBanner(u));
    const local = [];
    for (let i = 0; i < photos.length; i++) {
      const f = download(photos[i], a.id, i);
      if (f) { local.push(f); dl++; } else fail++;
      await sleep(120);
    }
    a.images = photos;
    a.localImages = local;
    done++;
    if (done % 500 === 0) console.log(`[${done}/${arts.length}] 사진 ${dl} · 실패 ${fail}`);
  }
  fs.writeFileSync(JSONL, arts.map((a) => JSON.stringify(a)).join('\n') + '\n');
  // 배너 사본 제거
  for (const f of fs.readdirSync(IMG_DIR)) {
    if (/_0\.(jpg|gif|png)$/.test(f) && !/_p\d/.test(f)) {
      const p = path.join(IMG_DIR, f);
      if (fs.statSync(p).size === 59675) fs.unlinkSync(p); // redpack.jpg 크기
    }
  }
  console.log(`완료: 사진 ${dl}장 저장, 실패 ${fail}, 기사 ${done}건 갱신 (배너 사본 정리됨)`);
})();
