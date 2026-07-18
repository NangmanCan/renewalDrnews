#!/usr/bin/env node
/**
 * 크롤링된 기사(recent-articles.json) → Supabase 마이그레이션
 *  - "CEO리포트-..." 기사는 ceo_reports 테이블로 분리
 *  - 나머지는 articles 테이블로
 *  - 제목 완전일치 중복은 스킵
 *
 * 사용법:
 *   node scripts/migrate-articles.js --dry-run   # 미리보기
 *   node scripts/migrate-articles.js             # 실제 삽입
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xychomcqxbtspqwpxkyx.supabase.co';
// service_role (insert RLS 우회)
const SUPABASE_KEY = process.env.PROD_SUPABASE_SERVICE_KEY;
if (!SUPABASE_KEY) {
  console.error('PROD_SUPABASE_SERVICE_KEY 환경변수가 필요합니다.');
  process.exit(1);
}

const articlesPath = path.join(__dirname, '../data/crawled/recent-articles.json');
const crawledArticles = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'));

const dryRun = process.argv.includes('--dry-run');

function isCeoReport(article) {
  return /^CEO\s*리포트/.test(article.title || '');
}

function createSummary(content, len = 100) {
  const cleaned = (content || '').replace(/\n/g, ' ').trim();
  return cleaned.length <= len ? cleaned : cleaned.substring(0, len) + '...';
}

function mapCategory(article) {
  const { category, title } = article;
  if (category === '닥터빅라운지') {
    if (title.includes('수면') || title.includes('학회') || title.includes('심포지엄')) return '학술';
    return '병원';
  }
  return category;
}

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

// CEO리포트 변환 (ceo_reports 테이블 형식)
function transformCeoReport(article) {
  // "CEO리포트- " / "CEO리포트-" 접두사 제거 + 양끝 따옴표 정리
  let title = (article.title || '').replace(/^CEO\s*리포트\s*[-–:]?\s*/, '').trim();
  title = title.replace(/^["“'']+|["”'']+$/g, '').trim();
  return {
    title,
    subtitle: createSummary(article.content, 60),
    content: article.content,
    category: '경영철학',
    author: article.author || '닥터뉴스',
    author_title: 'CEO',
    created_at: article.date,
  };
}

async function sbInsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`${table} insert 실패: ${await res.text()}`);
}

async function isDuplicate(table, title) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?title=eq.${encodeURIComponent(title)}&select=id`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const data = await res.json();
  return Array.isArray(data) && data.length > 0;
}

async function migrate() {
  const ceoItems = crawledArticles.filter(isCeoReport);
  const articleItems = crawledArticles.filter((a) => !isCeoReport(a));

  console.log(`📰 마이그레이션 ${dryRun ? '[DRY RUN] ' : ''}시작`);
  console.log(`   일반 기사: ${articleItems.length}건 / CEO리포트: ${ceoItems.length}건\n`);

  let aOk = 0, aSkip = 0, aFail = 0;
  let cOk = 0, cSkip = 0, cFail = 0;

  // 1) CEO리포트 → ceo_reports
  for (const item of ceoItems) {
    const ceo = transformCeoReport(item);
    try {
      if (await isDuplicate('ceo_reports', ceo.title)) {
        console.log(`⏭️  CEO 스킵(중복): ${ceo.title.slice(0, 30)}`);
        cSkip++;
        continue;
      }
      if (dryRun) {
        console.log(`✓ [CEO] ${ceo.title.slice(0, 40)} (${ceo.created_at?.slice(0, 10)})`);
        cOk++;
      } else {
        await sbInsert('ceo_reports', ceo);
        console.log(`✅ [CEO] ${ceo.title.slice(0, 40)}`);
        cOk++;
        await new Promise((r) => setTimeout(r, 150));
      }
    } catch (e) {
      console.error(`❌ CEO 실패: ${ceo.title.slice(0, 30)} - ${e.message}`);
      cFail++;
    }
  }

  // 2) 일반 기사 → articles
  for (const item of articleItems) {
    try {
      if (await isDuplicate('articles', item.title)) {
        console.log(`⏭️  스킵(중복): ${item.title.slice(0, 30)}`);
        aSkip++;
        continue;
      }
      if (dryRun) {
        console.log(`✓ [${mapCategory(item)}] ${item.title.slice(0, 40)} (${(item.date || '').slice(0, 10)})`);
        aOk++;
      } else {
        await sbInsert('articles', transformArticle(item));
        console.log(`✅ [${mapCategory(item)}] ${item.title.slice(0, 40)}`);
        aOk++;
        await new Promise((r) => setTimeout(r, 150));
      }
    } catch (e) {
      console.error(`❌ 실패: ${item.title.slice(0, 30)} - ${e.message}`);
      aFail++;
    }
  }

  console.log('\n📊 결과');
  console.log(`   articles    ✅ ${aOk} / ⏭️ ${aSkip} / ❌ ${aFail}`);
  console.log(`   ceo_reports ✅ ${cOk} / ⏭️ ${cSkip} / ❌ ${cFail}`);
  if (dryRun) console.log('\n💡 실제 삽입: node scripts/migrate-articles.js');
}

migrate().catch(console.error);
