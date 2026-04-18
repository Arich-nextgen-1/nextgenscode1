import { mockIncidents } from '@/data';
import type { Incident } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const getIncidents = async (): Promise<Incident[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      // Подтягиваем инциденты и связанные с ними задачи, чтобы показать task_status
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          tasks (
            id,
            status,
            assignee_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((row: any) => {
          const relatedTasks = row.tasks || [];
          const hasTasks = relatedTasks.length > 0;
          
          return {
            id: row.id,
            title: row.title,
            description: row.description || '',
            source_message: row.source_message || '',
            source_channel: row.source_type as any,
            source_sender: row.source_sender || '',
            source_time: row.source_time || row.created_at,
            priority: row.priority as any,
            status: row.status as any,
            assignee_name: row.assignee_name || '',
            room: row.location || '',
            detected_at: row.created_at,
            tasks: relatedTasks.map((t: any) => t.id),
            task_status: hasTasks ? 'auto_created' : 'not_created',
            task_assignee: hasTasks ? relatedTasks[0].assignee_name : '',
          };
        });
      }
    } catch (error) {
      console.error('Error fetching incidents from Supabase:', error);
    }
  }

  // Fallback to mock data only if NOT configured
  if (!isSupabaseConfigured()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockIncidents);
      }, 500);
    });
  }

  return [];
};

export const getIncidentById = async (id: string): Promise<Incident | undefined> => {
  const all = await getIncidents();
  return all.find((i) => i.id === id);
};
