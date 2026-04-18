// ============================================================
// Process Telegram Messages — POST /api/process-messages
// ============================================================
// API route для ручного запуска обработки Telegram-сообщений.
// Вызывается кнопкой из dashboard или по cron.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { processUnreadMessages } from '@/services/telegram-message-processor.service';

export async function POST(request: NextRequest) {
  try {
    // Опционально: лимит из query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    console.log(`[API] 🚀 Запуск обработки сообщений (limit: ${limit})`);

    const result = await processUnreadMessages(limit);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[API] Ошибка обработки:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET для проверки статуса endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/process-messages',
    method: 'POST to process unread Telegram messages',
    timestamp: new Date().toISOString(),
  });
}
