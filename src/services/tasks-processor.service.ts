// ============================================================
// Tasks Processor Service (Server-side) — AI Zavuch
// ============================================================
// Создаёт записи в tasks из распарсенных Telegram-сообщений.
// ============================================================

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { TaskExtracted } from './message-classifier.service';

export interface CreateTasksResult {
  success: boolean;
  task_ids: string[];
  error?: string;
}

/**
 * Создаёт одну или несколько задач из извлечённых данных.
 */
export async function createTasksFromMessage(
  tasks: TaskExtracted[],
  senderName: string,
  originalText: string,
  messageId: string
): Promise<CreateTasksResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { success: false, task_ids: [], error: 'Supabase не настроен' };
  }

  const createdIds: string[] = [];

  for (const task of tasks) {
    try {
      // Формируем короткий заголовок из описания
      let title = task.task_description;
      if (title.length > 80) {
        title = title.slice(0, 77) + '...';
      }
      // Capitalize first letter
      title = title.charAt(0).toUpperCase() + title.slice(1);

      const { data: row, error } = await supabase
        .from('tasks')
        .insert({
          title,
          description: `Задача из Telegram: "${originalText}"`,
          assignee_name: task.assignee_name || null,
          status: 'new',
          priority: 'medium',
          source_type: 'telegram',
          source_message_id: messageId,
        })
        .select('id')
        .single();

      if (error) {
        console.error('[Tasks] ❌ Ошибка создания задачи:', error.message, error.details, error.hint);
        continue;
      }

      createdIds.push(row.id);
      console.log(`[Tasks] ✅ Создана задача: ${title}${task.assignee_name ? ` → ${task.assignee_name}` : ''}`);
    } catch (err: any) {
      console.error('[Tasks] Exception:', err);
    }
  }

  return {
    success: createdIds.length > 0,
    task_ids: createdIds,
    error: createdIds.length === 0 ? 'Не удалось создать ни одной задачи' : undefined,
  };
}
