// ============================================================
// Types & Interfaces — AI Zavuch / School Management Platform
// All entities are ready for Supabase integration
// ============================================================

export type StaffRole =
  | 'principal'
  | 'vice_principal'
  | 'teacher'
  | 'teacher_assistant'
  | 'counselor'
  | 'librarian'
  | 'nurse'
  | 'administrator';

export type StaffStatus = 'active' | 'on_leave' | 'absent' | 'substitute';

export interface Staff {
  id: string;
  full_name: string;
  role: StaffRole;
  subject?: string;
  qualification: 'first' | 'highest' | 'without_category';
  phone: string;
  email?: string;
  telegram_id?: string;
  availability: 'available' | 'busy' | 'absent';
  status: StaffStatus;
  avatar_url?: string;
  hire_date: string;
  notes?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'sick' | 'excused';

export interface AttendanceRecord {
  id: string;
  class_name: string;
  grade: number;
  letter: string;
  teacher_id: string;
  teacher_name: string;
  total_students: number;
  present: number;
  absent: number;
  sick: number;
  excused: number;
  raw_message: string;
  parsed_at: string;
  status: 'parsed' | 'pending' | 'error';
  confidence: number; // 0-100
  date: string;
}

export interface CanteenReport {
  id: string;
  date: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  portions_needed: number;
  generated_at: string;
  sent_at?: string;
  status: 'draft' | 'sent' | 'confirmed';
}

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'new' | 'in_progress' | 'waiting' | 'done';
export type TaskSource = 'voice' | 'message' | 'manual' | 'ai_generated';

export interface Task {
  id: string;
  title: string;
  description: string;
  source: TaskSource;
  source_message?: string;
  priority: TaskPriority;
  assignee_id?: string;
  assignee_name?: string;
  deadline?: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  tags?: string[];
  ai_confidence?: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  source_message: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee_id?: string;
  assignee_name?: string;
  room?: string;
  detected_at: string;
  resolved_at?: string;
  tasks: string[]; // task IDs
}

export interface LessonSlot {
  id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  period: number; // 1-8
  start_time: string;
  end_time: string;
  subject: string;
  teacher_id: string;
  teacher_name: string;
  class_name: string;
  room: string;
  status: 'normal' | 'substituted' | 'cancelled' | 'rescheduled';
  substitute_teacher_id?: string;
  substitute_teacher_name?: string;
}

export interface WeeklySchedule {
  class_name: string;
  slots: LessonSlot[];
}

export interface SubstitutionRequest {
  id: string;
  absent_teacher_id: string;
  absent_teacher_name: string;
  date: string;
  affected_slots: LessonSlot[];
  recommended_substitute_id?: string;
  recommended_substitute_name?: string;
  status: 'pending' | 'applied' | 'rejected';
  ai_recommendation?: string;
  qualification_match: number; // 0-100
  created_at: string;
}

export interface VoiceTranscription {
  id: string;
  audio_url?: string;
  transcript: string;
  language: string;
  duration_seconds: number;
  created_at: string;
  parsed_tasks: ParsedTask[];
  status: 'processing' | 'parsed' | 'error';
}

export interface ParsedTask {
  title: string;
  assignee_name?: string;
  assignee_id?: string;
  deadline?: string;
  priority: TaskPriority;
  description?: string;
  confidence: number;
}

export interface RegulatoryDocument {
  id: string;
  order_number: string;
  title: string;
  description: string;
  uploaded_at: string;
  indexed_at?: string;
  status: 'uploaded' | 'indexing' | 'indexed' | 'error';
  file_url?: string;
  chunk_count?: number;
  category: 'federal' | 'regional' | 'school';
}

export interface RAGQuery {
  id: string;
  question: string;
  answer?: string;
  documents_used: string[];
  created_at: string;
  status: 'processing' | 'done' | 'error';
  compliance_check?: ComplianceResult;
}

export interface ComplianceResult {
  is_compliant: boolean;
  risk_level: 'none' | 'low' | 'medium' | 'high';
  checklist: ChecklistItem[];
  notes: string;
}

export interface ChecklistItem {
  item: string;
  status: 'done' | 'pending' | 'failed';
}

export type NotificationType =
  | 'attendance_parsed'
  | 'task_assigned'
  | 'substitution_created'
  | 'incident_detected'
  | 'canteen_report_sent'
  | 'compliance_warning'
  | 'voice_task_created'
  | 'rag_query_done'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  priority: 'info' | 'warning' | 'success' | 'error';
  action_url?: string;
  metadata?: Record<string, unknown>;
}

export interface TelegramMessage {
  id: string;
  from_name: string;
  from_class?: string;
  message: string;
  sent_at: string;
  type: 'attendance' | 'incident' | 'request' | 'general';
  processed: boolean;
}

export interface DashboardKPI {
  total_students: number;
  present_today: number;
  absent_today: number;
  active_incidents: number;
  tasks_in_progress: number;
  substitutions_today: number;
  unread_notifications: number;
  canteen_portions: number;
  attendance_rate: number;
}

export interface AIEvent {
  id: string;
  type: 'task_created' | 'substitution_suggested' | 'attendance_parsed' | 'compliance_checked' | 'voice_parsed';
  description: string;
  confidence?: number;
  created_at: string;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'supabase' | 'telegram' | 'openai' | 'claude' | 'stt' | 'rag' | 'calendar' | 'push';
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  last_synced?: string;
  config?: Record<string, string>;
}
