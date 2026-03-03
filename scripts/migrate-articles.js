#!/usr/bin/env node
/**
 * 크롤링된 기사 → Supabase 마이그레이션
 */

const fs = require('fs');
const path = require('path');

// Supabase 설정
const SUPABASE_URL = 'https://xychomcqxbtspqwpxkyx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Y2hvbWNxeGJ0c3Bxd3B4a3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTQzNzMsImV4cCI6MjA4NTg3MDM3M30.GXH-kNQTLpx9knG5NFELef_ZJ-P2vo3tGk-Eyd4W-1Q';

// 크롤링된 기사 읽기
const articlesPath = path.join(__dirname, '../data/crawled/recent-articles.json');
const crawledArticles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));

// 요약 생성 (본문 첫 100자)
function createSummary(content) {
  const cleaned = content.replace(/\n/g, ' ').trim();
  if (cleaned.length <= 100) return cleaned;
  return cleaned.substring(0, 100) + '...';
}

// 카테고리 매핑
function mapCategory(article) {
  const { category, title } = article;
  
  // 닥터빅라운지 세부 분류
  if (category === '닥터빅라운지') {
    if (title.includes('수면') || title.includes('학회') || title.includes('심포지엄')) {
      return '학술';
    }
    return '병원'; // 인사, 병원 소식 등
  }
  
  // 기존 카테고리 그대로 사용
  return category;
}

// 기사 변환
function transformArticle(article) {
  return {
    title: article.title,
    summary: createSummary(article.content),
    content: article.content,
    category: mapCategory(article),
    author: article.author,
    image: article.image && !article.image.includes('banner') ? article.image : null,
    placement: 'news',
    is_headline: false,
    views: 0,
    created_at: article.date,
  };
}

// Supabase에 삽입
async function insertArticle(article) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(article),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Insert failed: ${error}`);
  }
  
  return response.json();
}

// 중복 체크
async function checkDuplicate(title) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/articles?title=eq.${encodeURIComponent(title)}&select=id`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    }
  );
  const data = await response.json();
  return data.length > 0;
}

// 메인 실행
async function migrate() {
  console.log('📰 마이그레이션 시작...\n');
  console.log(`총 ${crawledArticles.length}개 기사 처리 예정\n`);
  
  let success = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const article of crawledArticles) {
    try {
      // 중복 체크
      const isDuplicate = await checkDuplicate(article.title);
      if (isDuplicate) {
        console.log(`⏭️ 스킵 (중복): ${article.title.substring(0, 30)}...`);
        skipped++;
        continue;
      }
      
      // 변환 및 삽입
      const transformed = transformArticle(article);
      await insertArticle(transformed);
      console.log(`✅ 등록: ${article.title.substring(0, 30)}...`);
      success++;
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 200));
    } catch (error) {
      console.error(`❌ 실패: ${article.title.substring(0, 30)}... - ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n📊 결과:');
  console.log(`   ✅ 성공: ${success}개`);
  console.log(`   ⏭️ 스킵: ${skipped}개`);
  console.log(`   ❌ 실패: ${failed}개`);
}

migrate().catch(console.error);
