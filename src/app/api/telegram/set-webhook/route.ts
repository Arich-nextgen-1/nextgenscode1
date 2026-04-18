// ============================================================
// Set Webhook — GET /api/telegram/set-webhook
// ============================================================
// Открой эту страницу в браузере, чтобы зарегистрировать webhook.
// Пример: https://твой-домен.com/api/telegram/set-webhook
//
// Это нужно сделать один раз после деплоя.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { setWebhook, deleteWebhook, getWebhookInfo } from '@/lib/telegram';

export async function GET(request: NextRequest) {
  try {
    // Проверяем, задан ли токен
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({
        error: 'TELEGRAM_BOT_TOKEN не задан в .env.local',
        help: 'Добавь TELEGRAM_BOT_TOKEN=<токен> в файл .env.local и перезапусти сервер.',
      }, { status: 500 });
    }

    // Определяем URL webhook
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({
        error: 'NEXT_PUBLIC_APP_URL не задан в .env.local',
        help: 'Добавь NEXT_PUBLIC_APP_URL=https://твой-домен.com в файл .env.local',
        note: 'Для локальной разработки используй ngrok: npx ngrok http 3000',
      }, { status: 500 });
    }

    const webhookUrl = `${appUrl}/api/telegram/webhook`;
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

    // Параметр ?action=delete — удаляет webhook
    const action = request.nextUrl.searchParams.get('action');
    if (action === 'delete') {
      await deleteWebhook();
      return NextResponse.json({
        success: true,
        message: 'Webhook удалён',
      });
    }

    // Параметр ?action=info — получает информацию о webhook
    if (action === 'info') {
      const info = await getWebhookInfo();
      return NextResponse.json(info);
    }

    // По умолчанию — устанавливаем webhook
    const result = await setWebhook(webhookUrl, secret);

    return NextResponse.json({
      success: true,
      message: 'Webhook установлен!',
      webhook_url: webhookUrl,
      result,
      next_steps: [
        'Теперь отправь сообщение боту в Telegram.',
        'Бот должен ответить подтверждением.',
        'Проверь логи сервера на наличие ошибок.',
      ],
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Ошибка установки webhook',
      details: error?.message || String(error),
    }, { status: 500 });
  }
}
