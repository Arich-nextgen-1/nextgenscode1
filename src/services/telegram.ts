// ============================================================
// Telegram Service
// TODO: Connect to Telegram Bot API
// ============================================================
import type { TelegramMessage } from '@/types';
import { mockTelegramMessages } from '@/data/attendance';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getRecentMessages(): Promise<TelegramMessage[]> {
  await delay(300);
  // TODO: supabase.from('telegram_messages').select('*').order('sent_at', { ascending: false }).limit(20)
  return mockTelegramMessages;
}

export async function processMessage(messageId: string): Promise<void> {
  await delay(500);
  // TODO: supabase.from('telegram_messages').update({ processed: true }).eq('id', messageId)
  console.log('Message processed:', messageId);
}

export async function sendMessageToUser(telegramId: string, message: string): Promise<void> {
  await delay(500);
  // TODO: POST to Telegram Bot API: https://api.telegram.org/bot<token>/sendMessage
  console.log('Sent message to', telegramId, ':', message);
}
