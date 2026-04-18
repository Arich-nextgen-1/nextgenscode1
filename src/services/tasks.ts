// ============================================================
// Tasks Service
// ============================================================

import type { Task, Incident, TaskStatus } from '@/types';
import { mockTasks, mockIncidents } from '@/data/tasks';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let _tasks = [...mockTasks];

export async function getTasks(): Promise<Task[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description || '',
          status: row.status as TaskStatus,
          priority: row.priority as any,
          assignee_id: '',
          assignee_name: row.assignee_name || '',
          deadline: row.due_date || '',
          created_at: row.created_at,
          updated_at: row.created_at,
          source: (row.source_type || 'ai_auto') as any,
          created_by: '',
        }));
      }
    } catch (error) {
      console.error('Error fetching tasks from Supabase:', error);
    }
  }

  if (!isSupabaseConfigured()) {
    await delay(300);
    return _tasks;
  }

  return [];
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  if (isSupabaseConfigured() && supabase) {
    // try to update supabase
    // we won't throw error if it fails, just fallback to mock
    try {
       await supabase.from('tasks').update({ status }).eq('id', taskId);
    } catch (e) {
      console.error(e);
    }
  }

  await delay(400);
  _tasks = _tasks.map((t) => (t.id === taskId ? { ...t, status, updated_at: new Date().toISOString() } : t));
  return _tasks.find((t) => t.id === taskId)!;
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('tasks').insert({
        title: task.title,
        description: task.description,
        assignee_name: task.assignee_name,
        status: task.status,
        priority: task.priority,
      }).select().single();
      
      if (!error && data) {
        // Return db mapped task
        return {
           ...task,
           id: data.id,
           created_at: data.created_at,
           updated_at: data.created_at,
        };
      }
    } catch (e) {
       console.error(e);
    }
  }

  await delay(500);
  const newTask: Task = {
    ...task,
    id: `t${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  _tasks = [newTask, ..._tasks];
  return newTask;
}

// NOTE: Incidents fetching has been moved to src/services/incidents.ts for clarity,
// but keeping this for backward compatibility if components import from here.
export async function getIncidents(): Promise<Incident[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
         return data.map((row: any) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            priority: row.priority,
            status: row.status,
            assignee_name: row.assignee_name,
            detected_at: row.created_at,
            source_channel: row.source_type,
            source_message: row.source_message,
            tasks: [],
         }));
      }
    } catch (e) {}
  }
  if (!isSupabaseConfigured()) {
    await delay(300);
    return mockIncidents as any[];
  }

  return [];
}

export async function detectIncidentFromMessage(message: string): Promise<Incident | null> {
  await delay(800);
  // TODO: POST to /api/ai/detect-incident with { message }
  return null;
}
