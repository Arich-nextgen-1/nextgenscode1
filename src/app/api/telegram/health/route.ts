// ============================================================
// Health Check — GET /api/telegram/health
// ============================================================
// Быстрая проверка: все ли компоненты бота работают.
// Открой в браузере: http://localhost:3000/api/telegram/health
// ============================================================

import { NextResponse } from 'next/server';
import { isTelegramConfigured, getWebhookInfo } from '@/lib/telegram';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const checks = {
    telegram_token: isTelegramConfigured(),
    supabase: isSupabaseConfigured(),
    app_url: !!process.env.NEXT_PUBLIC_APP_URL,
    webhook_secret: !!process.env.TELEGRAM_WEBHOOK_SECRET,
  };

  const allOk = checks.telegram_token && checks.supabase;

  // Если Telegram настроен — проверяем webhook
  let webhookInfo = null;
  if (checks.telegram_token) {
    try {
      webhookInfo = await getWebhookInfo();
    } catch {
      webhookInfo = { error: 'Не удалось получить информацию о webhook' };
    }
  }

  return NextResponse.json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: {
      telegram_bot_token: checks.telegram_token ? '✅ Задан' : '❌ Не задан',
      supabase_connection: checks.supabase ? '✅ Подключен' : '❌ Не подключен',
      app_url: checks.app_url ? `✅ ${process.env.NEXT_PUBLIC_APP_URL}` : '❌ Не задан',
      webhook_secret: checks.webhook_secret ? '✅ Задан' : '⚠️ Не задан (опционально)',
    },
    webhook: webhookInfo,
    instructions: !allOk ? {
      message: 'Не все компоненты настроены. Проверь .env.local:',
      required: [
        'TELEGRAM_BOT_TOKEN=<токен от @BotFather>',
        'NEXT_PUBLIC_SUPABASE_URL=<url проекта Supabase>',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key из Supabase>',
      ],
      optional: [
        'SUPABASE_SERVICE_ROLE_KEY=<service role key из Supabase>',
        'TELEGRAM_WEBHOOK_SECRET=<любая секретная строка>',
        'NEXT_PUBLIC_APP_URL=<публичный URL приложения>',
      ],
    } : undefined,
  });
}
