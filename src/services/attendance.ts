// ============================================================
// Attendance Service
// TODO: Replace mock functions with Supabase queries
// TODO: Connect Telegram webhook to receive real messages
// ============================================================

import type { AttendanceRecord, CanteenReport } from '@/types';
import { mockAttendanceRecords, mockCanteenReport } from '@/data/attendance';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getAttendanceRecords(date?: string): Promise<AttendanceRecord[]> {
  await delay(300);
  // TODO: return supabase.from('attendance_records').select('*').eq('date', date)
  return mockAttendanceRecords;
}

export async function parseAttendanceMessage(message: string, teacherId: string): Promise<Partial<AttendanceRecord>> {
  await delay(800);
  // TODO: POST to /api/ai/parse-attendance with { message, teacherId }
  // TODO: This calls OpenAI/Claude to extract class, present, absent counts
  return {
    raw_message: message,
    status: 'parsed',
    confidence: 95,
    parsed_at: new Date().toISOString(),
  };
}

export async function getCanteenReport(date?: string): Promise<CanteenReport> {
  await delay(300);
  // TODO: return supabase.from('canteen_reports').select('*').eq('date', date).single()
  return mockCanteenReport;
}

export async function sendCanteenReport(reportId: string): Promise<void> {
  await delay(1000);
  // TODO: POST to /api/canteen/send with { reportId }
  // TODO: This sends via Telegram to canteen chat or email
  console.log('Canteen report sent:', reportId);
}

export async function generateCanteenReport(date: string): Promise<CanteenReport> {
  await delay(500);
  // TODO: POST to /api/canteen/generate with { date }
  return { ...mockCanteenReport, status: 'draft', generated_at: new Date().toISOString() };
}
