// ============================================================
// Attendance Service (Server-side) — AI Zavuch
// ============================================================
// Создаёт записи в attendance из распарсенных Telegram-сообщений.
// ============================================================

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { AttendanceExtracted } from './message-classifier.service';

export interface CreateAttendanceResult {
  success: boolean;
  attendance_id?: string;
  error?: string;
}

/**
 * Создаёт запись в attendance из извлечённых данных.
 */
export async function createAttendanceFromMessage(
  data: AttendanceExtracted,
  senderName: string,
  messageId: string,
  messageTime: string
): Promise<CreateAttendanceResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { success: false, error: 'Supabase не настроен' };
  }

  if (!data.class_name) {
    return { success: false, error: 'Не удалось определить класс' };
  }

  const totalStudents = data.total_students || (data.present_count || 0) + (data.absent_count || 0);
  const presentCount = data.present_count || totalStudents - (data.absent_count || 0);
  const absentCount = data.absent_count || totalStudents - presentCount;

  try {
    const { data: row, error } = await supabase
      .from('attendance')
      .insert({
        class_name: data.class_name,
        total_students: totalStudents,
        present_count: presentCount,
        absent_count: absentCount,
        report_status: 'parsed',
        source: 'telegram',
        teacher_name: senderName,
        reported_at: messageTime,
        source_message_id: messageId,
        reason: data.reason || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Attendance] ❌ Ошибка создания:', error.message, error.details, error.hint);
      return { success: false, error: error.message };
    }

    console.log(`[Attendance] ✅ Создано: ${data.class_name} — ${presentCount}/${totalStudents}`);
    return { success: true, attendance_id: row.id };
  } catch (err: any) {
    console.error('[Attendance] Exception:', err);
    return { success: false, error: err.message };
  }
}
