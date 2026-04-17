import { mockScheduleSlots, mockSubstitutionRequest } from '@/data';
import type { LessonSlot, SubstitutionRequest } from '@/types';

// TODO: Replace with actual Supabase/API calls later
export const getScheduleForDay = async (day: string): Promise<LessonSlot[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const slots = mockScheduleSlots.filter((s) => s.day === day);
      resolve(slots);
    }, 500); // Simulate network latency
  });
};

export const getAllScheduleSlots = async (): Promise<LessonSlot[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockScheduleSlots);
    }, 500);
  });
};

export const getSubstitutions = async (): Promise<SubstitutionRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([mockSubstitutionRequest]);
    }, 400);
  });
};
