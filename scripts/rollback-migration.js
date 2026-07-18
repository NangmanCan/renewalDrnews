#!/usr/bin/env node
/**
 * migrate-to-db.js가 남긴 id 로그를 읽어 해당 기사들을 DB에서 삭제 (롤백)
 *
 * 사용법:
 *   node scripts/rollback-migration.js <migrated-ids-YYYY-MM-DD.json>        # 미리보기
 *   node scripts/rollback-migration.js <migrated-ids-YYYY-MM-DD.json> --yes  # 실제 삭제
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

const CRAWL_DIR = path.join(__dirname, '../data/crawled/kmpnews');

// Supabase REST DELETE (id 배치 삭제)
function supabaseDelete(table, ids) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}?id=in.(${ids.join(',')})`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=representation',
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          let rows = [];
          try { rows = JSON.parse(body); } catch (_) {}
          resolve(rows);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  const confirm = args.includes('--yes');
  const fileArg = args.find(a => !a.startsWith('--'));

  if (!fileArg) {
    console.error('사용법: node scripts/rollback-migration.js <migrated-ids-YYYY-MM-DD.json> [--yes]');
    process.exit(1);
  }

  const logPath = path.isAbsolute(fileArg) ? fileArg : path.join(CRAWL_DIR, fileArg);
  if (!fs.existsSync(logPath)) {
    console.error(`❌ 로그 파일 없음: ${logPath}`);
    process.exit(1);
  }

  const log = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
  const table = log.table || 'articles';
  const ids = log.ids || [];

  console.log(`🗒  롤백 로그: ${path.basename(logPath)}`);
  console.log(`   마이그레이션 시각: ${log.migratedAt}`);
  console.log(`   대상 테이블: ${table}`);
  console.log(`   삭제 대상: ${ids.length}건`);

  if (ids.length === 0) {
    console.log('삭제할 id가 없습니다.');
    return;
  }

  if (!confirm) {
    console.log('\n🔍 [미리보기] 실제 삭제하려면 --yes 플래그를 추가하세요:');
    console.log(`   node scripts/rollback-migration.js ${path.basename(logPath)} --yes`);
    return;
  }

  console.log('\n🗑  삭제 진행...');
  const BATCH = 100; // URL 길이 제한 회피
  let deleted = 0;
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    const rows = await supabaseDelete(table, chunk);
    deleted += rows.length;
    console.log(`   ${deleted}/${ids.length} 삭제...`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ 롤백 완료: ${deleted}건 삭제`);
  if (deleted < ids.length) {
    console.log(`⚠️  ${ids.length - deleted}건은 이미 삭제됐거나 찾지 못했습니다.`);
  }
}

main().catch(e => {
  console.error('❌ 롤백 실패:', e.message);
  process.exit(1);
});
