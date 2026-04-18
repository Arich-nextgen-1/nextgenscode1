-- ==========================================
-- СХЕМА БАЗЫ ДАННЫХ ДЛЯ AI ZAVUCH (MVP)
-- ==========================================
-- Скопируй этот код и вставь в Supabase SQL Editor, затем нажми RUN.

-- 1. Сотрудники (Учителя, администрация)
CREATE TABLE IF NOT EXISTS staff (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  role text NOT NULL, -- 'teacher', 'admin', 'principal'
  subject text,
  qualification text,
  phone text,
  telegram_id text, -- Для привязки к Telegram боту
  status text DEFAULT 'active', -- 'active', 'sick', 'vacation'
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Отчеты по посещаемости (Сводка за день по классу)
CREATE TABLE IF NOT EXISTS attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name text NOT NULL,
  total_students integer NOT NULL,
  present_count integer NOT NULL,
  absent_count integer NOT NULL,
  report_status text DEFAULT 'parsed', -- 'parsed', 'pending', 'error'
  source text DEFAULT 'telegram', -- 'telegram', 'manual'
  reported_at timestamp with time zone, -- Когда пришло сообщение
  teacher_name text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Отсутствующие ученики (Детализация по посещаемости)
CREATE TABLE IF NOT EXISTS absent_students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  attendance_id uuid REFERENCES attendance(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  reason text, -- 'болезнь', 'справка' и т.д.
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Инциденты
CREATE TABLE IF NOT EXISTS incidents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  location text, -- Кабинет
  priority text DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status text DEFAULT 'in_progress', -- 'new', 'in_progress', 'resolved'
  source_message text,
  source_type text DEFAULT 'telegram', -- 'telegram', 'manual', 'ai_parser'
  source_sender text,
  source_time timestamp with time zone,
  assignee_name text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Задачи (Поручения, могут быть привязаны к инциденту)
CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id uuid REFERENCES incidents(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  assignee_name text,
  status text DEFAULT 'new', -- 'new', 'in_progress', 'waiting', 'done'
  priority text DEFAULT 'medium',
  due_date timestamp with time zone,
  source_type text DEFAULT 'ai_generated', -- 'manual', 'ai_generated', 'voice'
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Расписание уроков (База для замен)
CREATE TABLE IF NOT EXISTS schedule_lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week text NOT NULL, -- 'monday', 'tuesday', etc.
  lesson_number integer NOT NULL,
  class_name text NOT NULL,
  subject text NOT NULL,
  teacher_name text NOT NULL,
  room text,
  start_time text, -- '08:00'
  end_time text, -- '08:45'
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Замены (Связь с расписанием)
CREATE TABLE IF NOT EXISTS substitutions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid REFERENCES schedule_lessons(id) ON DELETE CASCADE,
  absent_teacher_name text NOT NULL,
  replacement_teacher_name text NOT NULL,
  reason text,
  status text DEFAULT 'pending', -- 'pending', 'applied', 'rejected'
  ai_explanation text, -- JSON или текст с причинами выбора
  created_at timestamp with time zone DEFAULT now()
);

-- 8. Все сообщения из Telegram (Сырые логи для парсера)
CREATE TABLE IF NOT EXISTS telegram_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name text NOT NULL,
  sender_role text,
  message_text text NOT NULL,
  message_type text DEFAULT 'general', -- 'attendance', 'incident', 'request', 'general'
  processed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 9. Логи работы AI (Для дебага и аналитики)
CREATE TABLE IF NOT EXISTS ai_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  module text NOT NULL, -- 'voice_parser', 'attendance_parser', 'substitution_engine'
  input_text text,
  output_json jsonb,
  status text DEFAULT 'success', -- 'success', 'error'
  created_at timestamp with time zone DEFAULT now()
);

-- Включаем RLS (Row Level Security) - для хакатона делаем всё публичным, чтобы не мучиться с политиками
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE absent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write" ON staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write" ON attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write" ON absent_students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write" ON incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write" ON schedule_lessons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write" ON substitutions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write" ON telegram_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write" ON ai_logs FOR ALL USING (true) WITH CHECK (true);
