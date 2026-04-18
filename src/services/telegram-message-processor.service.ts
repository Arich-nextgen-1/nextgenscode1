// ============================================================
// Telegram Message Processor — AI Zavuch
// ============================================================
// Главный orchestrator для обработки Telegram-сообщений.
//
// Pipeline:
// 1. Забрать необработанные сообщения из telegram_messages
// 2. Классифицировать каждое
// 3. Извлечь структурированные данные
// 4. Создать записи в нужных таблицах
// 5. Обновить статус исходного сообщения
// ============================================================

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { classifyAndExtract } from './message-classifier.service';
import { createAttendanceFromMessage } from './attendance-processor.service';
import { createIncidentFromMessage } from './incidents-processor.service';
import { createTasksFromMessage } from './tasks-processor.service';
import { createTeacherAbsenceFromMessage } from './substitutions-processor.service';

// ── Результат обработки ─────────────────────────────────────

export interface ProcessingResult {
  message_id: string;
  sender_name: string;
  original_text: string;
  parsed_type: string;
  confidence: number;
  linked_entity_type?: string;
  linked_entity_id?: string;
  success: boolean;
  error?: string;
}

export interface BatchProcessingResult {
  total_messages: number;
  processed: number;
  results: ProcessingResult[];
  stats: {
    attendance: number;
    incidents: number;
    tasks: number;
    teacher_absences: number;
    unknown: number;
    errors: number;
  };
}

// ── Главная функция обработки ───────────────────────────────

/**
 * Обрабатывает все необработанные Telegram-сообщения.
 * Вызывается из API route или cron-задачи.
 */
export async function processUnreadMessages(
  limit: number = 50
): Promise<BatchProcessingResult> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      total_messages: 0,
      processed: 0,
      results: [],
      stats: { attendance: 0, incidents: 0, tasks: 0, teacher_absences: 0, unknown: 0, errors: 0 },
    };
  }

  // 1. Забираем необработанные сообщения
  const { data: messages, error: fetchError } = await supabase
    .from('telegram_messages')
    .select('*')
    .eq('processed', false)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (fetchError) {
    console.error('[Processor] Ошибка загрузки сообщений:', fetchError.message);
    return {
      total_messages: 0,
      processed: 0,
      results: [],
      stats: { attendance: 0, incidents: 0, tasks: 0, teacher_absences: 0, unknown: 0, errors: 0 },
    };
  }

  if (!messages || messages.length === 0) {
    console.log('[Processor] Нет новых сообщений для обработки');
    return {
      total_messages: 0,
      processed: 0,
      results: [],
      stats: { attendance: 0, incidents: 0, tasks: 0, teacher_absences: 0, unknown: 0, errors: 0 },
    };
  }

  console.log(`[Processor] 📬 Найдено ${messages.length} необработанных сообщений`);

  const results: ProcessingResult[] = [];
  const stats = { attendance: 0, incidents: 0, tasks: 0, teacher_absences: 0, unknown: 0, errors: 0 };

  // 2. Обрабатываем каждое сообщение
  for (const msg of messages) {
    const result = await processSingleMessage(supabase, msg);
    results.push(result);

    if (!result.success) {
      stats.errors++;
    } else {
      switch (result.parsed_type) {
        case 'attendance':
          stats.attendance++;
          break;
        case 'incident':
          stats.incidents++;
          break;
        case 'task_request':
          stats.tasks++;
          break;
        case 'teacher_absence':
          stats.teacher_absences++;
          break;
        default:
          stats.unknown++;
      }
    }
  }

  console.log('[Processor] ✅ Обработка завершена:', {
    total: messages.length,
    ...stats,
  });

  return {
    total_messages: messages.length,
    processed: results.filter((r) => r.success).length,
    results,
    stats,
  };
}

// ── Обработка одного сообщения ──────────────────────────────

async function processSingleMessage(
  supabase: any,
  msg: any
): Promise<ProcessingResult> {
  const messageId = msg.id;
  const senderName = msg.sender_name || 'Неизвестный';
  const messageText = msg.message_text || '';
  const messageTime = msg.created_at || new Date().toISOString();

  const baseResult: ProcessingResult = {
    message_id: messageId,
    sender_name: senderName,
    original_text: messageText,
    parsed_type: 'unknown',
    confidence: 0,
    success: false,
  };

  // Пропускаем команды бота
  if (messageText.startsWith('/')) {
    await markAsProcessed(supabase, messageId, 'command', 'processed');
    return { ...baseResult, parsed_type: 'command', success: true };
  }

  try {
    // 1. Классифицируем и извлекаем данные
    const extraction = classifyAndExtract(messageText, senderName);

    baseResult.parsed_type = extraction.type;
    baseResult.confidence = extraction.confidence;

    // 2. Создаём записи в зависимости от типа
    let entityType: string | undefined;
    let entityId: string | undefined;

    switch (extraction.type) {
      case 'attendance': {
        if (extraction.attendance) {
          const result = await createAttendanceFromMessage(
            extraction.attendance,
            senderName,
            messageId,
            messageTime
          );
          if (result.success) {
            entityType = 'attendance';
            entityId = result.attendance_id;
          } else {
            baseResult.error = result.error;
          }
        }
        break;
      }

      case 'incident': {
        if (extraction.incident) {
          const result = await createIncidentFromMessage(
            extraction.incident,
            senderName,
            messageText,
            messageId,
            messageTime
          );
          if (result.success) {
            entityType = 'incident';
            entityId = result.incident_id;
          } else {
            baseResult.error = result.error;
          }
        }
        break;
      }

      case 'task_request': {
        if (extraction.tasks && extraction.tasks.length > 0) {
          const result = await createTasksFromMessage(
            extraction.tasks,
            senderName,
            messageText,
            messageId
          );
          if (result.success) {
            entityType = 'task';
            entityId = result.task_ids[0]; // Первая задача как основная
          } else {
            baseResult.error = result.error;
          }
        }
        break;
      }

      case 'teacher_absence': {
        if (extraction.teacher_absence) {
          const result = await createTeacherAbsenceFromMessage(
            extraction.teacher_absence,
            messageText,
            messageId
          );
          if (result.success) {
            entityType = 'teacher_absence';
            entityId = result.absence_id;
          } else {
            baseResult.error = result.error;
          }
        }
        break;
      }

      default: {
        // unknown — просто помечаем
        entityType = undefined;
        entityId = undefined;
      }
    }

    // 3. Обновляем исходное сообщение
    const isProcessedSuccessfully = !!entityId || extraction.type === 'unknown';
    const processingStatus = entityId ? 'processed' : (extraction.type === 'unknown' ? 'pending_manual_review' : 'error');
    
    await markAsProcessed(
      supabase,
      messageId,
      extraction.type,
      processingStatus,
      extraction.confidence,
      entityType,
      entityId
    );

    baseResult.linked_entity_type = entityType;
    baseResult.linked_entity_id = entityId;
    baseResult.success = isProcessedSuccessfully;

    return baseResult;
  } catch (err: any) {
    console.error(`[Processor] Ошибка обработки сообщения ${messageId}:`, err);

    await markAsProcessed(supabase, messageId, 'unknown', 'error');

    return {
      ...baseResult,
      success: false,
      error: err.message,
    };
  }
}

// ── Утилита: пометить как обработанное ──────────────────────

async function markAsProcessed(
  supabase: any,
  messageId: string,
  parsedType: string,
  processingStatus: string,
  confidence?: number,
  linkedEntityType?: string,
  linkedEntityId?: string
): Promise<void> {
  const updateData: any = {
    processed: true,
    parsed_type: parsedType,
    processing_status: processingStatus,
    processed_at: new Date().toISOString(),
    message_type: parsedType,
  };

  if (confidence !== undefined) {
    updateData.confidence = confidence;
  }
  if (linkedEntityType) {
    updateData.linked_entity_type = linkedEntityType;
  }
  if (linkedEntityId) {
    updateData.linked_entity_id = linkedEntityId;
  }

  const { error } = await supabase
    .from('telegram_messages')
    .update(updateData)
    .eq('id', messageId);

  if (error) {
    console.error(`[Processor] ❌ Ошибка обновления статуса сообщения ${messageId}:`, error.message, error.details, error.hint);
  } else {
    console.log(`[Processor] ✅ Статус сообщения ${messageId} обновлен на ${processingStatus}`);
  }
}
