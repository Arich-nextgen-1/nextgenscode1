import type { AIInsight, AIAction, AIActivity } from '@/types';
import { mockVoiceTranscription } from '@/data';

// ============================================================
// Mock data — replace with real API calls later
// ============================================================

const mockInsights: AIInsight[] = [
  {
    id: 'ins1',
    icon: '📉',
    text: 'Посещаемость упала на 8% в 4Б — 4 из 24 учеников отсутствуют',
    severity: 'warning',
    created_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'ins2',
    icon: '⚠️',
    text: '2 активных инцидента требуют вашего внимания',
    severity: 'critical',
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'ins3',
    icon: '🔁',
    text: 'Нужно назначить замену: Ботагоз Дауренова отсутствует (3 урока)',
    severity: 'critical',
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'ins4',
    icon: '📋',
    text: 'Отчёт по посещаемости за 7/8 классов готов — ожидает отправки в столовую',
    severity: 'info',
    created_at: new Date(Date.now() - 1200000).toISOString(),
  },
];

const mockActions: AIAction[] = [
  {
    id: 'act1',
    label: 'Создать задачи автоматически',
    description: 'AI создаст задачи на основе текущих инцидентов и отсутствий',
  },
  {
    id: 'act2',
    label: 'Применить замены',
    description: 'Утвердить все предложенные AI замены на сегодня',
  },
  {
    id: 'act3',
    label: 'Отправить отчёт в столовую',
    description: 'Отправить сформированный отчёт по посещаемости',
  },
  {
    id: 'act4',
    label: 'Сформировать сводку дня',
    description: 'Создать итоговый отчёт по всем событиям и инцидентам за день',
  },
];

const mockActivity: AIActivity[] = [
  { id: 'act_log1', icon: '📄', text: 'Сформировал отчёт по посещаемости (7 классов)', time: '09:05' },
  { id: 'act_log2', icon: '✅', text: 'Создал 5 задач из сообщений учителей', time: '08:52' },
  { id: 'act_log3', icon: '🔁', text: 'Назначил замену: Данияр Бекович вместо Ботагоз Дауреновой', time: '08:40' },
  { id: 'act_log4', icon: '💬', text: 'Обработал 14 сообщений из Telegram', time: '08:30' },
  { id: 'act_log5', icon: '🎤', text: 'Распознал голосовую команду и создал 2 задачи', time: '08:15' },
];

const mockRecentQueries = [
  { id: 'rq1', text: 'Создай задачи на завтра', time: '08:15' },
  { id: 'rq2', text: 'Кто отсутствует сегодня?', time: '08:40' },
  { id: 'rq3', text: 'Найди замены на сегодня', time: '09:01' },
];

// ============================================================
// Service functions (ready for backend connection)
// ============================================================

// TODO: connect backend / LLM here — replace with GET /api/ai/insights
export const getAIInsights = async (): Promise<AIInsight[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockInsights), 400));
};

// TODO: connect backend / LLM here — replace with GET /api/ai/actions
export const getAIActions = async (): Promise<AIAction[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockActions), 300));
};

// TODO: connect backend / LLM here — replace with GET /api/ai/activity?date=today
export const getAIActivity = async (): Promise<AIActivity[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(mockActivity), 350));
};

// TODO: connect backend / LLM here — replace with GET /api/ai/recent-queries
export const getRecentQueries = async () => {
  return new Promise<typeof mockRecentQueries>((resolve) =>
    setTimeout(() => resolve(mockRecentQueries), 200)
  );
};

// TODO: connect backend / STT + LLM here — replace with POST /api/ai/voice
export const processVoiceCommand = async (audioBlob?: Blob): Promise<string> => {
  // Mock: returns a simulated transcription
  return new Promise((resolve) =>
    setTimeout(() => resolve(mockVoiceTranscription.transcript), 2000)
  );
};

// TODO: connect backend / LLM here — replace with POST /api/ai/chat
export const processTextCommand = async (text: string): Promise<string> => {
  const mockResponses: Record<string, string> = {
    default: 'Команда принята. AI обработает запрос и уведомит вас о результате.',
    замен: 'Замена утверждена: Данияр Бекович заменит Ботагоз Дауренову на 3-м и 4-м уроках. Расписание обновлено.',
    задач: 'Создано 3 задачи на основе активных инцидентов. Назначены ответственные. Дедлайны установлены.',
    отчёт: 'Отчёт по посещаемости (7/8 классов, 160 учеников) сформирован и отправлен в столовую.',
    риск: 'Риски за сегодня: посещаемость 4Б ниже нормы (83%), 2 инцидента открыты, 1 класс не отчитался.',
    сводк: 'Сводка за день: 160/196 учеников присутствуют, 5 задач создано, 1 замена применена, 14 сообщений обработано.',
    проблем: 'Выявлено: 2 открытых инцидента, посещаемость 4Б критически низкая (83%), замена Ботагоз Дауреновой ожидает утверждения.',
    посещаемост: 'Посещаемость за сегодня: 160/196 (81.6%). Ниже нормы: 4Б — 83.3%. Не сдали отчёт: 2А.',
  };
  const key = Object.keys(mockResponses).find((k) => text.toLowerCase().includes(k)) || 'default';
  return new Promise((resolve) => setTimeout(() => resolve(mockResponses[key]), 1200));
};
