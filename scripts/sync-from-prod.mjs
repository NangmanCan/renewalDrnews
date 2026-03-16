// 운영 DB → 로컬 Supabase 동기화 스크립트
import { createClient } from '@supabase/supabase-js';

// 운영 DB
const prodSupabase = createClient(
  'https://xychomcqxbtspqwpxkyx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Y2hvbWNxeGJ0c3Bxd3B4a3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTQzNzMsImV4cCI6MjA4NTg3MDM3M30.GXH-kNQTLpx9knG5NFELef_ZJ-P2vo3tGk-Eyd4W-1Q'
);

// 로컬 DB
const localSupabase = createClient(
  'http://127.0.0.1:54331',
  'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
);

async function syncTable(tableName) {
  console.log(`\n📦 ${tableName} 동기화 중...`);
  
  // 운영에서 데이터 가져오기
  const { data: prodData, error: fetchError } = await prodSupabase
    .from(tableName)
    .select('*');
  
  if (fetchError) {
    console.error(`  ❌ 조회 실패: ${fetchError.message}`);
    return;
  }
  
  if (!prodData || prodData.length === 0) {
    console.log(`  ⚠️ 데이터 없음`);
    return;
  }
  
  console.log(`  📊 ${prodData.length}건 조회`);
  
  // 로컬 데이터 삭제
  const { error: deleteError } = await localSupabase
    .from(tableName)
    .delete()
    .gte('id', 0);
  
  if (deleteError) {
    console.error(`  ❌ 삭제 실패: ${deleteError.message}`);
  }
  
  // 로컬에 삽입
  const { error: insertError } = await localSupabase
    .from(tableName)
    .insert(prodData);
  
  if (insertError) {
    console.error(`  ❌ 삽입 실패: ${insertError.message}`);
    return;
  }
  
  console.log(`  ✅ ${prodData.length}건 동기화 완료`);
}

async function main() {
  console.log('🔄 운영 DB → 로컬 Supabase 동기화 시작\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const tables = ['articles', 'opinions', 'ceo_reports', 'banners'];
  
  for (const table of tables) {
    await syncTable(table);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 동기화 완료!\n');
}

main().catch(console.error);
