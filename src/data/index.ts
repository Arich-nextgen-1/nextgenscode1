import type { Notification, AIEvent, DashboardKPI, IntegrationConfig, VoiceTranscription } from '@/types';

export * from './staff';
export * from './attendance';
export * from './tasks';
export * from './schedule';

export const mockKPI: DashboardKPI = {
  total_students: 196,
  present_today: 160,
  absent_today: 11,
  active_incidents: 2,
  tasks_in_progress: 3,
  substitutions_today: 1,
  unread_notifications: 6,
  canteen_portions: 160,
  attendance_rate: 93.6,
};

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'incident_detected',
    title: 'Инцидент: сломана парта',
    message: 'AI обнаружил инцидент в кабинете 12. Задача создана и назначена Нурболу Касымову.',
    created_at: new Date(Date.now() - 900000).toISOString(),
    read: false,
    priority: 'warning',
    action_url: '/tasks',
  },
  {
    id: 'n2',
    type: 'substitution_created',
    title: 'Замена: Ботагоз Дауренова',
    message: 'AI подобрал замену: Данияр Бекович. Соответствие квалификации 92%. Замена применена.',
    created_at: new Date(Date.now() - 600000).toISOString(),
    read: false,
    priority: 'warning',
    action_url: '/schedule',
  },
  {
    id: 'n3',
    type: 'attendance_parsed',
    title: 'Посещаемость обработана: 7/8 классов',
    message: 'AI разобрал сообщения учителей. Присутствуют 160 учеников. 2А не отчиталась.',
    created_at: new Date(Date.now() - 300000).toISOString(),
    read: false,
    priority: 'info',
    action_url: '/attendance',
  },
  {
    id: 'n4',
    type: 'voice_task_created',
    title: 'Голосовые задачи созданы',
    message: '2 задачи извлечены из голосового сообщения: зал для Айгерим, заказ для Назкен.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    read: true,
    priority: 'success',
    action_url: '/voice',
  },
  {
    id: 'n6',
    type: 'canteen_report_sent',
    title: 'Отчет для столовой готов',
    message: 'Собран отчет: 160 порций на сегодня. Ожидает отправки.',
    created_at: new Date(Date.now() - 60000).toISOString(),
    read: false,
    priority: 'success',
    action_url: '/attendance',
  },
  {
    id: 'n7',
    type: 'task_assigned',
    title: 'Новая задача: журнал за март',
    message: 'Задача "Обновить журнал посещаемости за март" назначена Нурболу Касымову.',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    read: true,
    priority: 'info',
    action_url: '/tasks',
  },
];

export const mockAIEvents: AIEvent[] = [
  { id: 'ae1', type: 'attendance_parsed', description: 'Разобрано 7 сообщений о посещаемости (1А, 1Б, 2Б, 3А, 3В, 4А, 4Б)', confidence: 97, created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 'ae2', type: 'substitution_suggested', description: 'Подбор замены для Ботагоз Дауреновой → Данияр Бекович (92%)', confidence: 92, created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 'ae3', type: 'task_created', description: 'Создана задача из сообщения: "Починить парту в кабинете 12"', confidence: 94, created_at: new Date(Date.now() - 900000).toISOString() },
  { id: 'ae4', type: 'voice_parsed', description: '2 задачи извлечены из голосового поручения директора', confidence: 96, created_at: new Date(Date.now() - 3600000).toISOString() },
];

export const mockVoiceTranscription: VoiceTranscription = {
  id: 'vt1',
  transcript: 'Мы делаем хакатон на следующей неделе. Айгерим, подготовь актовый зал до пятницы. Назкен, закажи воду и бейджи до четверга.',
  language: 'ru',
  duration_seconds: 12,
  created_at: new Date(Date.now() - 3600000).toISOString(),
  status: 'parsed',
  parsed_tasks: [
    {
      title: 'Подготовить актовый зал к хакатону',
      assignee_name: 'Айгерим Нурланова',
      assignee_id: 's1',
      deadline: new Date(Date.now() + 432000000).toISOString(),
      priority: 'medium',
      description: 'Подготовить актовый зал: расставить стулья, проверить микрофоны и проектор.',
      confidence: 97,
    },
    {
      title: 'Заказать воду и бейджи для хакатона',
      assignee_name: 'Назкен Сейткалиева',
      assignee_id: 's2',
      deadline: new Date(Date.now() + 345600000).toISOString(),
      priority: 'medium',
      description: 'Закупить воду (20 бутылок по 1.5л) и распечатать именные бейджи участников.',
      confidence: 95,
    },
  ],
};

export const mockIntegrations: IntegrationConfig[] = [
  { id: 'int1', name: 'Supabase', type: 'supabase', status: 'disconnected', config: { url: '', anon_key: '' } },
  { id: 'int2', name: 'Telegram Bot', type: 'telegram', status: 'disconnected', config: { bot_token: '', webhook_url: '' } },
  { id: 'int3', name: 'OpenAI GPT-4o', type: 'openai', status: 'disconnected', config: { api_key: '', model: 'gpt-4o' } },
  { id: 'int4', name: 'Claude 3.5 Sonnet', type: 'claude', status: 'disconnected', config: { api_key: '' } },
  { id: 'int5', name: 'Speech-to-Text (Whisper)', type: 'stt', status: 'disconnected', config: { provider: 'openai' } },
  { id: 'int7', name: 'Calendar Sync', type: 'calendar', status: 'disconnected', config: { provider: 'google' } },
  { id: 'int8', name: 'Push Notifications', type: 'push', status: 'disconnected', config: { provider: 'firebase' } },
];

export const mockAttendanceChart = [
  { day: 'Пн', present: 162, absent: 14 },
  { day: 'Вт', present: 158, absent: 18 },
  { day: 'Ср', present: 165, absent: 11 },
  { day: 'Чт', present: 160, absent: 16 },
  { day: 'Пт', present: 155, absent: 21 },
  { day: 'Сг', present: 160, absent: 11 },
];
