import { createClient } from '@supabase/supabase-js';

/**
 * Создаёт экземпляр Supabase клиента с правами администратора (Service Role Key).
 * Используется только на стороне сервера.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
  }

  if (!key) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is missing, falling back to ANON_KEY. This may cause RLS issues.');
    return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
