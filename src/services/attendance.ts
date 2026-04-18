import { mockAttendanceRecords, mockCanteenReport } from '@/data';
import type { AttendanceRecord, CanteenReport } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const getAttendanceOverview = async (): Promise<AttendanceRecord[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          absent_students (
            student_name,
            reason
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Мапим данные из Supabase в наш интерфейс
        return data.map((row: any) => ({
          id: row.id,
          class_name: row.class_name,
          grade: parseInt(row.class_name) || 0,
          letter: row.class_name.replace(/[0-9]/g, ''),
          teacher_id: '',
          teacher_name: row.teacher_name || 'Неизвестно',
          total_students: row.total_students,
          present: row.present_count,
          absent: row.absent_count,
          sick: 0,
          excused: 0,
          absent_students: row.absent_students?.map((s: any) => ({
            name: s.student_name,
            reason: s.reason
          })) || [],
          raw_message: '',
          parsed_at: row.created_at,
          status: row.report_status as any,
          confidence: 100,
          date: new Date(row.created_at).toISOString().split('T')[0],
          received_from: row.source,
          received_at: row.reported_at,
        }));
      }
    } catch (error) {
      console.error('Error fetching attendance from Supabase:', error);
    }
  }

  // Fallback to mock data only if Supabase NOT configured
  if (!isSupabaseConfigured()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockAttendanceRecords);
      }, 500);
    });
  }

  return [];
};

export const getAttendanceClassDetails = async (classId: string): Promise<AttendanceRecord | undefined> => {
  // В MVP загружаем все и фильтруем (для упрощения)
  const all = await getAttendanceOverview();
  return all.find((r) => r.id === classId);
};

export const getCanteenReport = async (): Promise<CanteenReport> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCanteenReport);
    }, 400);
  });
};
