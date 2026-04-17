// TODO: Replace with real Supabase credentials from environment variables
// NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key';

// TODO: Enable real client when credentials are provided
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock-safe client — will silently fail on queries until real credentials are set
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type Database = {
  // TODO: Generate types with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID
  public: {
    Tables: {
      staff: { Row: Record<string, unknown> };
      attendance_records: { Row: Record<string, unknown> };
      tasks: { Row: Record<string, unknown> };
      schedule_slots: { Row: Record<string, unknown> };
      notifications: { Row: Record<string, unknown> };
    };
  };
};
