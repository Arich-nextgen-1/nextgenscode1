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
  absent_students?: { name: string; reason?: string }[];
  raw_message: string;
  parsed_at: string;
  status: 'parsed' | 'pending' | 'error';
  confidence: number; // 0-100
  date: string;
  // Telegram source metadata
  received_from?: 'telegram' | 'manual';
  received_at?: string; // ISO timestamp of the original Telegram message
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
  source_channel?: 'telegram' | 'manual' | 'ai_parser';
  source_sender?: string;
  source_time?: string; // ISO timestamp
  priority: TaskPriority;
  status: TaskStatus;
  assignee_id?: string;
  assignee_name?: string;
  room?: string;
  detected_at: string;
  resolved_at?: string;
  tasks: string[]; // task IDs
  task_status?: 'auto_created' | 'pending_confirmation' | 'not_created' | 'assigned';
  task_assignee?: string;
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

export type NotificationType =
  | 'attendance_parsed'
  | 'task_assigned'
  | 'substitution_created'
  | 'incident_detected'
  | 'canteen_report_sent'
  | 'voice_task_created'
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

// Dashboard AI action feed item
export interface DashboardAIAction {
  id: string;
  icon: string; // emoji
  label: string;
  detail?: string;
  time: string;
  status: 'done' | 'pending';
}

// Substitution explanation for schedule page
export interface SubstitutionExplanation {
  substitution_id: string;
  substitute_name: string;
  reasons: { label: string; passed: boolean }[];
  qualification_match: number;
}

// Parsed voice task (for voice page result display)
export interface VoiceResultTask {
  id: string;
  title: string;
  assignee_name: string;
  deadline?: string;
  priority: TaskPriority;
  notificationSent: boolean;
  notificationChannel: 'telegram';
}

// Voice command parse result
export interface VoiceParsedResult {
  raw_command: string;
  parsed_at: string;
  tasks: VoiceResultTask[];
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
  type: 'task_created' | 'substitution_suggested' | 'attendance_parsed' | 'voice_parsed';
  description: string;
  confidence?: number;
  created_at: string;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'supabase' | 'telegram' | 'openai' | 'claude' | 'stt' | 'calendar' | 'push';
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  last_synced?: string;
  config?: Record<string, string>;
}

// ============================================================
// AI Zavuch Command Center types
// ============================================================

export type AIInsightSeverity = 'info' | 'warning' | 'critical';
export type AIActionStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AIInsight {
  id: string;
  icon: string; // emoji icon
  text: string;
  severity: AIInsightSeverity;
  created_at: string;
}

export interface AIAction {
  id: string;
  label: string;
  description: string;
}

export interface AIActivity {
  id: string;
  text: string;
  icon: string; // emoji icon
  time: string;
}
