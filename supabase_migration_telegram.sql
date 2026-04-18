-- ==========================================
-- МИГРАЦИЯ: Расширение таблицы telegram_messages
-- ==========================================
-- Запусти этот SQL в Supabase SQL Editor ПОСЛЕ основной схемы.
-- Добавляет поля, которые нужны для работы Telegram-бота.
--
-- Если таблица telegram_messages УЖЕ создана — этот скрипт
-- добавит недостающие колонки. Если нет — пропустит.
-- ==========================================

-- Добавляем telegram_chat_id (ID чата в Telegram)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'telegram_messages' AND column_name = 'telegram_chat_id'
  ) THEN
    ALTER TABLE telegram_messages ADD COLUMN telegram_chat_id bigint;
  END IF;
END $$;

-- Добавляем telegram_user_id (ID пользователя в Telegram)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'telegram_messages' AND column_name = 'telegram_user_id'
  ) THEN
    ALTER TABLE telegram_messages ADD COLUMN telegram_user_id bigint;
  END IF;
END $$;

-- Добавляем confidence (уверенность классификации)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'telegram_messages' AND column_name = 'confidence'
  ) THEN
    ALTER TABLE telegram_messages ADD COLUMN confidence integer DEFAULT 0;
  END IF;
END $$;

-- Добавляем processing_status (статус обработки)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'telegram_messages' AND column_name = 'processing_status'
  ) THEN
    ALTER TABLE telegram_messages ADD COLUMN processing_status text DEFAULT 'received';
  END IF;
END $$;

-- Готово! Теперь таблица telegram_messages поддерживает все поля бота.
