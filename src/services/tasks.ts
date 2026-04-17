// ============================================================
// Tasks Service
// TODO: Replace mock functions with Supabase queries
// ============================================================

import type { Task, Incident, TaskStatus } from '@/types';
import { mockTasks, mockIncidents } from '@/data/tasks';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let _tasks = [...mockTasks];

export async function getTasks(): Promise<Task[]> {
  await delay(300);
  // TODO: return supabase.from('tasks').select('*, assignee:staff(full_name)').order('created_at', { ascending: false })
  return _tasks;
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
  await delay(400);
  // TODO: supabase.from('tasks').update({ status, updated_at: new Date() }).eq('id', taskId)
  _tasks = _tasks.map((t) => (t.id === taskId ? { ...t, status, updated_at: new Date().toISOString() } : t));
  return _tasks.find((t) => t.id === taskId)!;
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  await delay(500);
  // TODO: supabase.from('tasks').insert(task).select().single()
  const newTask: Task = {
    ...task,
    id: `t${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  _tasks = [newTask, ..._tasks];
  return newTask;
}

export async function getIncidents(): Promise<Incident[]> {
  await delay(300);
  // TODO: supabase.from('incidents').select('*').order('detected_at', { ascending: false })
  return mockIncidents;
}

export async function detectIncidentFromMessage(message: string): Promise<Incident | null> {
  await delay(800);
  // TODO: POST to /api/ai/detect-incident with { message }
  // TODO: AI classifies whether message contains incident, extracts details
  return null;
}
