import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Инициализируем клиента только если заданы переменные окружения
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Вспомогательная функция для проверки подключения
export const isSupabaseConfigured = () => {
  return supabase !== null
}
