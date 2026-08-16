#!/usr/bin/env node
/**
 * 구 Dr.News(카페24) 전체 아카이브 크롤러
 * 카페24 만료(2026-08-18) 전 보존용 — news_no 전 범위 순회
 *
 * 저장 구조:
 *   data/archive/old-drnews/articles.jsonl  — 기사 메타+본문 (한 줄당 1건)
 *   data/archive/old-drnews/html/{id}.html  — 원본 HTML (UTF-8 변환본)
 *   data/archive/old-drnews/images/{id}_{n}.{ext} — 본문 이미지 원본
 *   data/archive/old-drnews/progress.json   — 재시작용 진행 상태
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OLD_IP = '183.111.174.102';
const BASE_URL = 'http://drnews.co.kr';
const RESOLVE = `--resolve "drnews.co.kr:80:${OLD_IP}"`;
const ID_START = 10000;
const ID_END = 16802;
const DELAY_MS = 250;

const OUT_DIR = path.join(__dirname, '../data/archive/old-drnews');
const HTML_DIR = path.join(OUT_DIR, 'html');
const IMG_DIR = path.join(OUT_DIR, 'images');
for (const d of [OUT_DIR, HTML_DIR, IMG_DIR]) fs.mkdirSync(d, { recursive: true });

const PROGRESS_FILE = path.join(OUT_DIR, 'progress.json');
const JSONL_FILE = path.join(OUT_DIR, 'articles.jsonl');

function fetchPage(url) {
  try {
    return execSync(`curl -s ${RESOLVE} --max-time 15 "${url}" | iconv -f euc-kr -t utf-8 2>/dev/null`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (e) {
    return null;
  }
}

function decodeEntities(s) {
  return (s || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&copy;/g, '©')
    .replace(/&middot;/g, '·')
    .replace(/&hellip;/g, '…')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function parseArticle(html, newsNo) {
  const dateMatch = html.match(/기자\s*\/\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
  if (!dateMatch) return null;

  const titleMatch = html.match(/<td[^>]*class=["']?t2["']?[^>]*>([^<]+)<\/td>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).trim() : null;
  if (!title) return null;

  const authorMatch = html.match(/([가-힣]+)\s*\(<a[^>]*href=["']?mailto:[^"']+["']?[^>]*>[^<]+<\/a>\)\s*기자/);
  const author = authorMatch ? authorMatch[1] + ' 기자' : '닥터뉴스';

  const contentStart = html.indexOf(dateMatch[0]);
  let contentHtml = html.substring(contentStart + dateMatch[0].length);
  const endMarkers = ['<form', '<!-- 광고', '기사제보', '관련기사', '저작권'];
  let endIdx = contentHtml.length;
  for (const marker of endMarkers) {
    const idx = contentHtml.indexOf(marker);
    if (idx > 100 && idx < endIdx) endIdx = idx;
  }
  contentHtml = contentHtml.substring(0, endIdx);

  const plainText = decodeEntities(
    contentHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  // 본문 이미지 전부 수집
  const images = [];
  const imgRe = /<img[^>]*src=["']([^"']*(?:news_photo|upload)[^"']*)["']/gi;
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    const src = m[1].startsWith('http') ? m[1] : `${BASE_URL}${m[1]}`;
    if (!images.includes(src)) images.push(src);
  }

  return {
    id: newsNo,
    title,
    author,
    date: `${dateMatch[1]}T${dateMatch[2]}`,
    text: plainText,
    images,
    originalUrl: `${BASE_URL}/sub2.htm?news_no=${newsNo}`,
  };
}

function downloadImage(url, newsNo, idx) {
  const extMatch = url.match(/\.(jpe?g|png|gif|bmp|webp)/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
  const file = path.join(IMG_DIR, `${newsNo}_${idx}.${ext}`);
  if (fs.existsSync(file) && fs.statSync(file).size > 0) return path.basename(file);
  try {
    execSync(`curl -s ${RESOLVE} --max-time 20 -o "${file}" "${url}"`, { timeout: 25000 });
    if (fs.existsSync(file) && fs.statSync(file).size > 500) return path.basename(file);
    if (fs.existsSync(file)) fs.unlinkSync(file);
  } catch (e) { /* skip */ }
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  let startId = ID_START;
  if (fs.existsSync(PROGRESS_FILE)) {
    startId = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')).nextId || ID_START;
    console.log(`이어서 시작: news_no=${startId}`);
  }

  let saved = 0, empty = 0, imgCount = 0;
  for (let id = startId; id <= ID_END; id++) {
    const url = `${BASE_URL}/sub2.htm?cate1_no=14&cate2_no=10&news_no=${id}`;
    const html = fetchPage(url);
    if (html && html.length > 1000) {
      const art = parseArticle(html, id);
      if (art) {
        fs.writeFileSync(path.join(HTML_DIR, `${id}.html`), html);
        const localImages = [];
        for (let i = 0; i < art.images.length; i++) {
          const f = downloadImage(art.images[i], id, i);
          if (f) { localImages.push(f); imgCount++; }
          await sleep(100);
        }
        art.localImages = localImages;
        fs.appendFileSync(JSONL_FILE, JSON.stringify(art) + '\n');
        saved++;
      } else {
        empty++;
      }
    } else {
      empty++;
    }

    if (id % 100 === 0) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ nextId: id + 1, saved, empty, imgCount }));
      console.log(`[${id}/${ID_END}] 저장 ${saved} · 결번 ${empty} · 이미지 ${imgCount}`);
    }
    await sleep(DELAY_MS);
  }

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ nextId: ID_END + 1, saved, empty, imgCount, done: true }));
  console.log(`완료: 기사 ${saved}건, 이미지 ${imgCount}장, 결번/무효 ${empty}`);
})();
