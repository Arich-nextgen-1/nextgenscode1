// ============================================================
// Telegram Bot API — низкоуровневая обёртка
// ============================================================
// Отправляет HTTP-запросы к Telegram Bot API.
// Не знает про Supabase, не знает про бизнес-логику.
// Просто отправляет сообщения и устанавливает webhook.

const TELEGRAM_API = 'https://api.telegram.org';

/**
 * Получает токен бота из переменных окружения.
 * Если токен не задан — кидает ошибку.
 */
function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error(
      'TELEGRAM_BOT_TOKEN не задан. Добавь его в .env.local'
    );
  }
  return token;
}

/**
 * Вызывает любой метод Telegram Bot API.
 * Пример: callTelegramAPI('sendMessage', { chat_id: 123, text: 'Привет' })
 */
async function callTelegramAPI(method: string, body: Record<string, unknown>) {
  const token = getBotToken();
  const url = `${TELEGRAM_API}/bot${token}/${method}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!data.ok) {
    console.error(`Telegram API error [${method}]:`, data);
    throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
  }

  return data.result;
}

/**
 * Отправляет текстовое сообщение в чат.
 */
export async function sendMessage(
  chatId: number,
  text: string,
  parseMode?: 'HTML' | 'MarkdownV2'
) {
  return callTelegramAPI('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: parseMode || 'HTML',
  });
}

/**
 * Устанавливает webhook URL для бота.
 * Telegram будет отправлять все обновления на этот URL.
 */
export async function setWebhook(webhookUrl: string, secret?: string) {
  const body: Record<string, unknown> = { url: webhookUrl };
  if (secret) {
    body.secret_token = secret;
  }
  return callTelegramAPI('setWebhook', body);
}

/**
 * Удаляет текущий webhook (полезно для отладки).
 */
export async function deleteWebhook() {
  return callTelegramAPI('deleteWebhook', { drop_pending_updates: true });
}

/**
 * Получает информацию о текущем webhook.
 */
export async function getWebhookInfo() {
  const token = getBotToken();
  const url = `${TELEGRAM_API}/bot${token}/getWebhookInfo`;
  const response = await fetch(url);
  return response.json();
}

/**
 * Проверяет, настроен ли токен бота.
 */
export function isTelegramConfigured(): boolean {
  return !!process.env.TELEGRAM_BOT_TOKEN;
}
