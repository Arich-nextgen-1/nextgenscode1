// ============================================================
// Telegram Messages API — GET /api/telegram/messages
// ============================================================
// Возвращает Telegram-сообщения из Supabase для dashboard.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false, messages: [] });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const processedOnly = searchParams.get('processed') === 'true';

  try {
    let query = supabase
      .from('telegram_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (processedOnly) {
      query = query.eq('processed', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    const messages = (data || []).map((row: any) => ({
      id: row.id,
      from_name: row.sender_name || 'Неизвестный',
      message: row.message_text,
      sent_at: row.created_at,
      type: row.parsed_type || row.message_type || 'general',
      processed: row.processed || false,
      confidence: row.confidence || 0,
      processing_status: row.processing_status || 'received',
      linked_entity_type: row.linked_entity_type,
      linked_entity_id: row.linked_entity_id,
      processed_at: row.processed_at,
    }));

    return NextResponse.json({ ok: true, messages });
  } catch (error: any) {
    console.error('[Telegram Messages API] Error:', error);
    return NextResponse.json({ ok: false, messages: [], error: error.message });
  }
}
