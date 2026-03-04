#!/usr/bin/env node
/**
 * 크롤링한 기사와 기존 DB 기사 중복 필터링
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Supabase 설정
const SUPABASE_URL = 'https://xychomcqxbtspqwpxkyx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Y2hvbWNxeGJ0c3Bxd3B4a3l4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI5NDM3MywiZXhwIjoyMDg1ODcwMzczfQ.0gVLKno0ANmSryH2ex4draQc_kztFsN0ZcURMoowZr0';

const INPUT_FILE = path.join(__dirname, '../data/crawled/kmpnews/kmpnews_2026-03-04.json');
const OUTPUT_FILE = path.join(__dirname, '../data/crawled/kmpnews/kmpnews_filtered.json');

// Supabase REST API 호출
function supabaseGet(table, params = '') {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
    const req = https.get(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

// 문자열 정규화 (비교용)
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^\w가-힣]/g, '')
    .trim();
}

// 유사도 체크 (제목 앞 20자 비교)
function isSimilar(title1, title2) {
  const n1 = normalize(title1).substring(0, 20);
  const n2 = normalize(title2).substring(0, 20);
  return n1 === n2 || n1.includes(n2) || n2.includes(n1);
}

async function main() {
  console.log('📂 크롤링 데이터 로드...');
  const crawledArticles = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`   크롤링 기사: ${crawledArticles.length}건`);

  console.log('\n🔍 기존 DB 기사 조회...');
  const existingArticles = await supabaseGet('articles', 'select=id,title&order=created_at.desc&limit=500');
  console.log(`   DB 기사: ${existingArticles.length}건`);

  // 기존 제목 목록
  const existingTitles = existingArticles.map(a => normalize(a.title));

  console.log('\n🔄 중복 필터링...');
  const filtered = [];
  const duplicates = [];

  for (const article of crawledArticles) {
    const isDuplicate = existingTitles.some(t => isSimilar(article.title, t));
    
    if (isDuplicate) {
      duplicates.push(article.title);
    } else {
      filtered.push(article);
    }
  }

  console.log(`\n✅ 필터링 완료`);
  console.log(`   - 중복 제외: ${duplicates.length}건`);
  console.log(`   - 신규 기사: ${filtered.length}건`);

  if (duplicates.length > 0) {
    console.log('\n🚫 제외된 중복 기사:');
    duplicates.slice(0, 10).forEach(t => console.log(`   - ${t.substring(0, 50)}...`));
    if (duplicates.length > 10) {
      console.log(`   ... 외 ${duplicates.length - 10}건`);
    }
  }

  // 필터링된 결과 저장
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  console.log(`\n📁 저장 완료: ${OUTPUT_FILE}`);

  // 카테고리별 통계
  const stats = {};
  filtered.forEach(a => {
    stats[a.category] = (stats[a.category] || 0) + 1;
  });
  console.log('\n📊 신규 기사 카테고리별 분포:');
  Object.entries(stats).sort((a,b) => b[1] - a[1]).forEach(([cat, cnt]) => {
    console.log(`   ${cat}: ${cnt}건`);
  });
}

main().catch(console.error);
