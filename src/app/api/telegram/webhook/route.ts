// ============================================================
// Telegram Webhook — POST /api/telegram/webhook
// ============================================================
// Этот endpoint принимает входящие сообщения от Telegram.
// Telegram сам отправляет сюда JSON с каждым новым сообщением.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramUpdate } from '@/services/telegram.service';
import type { TelegramUpdate } from '@/types/telegram';

export async function POST(request: NextRequest) {
  try {
    // 1. Проверяем секрет webhook (если задан)
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (webhookSecret) {
      const headerSecret = request.headers.get('x-telegram-bot-api-secret-token');
      if (headerSecret !== webhookSecret) {
        console.warn('[Webhook] Неверный секрет webhook');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 2. Парсим тело запроса
    const update: TelegramUpdate = await request.json();

    // 3. Обрабатываем в фоне (Telegram ждёт ответ быстро)
    //    Используем .catch() чтобы не блокировать ответ
    handleTelegramUpdate(update).catch((err) => {
      console.error('[Webhook] Ошибка обработки:', err);
    });

    // 4. Сразу отвечаем Telegram что всё ок
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Webhook] Ошибка парсинга:', error);
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}

// Telegram иногда делает GET для проверки — отвечаем что endpoint жив
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'AI Zavuch Telegram Webhook is running',
    timestamp: new Date().toISOString(),
  });
}
