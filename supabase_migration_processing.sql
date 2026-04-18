-- ==========================================
-- МИГРАЦИЯ: Добавление полей для обработки сообщений (FINAL)
-- ==========================================
-- Запусти этот SQL в Supabase SQL Editor.
-- Добавляет поля для pipeline обработки сообщений.
-- ==========================================

-- 1. Поля для telegram_messages
DO $$
BEGIN
  -- confidence
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'telegram_messages' AND column_name = 'confidence') THEN
    ALTER TABLE telegram_messages ADD COLUMN confidence integer DEFAULT 0;
  END IF;
  
  -- processing_status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'telegram_messages' AND column_name = 'processing_status') THEN
    ALTER TABLE telegram_messages ADD COLUMN processing_status text DEFAULT 'received';
  END IF;

  -- parsed_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'telegram_messages' AND column_name = 'parsed_type') THEN
    ALTER TABLE telegram_messages ADD COLUMN parsed_type text;
  END IF;

  -- processed_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'telegram_messages' AND column_name = 'processed_at') THEN
    ALTER TABLE telegram_messages ADD COLUMN processed_at timestamp with time zone;
  END IF;

  -- linked_entity_type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'telegram_messages' AND column_name = 'linked_entity_type') THEN
    ALTER TABLE telegram_messages ADD COLUMN linked_entity_type text;
  END IF;

  -- linked_entity_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'telegram_messages' AND column_name = 'linked_entity_id') THEN
    ALTER TABLE telegram_messages ADD COLUMN linked_entity_id uuid;
  END IF;
END $$;

-- 2. Добавляем поля в attendance
DO $$
BEGIN
  -- source_message_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'source_message_id') THEN
    ALTER TABLE attendance ADD COLUMN source_message_id uuid;
  END IF;

  -- reason
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'reason') THEN
    ALTER TABLE attendance ADD COLUMN reason text;
  END IF;
END $$;

-- 3. Добавляем поля в incidents
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'incidents' AND column_name = 'source_message_id') THEN
    ALTER TABLE incidents ADD COLUMN source_message_id uuid;
  END IF;
END $$;

-- 4. Добавляем поля в tasks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'source_message_id') THEN
    ALTER TABLE tasks ADD COLUMN source_message_id uuid;
  END IF;
END $$;

-- 5. Создаём таблицу для отсутствий учителей
CREATE TABLE IF NOT EXISTS teacher_absences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_name text NOT NULL,
  reason text,
  absent_date date DEFAULT CURRENT_DATE, -- Дата отсутствия
  status text DEFAULT 'pending', -- 'pending', 'covered', 'resolved'
  source_message text, -- Сырой текст сообщения
  source_message_id uuid, -- ID сообщения из telegram_messages
  created_at timestamp with time zone DEFAULT now()
);

-- RLS для teacher_absences
ALTER TABLE teacher_absences ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'teacher_absences' AND policyname = 'Allow public read-write'
  ) THEN
    CREATE POLICY "Allow public read-write" ON teacher_absences FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Готово! Теперь таблицы поддерживают pipeline обработки.
