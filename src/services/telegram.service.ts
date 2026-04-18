// ============================================================
// Telegram Service — AI Zavuch
// ============================================================
// Бизнес-логика обработки Telegram-сообщений:
// 1. Сохраняет сообщение в Supabase
// 2. Классифицирует тип сообщения
// 3. Формирует ответ пользователю
//
// Обработка происходит в два этапа:
//   A. Webhook → быстрая классификация + сохранение raw message
//   B. /api/process-messages → полная обработка + создание записей
// ============================================================

import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendMessage } from '@/lib/telegram';
import { classifyAndExtract, getMessageTypeLabel } from '@/services/message-classifier.service';
import type { TelegramUpdate, BotResponse } from '@/types/telegram';

// ── Обработка входящего Update ──────────────────────────────

/**
 * Главная функция — обрабатывает входящий Telegram Update.
 * Вызывается из webhook route handler.
 */
export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;

  // Игнорируем обновления без текста (стикеры, фото и т.д.)
  if (!message || !message.text) {
    return;
  }

  const text = message.text.trim();
  const chatId = message.chat.id;
  const senderName = buildSenderName(message.from);

  // 1. Проверяем, является ли сообщение командой бота
  if (text.startsWith('/')) {
    await handleCommand(chatId, text, senderName);
    return;
  }

  // 2. Классифицируем сообщение (быстрая предварительная классификация)
  const classification = classifyAndExtract(text, senderName);

  // 3. Сохраняем в Supabase (raw message, processed = false)
  //    Полная обработка произойдёт через /api/process-messages
  await saveMessageToSupabase({
    sender_name: senderName,
    message_text: text,
    message_type: classification.type,
    confidence: classification.confidence,
    processed: false,
    processing_status: 'classified',
  });

  // 4. Формируем и отправляем ответ пользователю
  const response = buildResponse(classification.type, classification.confidence, text);
  await sendMessage(chatId, response.text, response.parseMode);
}

// ── Команды бота ────────────────────────────────────────────

async function handleCommand(chatId: number, text: string, senderName: string): Promise<void> {
  const command = text.split(' ')[0].toLowerCase();

  switch (command) {
    case '/start':
      await sendMessage(chatId, buildStartMessage(senderName));
      break;

    case '/help':
      await sendMessage(chatId, buildHelpMessage());
      break;

    case '/status':
      await sendMessage(chatId, await buildStatusMessage());
      break;

    default:
      await sendMessage(chatId, '❓ Неизвестная команда. Напишите /help для списка команд.');
      break;
  }
}

// ── Формирование ответов ────────────────────────────────────

function buildStartMessage(name: string): string {
  return [
    `👋 Здравствуйте, <b>${name}</b>!`,
    '',
    '🏫 Я — <b>AI Завуч</b>, цифровой помощник вашей школы.',
    '',
    'Я умею принимать и обрабатывать:',
    '📊 <b>Отчёты о посещаемости</b> — «1А - 25 детей, 2 болеют»',
    '🚨 <b>Инциденты</b> — «В кабинете 12 сломалась парта»',
    '🏥 <b>Отсутствие учителей</b> — «Сегодня меня не будет, заболел»',
    '📋 <b>Задачи и поручения</b> — «Айгерим, подготовь актовый зал»',
    '',
    'Просто пишите сообщение в свободной форме, я определю тип и сохраню данные.',
    '',
    '📝 /help — подробная справка',
    '📈 /status — состояние системы',
  ].join('\n');
}

function buildHelpMessage(): string {
  return [
    '📖 <b>Справка AI Завуч</b>',
    '',
    '<b>Как отправлять данные:</b>',
    '',
    '📊 <b>Посещаемость:</b>',
    '• «1А - 25 детей, 2 болеют»',
    '• «3В: 24, двое на справке»',
    '• «1Б — 22 из 24»',
    '',
    '🚨 <b>Инциденты:</b>',
    '• «В кабинете 12 сломалась парта»',
    '• «Разбито окно в спортзале»',
    '',
    '🏥 <b>Отсутствие:</b>',
    '• «Сегодня меня не будет, заболел»',
    '• «Дауренова Ботагоз заболела»',
    '',
    '📋 <b>Задачи:</b>',
    '• «Подготовь актовый зал до пятницы»',
    '• «Закажи воду и бейджи»',
    '',
    '<b>Команды:</b>',
    '/start — приветствие',
    '/help — эта справка',
    '/status — состояние системы',
    '',
    '💡 Все сообщения автоматически сохраняются и обрабатываются AI-системой.',
  ].join('\n');
}

async function buildStatusMessage(): Promise<string> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return [
      '📈 <b>Статус AI Завуч</b>',
      '',
      '✅ Telegram Bot — активен',
      '⚠️ База данных — не подключена',
      '⏳ AI Parser — ожидает подключения',
      '',
      '🔧 Система работает в режиме приёма сообщений.',
    ].join('\n');
  }

  // Считаем сообщения за сегодня
  const today = new Date().toISOString().split('T')[0];
  const { count: totalCount } = await supabase
    .from('telegram_messages')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00`);

  const { count: processedCount } = await supabase
    .from('telegram_messages')
    .select('*', { count: 'exact', head: true })
    .eq('processed', true)
    .gte('created_at', `${today}T00:00:00`);

  return [
    '📈 <b>Статус AI Завуч</b>',
    '',
    '✅ Telegram Bot — активен',
    '✅ База данных — подключена',
    '✅ Message Parser — активен',
    '',
    `📬 Сообщений за сегодня: <b>${totalCount || 0}</b>`,
    `✅ Обработано: <b>${processedCount || 0}</b>`,
    `⏳ Ожидают обработки: <b>${(totalCount || 0) - (processedCount || 0)}</b>`,
    '',
    '🔧 Система работает штатно.',
  ].join('\n');
}

function buildResponse(
  type: string,
  confidence: number,
  _originalText: string
): BotResponse {
  const typeLabel = getMessageTypeLabel(type as any);

  const responses: Record<string, string> = {
    attendance: [
      '✅ <b>Отчёт о посещаемости принят</b>',
      '',
      `📊 Тип: ${typeLabel}`,
      `🎯 Уверенность: ${confidence}%`,
      '',
      '📝 Данные сохранены и будут обработаны AI-системой.',
    ].join('\n'),

    incident: [
      '🚨 <b>Инцидент зафиксирован</b>',
      '',
      `📊 Тип: ${typeLabel}`,
      `🎯 Уверенность: ${confidence}%`,
      '',
      '⚡ Информация передана администрации. Задача будет создана автоматически.',
    ].join('\n'),

    teacher_absence: [
      '🏥 <b>Отсутствие принято</b>',
      '',
      `📊 Тип: ${typeLabel}`,
      `🎯 Уверенность: ${confidence}%`,
      '',
      '🔁 Система подберёт замену автоматически.',
    ].join('\n'),

    task_request: [
      '📋 <b>Запрос принят</b>',
      '',
      `📊 Тип: ${typeLabel}`,
      `🎯 Уверенность: ${confidence}%`,
      '',
      '✅ Задача будет создана и назначена ответственному.',
    ].join('\n'),

    unknown: [
      '💬 <b>Сообщение сохранено</b>',
      '',
      '📊 Тип сообщения не определён автоматически.',
      '',
      '📝 Сообщение сохранено и будет обработано позднее.',
      '💡 Попробуйте /help для примеров формата.',
    ].join('\n'),
  };

  return {
    text: responses[type] || responses.unknown,
    parseMode: 'HTML',
  };
}

// ── Сохранение в Supabase ───────────────────────────────────

async function saveMessageToSupabase(
  record: {
    sender_name: string;
    message_text: string;
    message_type: string;
    confidence: number;
    processed: boolean;
    processing_status: string;
    sender_role?: string;
  }
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.log('[Telegram Bot] Supabase не настроен, пропускаем сохранение:', record.message_text.slice(0, 50));
    return;
  }

  try {
    const { error } = await supabase.from('telegram_messages').insert({
      sender_name: record.sender_name,
      sender_role: record.sender_role || null,
      message_text: record.message_text,
      message_type: record.message_type,
      confidence: record.confidence,
      processed: record.processed,
      processing_status: record.processing_status,
    });

    if (error) {
      console.error('[Telegram Bot] Ошибка записи в Supabase:', error.message);
    } else {
      console.log('[Telegram Bot] Сообщение сохранено:', record.message_type, record.sender_name);
    }
  } catch (err) {
    console.error('[Telegram Bot] Ошибка при записи:', err);
  }
}

// ── Утилиты ────────────────────────────────────────────────

function buildSenderName(from?: { first_name: string; last_name?: string }): string {
  if (!from) return 'Неизвестный';
  return [from.first_name, from.last_name].filter(Boolean).join(' ');
}
