#!/usr/bin/env node
/**
 * kmpnews 이미지 → Supabase Storage 마이그레이션
 * thumbnail URL을 원본 photo URL로 교체
 */

const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://xychomcqxbtspqwpxkyx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Y2hvbWNxeGJ0c3Bxd3B4a3l4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI5NDM3MywiZXhwIjoyMDg1ODcwMzczfQ.0gVLKno0ANmSryH2ex4draQc_kztFsN0ZcURMoowZr0';

// HTTP GET
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, data: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// Supabase REST GET
async function supabaseGet(path) {
  const res = await httpGet(`${SUPABASE_URL}/rest/v1/${path}`, {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  });
  return JSON.parse(res.data.toString());
}

// Supabase REST PATCH
function supabasePatch(table, id, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      }
    }, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Supabase Storage Upload
function uploadToStorage(filename, buffer, contentType) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/storage/v1/object/images/articles/${filename}`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': contentType,
        'Content-Length': buffer.length,
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

// kmpnews 기사에서 원본 이미지 URL 추출
async function getOriginalImageUrl(thumbnailUrl) {
  // thumbnail URL에서 idxno 추출
  const match = thumbnailUrl.match(/\/(\d+)_(\d+)_(\d+)_v\d+\.(jpg|png)/i);
  if (!match) return null;
  
  const [_, id1, id2, id3, ext] = match;
  const idxno = id1;
  
  // 기사 페이지에서 원본 이미지 찾기
  try {
    const res = await httpGet(`https://www.kmpnews.co.kr/news/articleView.html?idxno=${idxno}`, {
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://www.kmpnews.co.kr/',
    });
    
    const html = res.data.toString();
    const photoMatch = html.match(/cdn\.kmpnews\.co\.kr\/news\/photo\/[^"'\s]+/);
    
    if (photoMatch) {
      return 'https://' + photoMatch[0];
    }
  } catch (e) {
    console.log(`   ⚠️  기사 페이지 로드 실패: ${idxno}`);
  }
  
  return null;
}

// 이미지 다운로드
async function downloadImage(url) {
  const res = await httpGet(url, {
    'User-Agent': 'Mozilla/5.0',
    'Referer': 'https://www.kmpnews.co.kr/',
  });
  
  if (res.status === 200 && res.data.length > 1000) {
    return res.data;
  }
  return null;
}

async function main() {
  console.log('🔍 kmpnews 이미지 사용 기사 조회...');
  
  const articles = await supabaseGet('articles?image=like.*kmpnews*&select=id,title,image&order=id.asc');
  console.log(`   총 ${articles.length}건\n`);
  
  let success = 0, failed = 0, skipped = 0;
  
  for (const article of articles) {
    const { id, title, image } = article;
    const shortTitle = title.substring(0, 35);
    
    try {
      // 1. 원본 이미지 URL 찾기
      const originalUrl = await getOriginalImageUrl(image);
      
      if (!originalUrl) {
        console.log(`⏭️  [${id}] ${shortTitle}... - 원본 없음`);
        skipped++;
        continue;
      }
      
      // 2. 다운로드
      const imgBuffer = await downloadImage(originalUrl);
      
      if (!imgBuffer) {
        console.log(`❌ [${id}] ${shortTitle}... - 다운로드 실패`);
        failed++;
        continue;
      }
      
      // 3. Storage 업로드
      const ext = originalUrl.split('.').pop().toLowerCase();
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
      const filename = `kmp_${id}.${ext}`;
      
      await uploadToStorage(filename, imgBuffer, contentType);
      
      // 4. DB 업데이트
      const newUrl = `${SUPABASE_URL}/storage/v1/object/public/images/articles/${filename}`;
      await supabasePatch('articles', id, { image: newUrl });
      
      console.log(`✅ [${id}] ${shortTitle}...`);
      success++;
      
      // 속도 제한
      await new Promise(r => setTimeout(r, 300));
      
    } catch (err) {
      console.log(`❌ [${id}] ${shortTitle}... - ${err.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ 성공: ${success}건`);
  console.log(`⏭️  스킵: ${skipped}건 (원본 없음)`);
  console.log(`❌ 실패: ${failed}건`);
}

main().catch(console.error);
