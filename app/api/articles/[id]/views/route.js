import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(request, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID 필요' }, { status: 400 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 조회수 1 증가 (RPC 사용)
    const { data, error } = await supabase.rpc('increment_views', { article_id: parseInt(id) });

    if (error) {
      // RPC 없으면 직접 업데이트
      const { data: article } = await supabase
        .from('articles')
        .select('views')
        .eq('id', id)
        .single();

      if (article) {
        await supabase
          .from('articles')
          .update({ views: (article.views || 0) + 1 })
          .eq('id', id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
