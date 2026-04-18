import { mockScheduleSlots, mockSubstitutionRequest } from '@/data';
import type { LessonSlot, SubstitutionRequest } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const getScheduleForDay = async (day: string): Promise<LessonSlot[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('schedule_lessons')
        .select('*')
        .eq('day_of_week', day);

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          day: row.day_of_week as any,
          period: row.lesson_number,
          start_time: row.start_time || '',
          end_time: row.end_time || '',
          subject: row.subject,
          teacher_id: '',
          teacher_name: row.teacher_name,
          class_name: row.class_name,
          room: row.room || '',
          status: 'normal', // We will update this later with substitutions if needed
        }));
      }
    } catch (error) {
      console.error('Error fetching schedule from Supabase:', error);
    }
  }

  // Fallback
  return new Promise((resolve) => {
    setTimeout(() => {
      const slots = mockScheduleSlots.filter((s) => s.day === day);
      resolve(slots);
    }, 500);
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
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('substitutions')
        .select(`
          *,
          schedule_lessons (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          absent_teacher_id: '',
          absent_teacher_name: row.absent_teacher_name,
          date: new Date(row.created_at).toISOString().split('T')[0],
          affected_slots: row.schedule_lessons ? [{
            id: row.schedule_lessons.id,
            day: row.schedule_lessons.day_of_week as any,
            period: row.schedule_lessons.lesson_number,
            start_time: row.schedule_lessons.start_time || '',
            end_time: row.schedule_lessons.end_time || '',
            subject: row.schedule_lessons.subject,
            teacher_id: '',
            teacher_name: row.schedule_lessons.teacher_name,
            class_name: row.schedule_lessons.class_name,
            room: row.schedule_lessons.room || '',
            status: 'substituted'
          }] : [],
          recommended_substitute_id: '',
          recommended_substitute_name: row.replacement_teacher_name,
          status: row.status as any,
          ai_recommendation: row.ai_explanation || '',
          qualification_match: 90, // mock value or parse from JSON
          created_at: row.created_at,
        }));
      }
    } catch (error) {
      console.error('Error fetching substitutions from Supabase:', error);
    }
  }

  // Fallback
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([mockSubstitutionRequest]);
    }, 400);
  });
};
