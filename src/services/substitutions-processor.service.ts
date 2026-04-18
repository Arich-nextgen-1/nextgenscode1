// ============================================================
// Substitutions / Teacher Absence Processor — AI Zavuch
// ============================================================
// Создаёт записи для отсутствий учителей из Telegram-сообщений.
// ============================================================

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { TeacherAbsenceExtracted } from './message-classifier.service';

export interface CreateAbsenceResult {
  success: boolean;
  absence_id?: string;
  task_id?: string;
  error?: string;
}

/**
 * Создаёт запись об отсутствии учителя + задачу на поиск замены.
 */
export async function createTeacherAbsenceFromMessage(
  data: TeacherAbsenceExtracted,
  originalText: string,
  messageId: string
): Promise<CreateAbsenceResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { success: false, error: 'Supabase не настроен' };
  }

  const teacherName = data.teacher_name || 'Неизвестный учитель';

  try {
    // 1. Создаём запись об отсутствии
    const { data: absenceRow, error: absenceError } = await supabase
      .from('teacher_absences')
      .insert({
        teacher_name: teacherName,
        reason: data.reason || null,
        absent_date: data.date || new Date().toISOString().split('T')[0],
        status: 'pending',
        source_message: originalText,
        source_message_id: messageId,
      })
      .select('id')
      .single();

    if (absenceError) {
      console.error('[Substitutions] ❌ Ошибка создания отсутствия:', absenceError.message, absenceError.details, absenceError.hint);
      return { success: false, error: absenceError.message };
    }

    // 2. Автоматически создаём задачу на поиск замены
    const { data: taskRow, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: `Найти замену: ${teacherName}`,
        description: `Учитель ${teacherName} отсутствует${data.reason ? ` (${data.reason})` : ''}. Необходимо найти замену. Исходное сообщение: "${originalText}"`,
        status: 'new',
        priority: 'high',
        source_type: 'telegram',
        source_message_id: messageId,
      })
      .select('id')
      .single();

    if (taskError) {
      console.warn('[Substitutions] Задача не создана:', taskError.message);
    }

    console.log(`[Substitutions] ✅ Отсутствие: ${teacherName} (${data.reason || 'причина не указана'})`);

    return {
      success: true,
      absence_id: absenceRow.id,
      task_id: taskRow?.id,
    };
  } catch (err: any) {
    console.error('[Substitutions] Exception:', err);
    return { success: false, error: err.message };
  }
}
