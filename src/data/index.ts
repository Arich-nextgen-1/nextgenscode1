import type { Notification, AIEvent, DashboardKPI, RegulatoryDocument, RAGQuery, IntegrationConfig, VoiceTranscription } from '@/types';

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
  unread_notifications: 7,
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
    id: 'n5',
    type: 'compliance_warning',
    title: 'Напоминание: инструктаж по Приказу №76',
    message: 'Срок проведения ежеквартального инструктажа истекает через 3 дня.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    priority: 'warning',
    action_url: '/regulations',
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
  { id: 'ae5', type: 'compliance_checked', description: 'Проверка соответствия Приказу №76 — предупреждение: инструктаж просрочен', confidence: 99, created_at: new Date(Date.now() - 86400000).toISOString() },
];

export const mockRegulations: RegulatoryDocument[] = [
  {
    id: 'reg1',
    order_number: '76',
    title: 'О пожарной безопасности в образовательных учреждениях',
    description: 'Требования по проведению инструктажей, оснащению средствами пожаротушения и плановым проверкам',
    uploaded_at: new Date(Date.now() - 2592000000).toISOString(),
    indexed_at: new Date(Date.now() - 2505600000).toISOString(),
    status: 'indexed',
    chunk_count: 48,
    category: 'regional',
  },
  {
    id: 'reg2',
    order_number: '110',
    title: 'О порядке учёта посещаемости обучающихся',
    description: 'Стандарты ведения журналов, формы отчётности, сроки сдачи данных в РОНО',
    uploaded_at: new Date(Date.now() - 1728000000).toISOString(),
    indexed_at: new Date(Date.now() - 1641600000).toISOString(),
    status: 'indexed',
    chunk_count: 32,
    category: 'federal',
  },
  {
    id: 'reg3',
    order_number: '130',
    title: 'О педагогической нагрузке и замещении уроков',
    description: 'Нормативы замены уроков, квалификационные требования к заменяющим, документирование',
    uploaded_at: new Date(Date.now() - 864000000).toISOString(),
    indexed_at: new Date(Date.now() - 777600000).toISOString(),
    status: 'indexed',
    chunk_count: 41,
    category: 'federal',
  },
];

export const mockRAGQueries: RAGQuery[] = [
  {
    id: 'rq1',
    question: 'Как часто нужно проводить инструктаж по пожарной безопасности?',
    answer: 'Согласно Приказу №76, инструктаж по пожарной безопасности проводится **ежеквартально** (4 раза в год). Первичный инструктаж — при приёме на работу. Внеплановый — при изменении нормативных требований или после пожарных инцидентов. Все инструктажи фиксируются в журнале под подпись.',
    documents_used: ['reg1'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'done',
    compliance_check: {
      is_compliant: false,
      risk_level: 'high',
      checklist: [
        { item: 'Проведён первичный инструктаж', status: 'done' },
        { item: 'Ежеквартальный инструктаж Q1', status: 'done' },
        { item: 'Ежеквартальный инструктаж Q2', status: 'failed' },
        { item: 'Журнал инструктажей заполнен', status: 'pending' },
        { item: 'Огнетушители проверены', status: 'done' },
      ],
      notes: 'Пропущен инструктаж за Q2. Рекомендуется провести в течение 3 дней.',
    },
  },
  {
    id: 'rq2',
    question: 'Кто может замещать уроки при отсутствии учителя?',
    answer: 'По Приказу №130, замещать уроки может педагог с соответствующей квалификацией по предмету или смежной специальности. Замещение оформляется приказом директора в день отсутствия. Оплата — по тарифной ставке замещающего учителя.',
    documents_used: ['reg3'],
    created_at: new Date(Date.now() - 3600000).toISOString(),
    status: 'done',
    compliance_check: {
      is_compliant: true,
      risk_level: 'none',
      checklist: [
        { item: 'Квалификация замещающего соответствует предмету', status: 'done' },
        { item: 'Приказ о замещении оформлен', status: 'pending' },
        { item: 'Замещение занесено в журнал', status: 'pending' },
      ],
      notes: 'Данияр Бекович соответствует требованиям. Необходимо оформить приказ.',
    },
  },
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
  { id: 'int6', name: 'RAG / Vector Search', type: 'rag', status: 'disconnected', config: { vector_store: 'pgvector' } },
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
