// ============================================================
// Schedule Service
// TODO: Replace mock with Supabase and AI matching
// ============================================================
import type { LessonSlot, SubstitutionRequest } from '@/types';
import { mockScheduleSlots, mockSubstitutionRequest } from '@/data/schedule';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getScheduleSlots(day?: string, className?: string): Promise<LessonSlot[]> {
  await delay(300);
  // TODO: supabase.from('schedule_slots').select('*, teacher:staff(full_name)').eq('day', day)
  let slots = mockScheduleSlots;
  if (day) slots = slots.filter((s) => s.day === day);
  if (className) slots = slots.filter((s) => s.class_name === className);
  return slots;
}

export async function getSubstitutionRequests(): Promise<SubstitutionRequest[]> {
  await delay(300);
  // TODO: supabase.from('substitution_requests').select('*')
  return [mockSubstitutionRequest];
}

export async function applySubstitution(requestId: string): Promise<void> {
  await delay(600);
  // TODO: supabase.from('substitution_requests').update({ status: 'applied' }).eq('id', requestId)
  // TODO: Also update affected lesson_slots with substitute teacher
  // TODO: Notify substitute teacher via Telegram
  console.log('Substitution applied:', requestId);
}

export async function suggestSubstitute(absentTeacherId: string, date: string): Promise<SubstitutionRequest> {
  await delay(1200);
  // TODO: POST to /api/ai/suggest-substitute { absentTeacherId, date }
  // TODO: AI finds available teachers with matching qualification and free slots
  return mockSubstitutionRequest;
}
