// ============================================================
// Telegram Bot Types — AI Zavuch
// ============================================================

/** Типы сообщений, которые бот умеет распознавать */
export type MessageType =
  | 'attendance'       // "1А - 25 детей, 2 болеют"
  | 'incident'         // "В кабинете 12 сломалась парта"
  | 'teacher_absence'  // "Сегодня меня не будет, заболел"
  | 'task_request'     // "Айгерим, подготовь актовый зал"
  | 'unknown';         // Всё остальное

/** Результат классификации сообщения */
export interface ClassificationResult {
  type: MessageType;
  confidence: number;  // 0-100, насколько уверены в типе
  details?: string;    // Дополнительные данные (класс, кабинет и т.д.)
}

/** Запись в таблице telegram_messages в Supabase */
export interface TelegramMessageRecord {
  id?: string;
  telegram_chat_id: number;
  telegram_user_id: number;
  sender_name: string;
  sender_role?: string;
  message_text: string;
  message_type: MessageType;
  confidence: number;
  processed: boolean;
  processing_status: 'received' | 'classified' | 'processed' | 'error';
  created_at?: string;
}

/** Входящий Telegram Update (упрощенная версия) */
export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

/** Telegram Message (упрощенная версия) */
export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

/** Telegram User */
export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

/** Telegram Chat */
export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  first_name?: string;
  last_name?: string;
}

/** Ответ бота пользователю */
export interface BotResponse {
  text: string;
  parseMode?: 'HTML' | 'MarkdownV2';
}
