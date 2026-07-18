#!/usr/bin/env node
/**
 * 필터링된 기사를 Supabase DB에 마이그레이션
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Supabase 설정
const SUPABASE_URL = 'https://xychomcqxbtspqwpxkyx.supabase.co';
const SUPABASE_KEY = process.env.PROD_SUPABASE_SERVICE_KEY;
if (!SUPABASE_KEY) {
  console.error('PROD_SUPABASE_SERVICE_KEY 환경변수가 필요합니다.');
  process.exit(1);
}

const INPUT_FILE = path.join(__dirname, '../data/crawled/kmpnews/kmpnews_filtered.json');

// Supabase REST API POST
function supabasePost(table, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation', // 롤백용 id 회수
        'Content-Length': Buffer.byteLength(postData),
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          let rows = [];
          try { rows = JSON.parse(body); } catch (_) {}
          resolve({ success: true, status: res.statusCode, rows });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 날짜 파싱 (2026.03.04 07:19 → ISO)
function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  
  const match = dateStr.match(/(\d{4})\.(\d{2})\.(\d{2})\s*(\d{2}):(\d{2})/);
  if (match) {
    const [_, y, m, d, h, min] = match;
    return new Date(`${y}-${m}-${d}T${h}:${min}:00+09:00`).toISOString();
  }
  return new Date().toISOString();
}

// 기사 데이터 변환
function transformArticle(article) {
  return {
    title: article.title,
    summary: article.summary || article.content?.substring(0, 200) || '',
    content: article.content || '',
    category: article.category || '산업',
    author: article.author || '김영학',
    image: article.thumbnail || null,
    placement: 'news',
    is_headline: false,
    views: 0,
    created_at: parseDate(article.publishedAt),
    updated_at: new Date().toISOString(),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  console.log('📂 필터링된 기사 로드...');
  const articles = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`   총 ${articles.length}건`);

  if (dryRun) {
    console.log('\n🔍 [DRY RUN] 실제 DB 삽입 없이 미리보기만 수행\n');
  }

  let success = 0;
  let failed = 0;
  const errors = [];
  const insertedIds = [];

  console.log('\n🚀 마이그레이션 시작...\n');

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const transformed = transformArticle(article);

    const preview = `[${i + 1}/${articles.length}] ${article.title.substring(0, 40)}... → ${article.category}`;

    if (dryRun) {
      console.log(`✓ ${preview}`);
      success++;
    } else {
      try {
        const res = await supabasePost('articles', transformed);
        const id = res.rows && res.rows[0] && res.rows[0].id;
        if (id) insertedIds.push(id);
        console.log(`✅ ${preview}`);
        success++;

        // 속도 제한
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        console.log(`❌ ${preview}`);
        console.log(`   Error: ${err.message}`);
        errors.push({ title: article.title, error: err.message });
        failed++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ 완료: ${success}건 성공`);
  if (failed > 0) {
    console.log(`❌ 실패: ${failed}건`);
    console.log('\n실패 목록:');
    errors.forEach(e => console.log(`  - ${e.title.substring(0, 40)}...: ${e.error}`));
  }

  // 롤백용 id 로그 저장
  if (!dryRun && insertedIds.length > 0) {
    const logPath = path.join(
      path.dirname(INPUT_FILE),
      `migrated-ids-${new Date().toISOString().slice(0, 10)}.json`
    );
    fs.writeFileSync(logPath, JSON.stringify({
      migratedAt: new Date().toISOString(),
      table: 'articles',
      source: 'kmpnews',
      count: insertedIds.length,
      ids: insertedIds,
    }, null, 2), 'utf-8');
    console.log(`\n🗒  롤백 로그 저장: ${logPath}`);
    console.log(`   롤백하려면: node scripts/rollback-migration.js ${path.basename(logPath)} --yes`);
  }

  if (dryRun) {
    console.log('\n💡 실제 삽입하려면: node scripts/migrate-to-db.js');
  }
}

main().catch(console.error);
