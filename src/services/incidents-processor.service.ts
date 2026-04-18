// ============================================================
// Incidents Processor Service (Server-side) — AI Zavuch
// ============================================================
// Создаёт записи в incidents из распарсенных Telegram-сообщений.
// ============================================================

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { IncidentExtracted } from './message-classifier.service';

export interface CreateIncidentResult {
  success: boolean;
  incident_id?: string;
  error?: string;
}

/**
 * Создаёт запись в incidents из извлечённых данных.
 */
export async function createIncidentFromMessage(
  data: IncidentExtracted,
  senderName: string,
  originalText: string,
  messageId: string,
  messageTime: string
): Promise<CreateIncidentResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { success: false, error: 'Supabase не настроен' };
  }

  try {
    const { data: row, error } = await supabase
      .from('incidents')
      .insert({
        title: data.title,
        description: data.description,
        location: data.location || null,
        priority: data.priority,
        status: 'new',
        source_message: originalText,
        source_type: 'telegram',
        source_sender: senderName,
        source_time: messageTime,
        source_message_id: messageId,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Incidents] ❌ Ошибка создания:', error.message, error.details, error.hint);
      return { success: false, error: error.message };
    }

    console.log(`[Incidents] ✅ Создано: ${data.title}`);
    return { success: true, incident_id: row.id };
  } catch (err: any) {
    console.error('[Incidents] Exception:', err);
    return { success: false, error: err.message };
  }
}
