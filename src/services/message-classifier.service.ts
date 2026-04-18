// ============================================================
// Message Classifier Service — AI Zavuch
// ============================================================
// Улучшенная классификация + извлечение структурированных данных.
// Regex-based для MVP, готов к замене на AI (OpenAI/Claude).
// ============================================================

import type { MessageType, ClassificationResult } from '@/types/telegram';

// ── Извлечённые данные ──────────────────────────────────────

export interface AttendanceExtracted {
  class_name: string;
  total_students?: number;
  present_count?: number;
  absent_count?: number;
  reason?: string;
}

export interface IncidentExtracted {
  title: string;
  description: string;
  location?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface TeacherAbsenceExtracted {
  teacher_name?: string;
  reason?: string;
  date?: string;
}

export interface TaskExtracted {
  assignee_name?: string;
  task_description: string;
}

export interface ExtractionResult {
  type: MessageType;
  confidence: number;
  attendance?: AttendanceExtracted;
  incident?: IncidentExtracted;
  teacher_absence?: TeacherAbsenceExtracted;
  tasks?: TaskExtracted[];
}

// ── Правила классификации ───────────────────────────────────

const RULES: { type: MessageType; patterns: RegExp[]; weight: number }[] = [
  {
    type: 'attendance',
    weight: 90,
    patterns: [
      /\d+[а-яА-Я]\s*[-–—:]\s*\d+/i,
      /присутству/i,
      /отсутству/i,
      /все\s+\d+\s+присутствуют/i,
      /\d+\s*(детей|учеников|ребят|ученика)/i,
      /болеют|болеет/i,
      /из\s+\d+/i,
      /посещаемость/i,
      /нет\s+\d+/i,
      /на справке/i,
    ],
  },
  {
    type: 'incident',
    weight: 85,
    patterns: [
      /сломал(а|ась|ось|ся|и)/i,
      /разбит|разбил/i,
      /авари[яи]/i,
      /потоп|затопи/i,
      /кабинет(е)?\s+\d+/i,
      /срочн(о|ый|ая)/i,
      /инцидент/i,
      /пожар/i,
      /драк(а|у|и)/i,
      /травм(а|у|ы)/i,
      /происшеств/i,
      /починить|ремонт/i,
    ],
  },
  {
    type: 'teacher_absence',
    weight: 80,
    patterns: [
      /не\s*(буду|выйду|смогу|приду)/i,
      /заболел(а)?/i,
      /больничн/i,
      /отпуск|отгул/i,
      /меня\s+не\s+будет/i,
      /не\s+выйд(у|ет)/i,
      /отсутств(ую|ует)/i,
      /замен(а|у|ить)/i,
      /не выйдет сегодня/i,
    ],
  },
  {
    type: 'task_request',
    weight: 75,
    patterns: [
      /подготов(ь|и|ить|ьте)/i,
      /закаж(и|ите)/i,
      /сдела(й|ть|йте)/i,
      /нужн(о|а|ы)/i,
      /организ(уй|овать|уйте)/i,
      /прош(у|е)\s+(вас\s+)?/i,
      /необходимо/i,
      /до\s+(понедельник|вторник|сред|четверг|пятниц|суббот|воскресень)/i,
      /актов(ый|ого)\s+зал/i,
    ],
  },
];

// ── Классификация ───────────────────────────────────────────

export function classifyAndExtract(
  text: string,
  senderName: string
): ExtractionResult {
  if (!text || text.trim().length === 0) {
    return { type: 'unknown', confidence: 0 };
  }

  // 1. Классифицируем
  let bestMatch: { type: MessageType; score: number; weight: number } = {
    type: 'unknown',
    score: 0,
    weight: 0,
  };

  for (const rule of RULES) {
    let matchCount = 0;
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      const score = matchCount * rule.weight;
      if (score > bestMatch.score) {
        bestMatch = { type: rule.type, score, weight: rule.weight };
      }
    }
  }

  const confidence =
    bestMatch.type === 'unknown'
      ? 30
      : Math.min(98, Math.round(bestMatch.weight + bestMatch.score / 10));

  const result: ExtractionResult = {
    type: bestMatch.type,
    confidence,
  };

  // 2. Извлекаем структурированные данные
  switch (result.type) {
    case 'attendance':
      result.attendance = extractAttendance(text);
      break;
    case 'incident':
      result.incident = extractIncident(text);
      break;
    case 'teacher_absence':
      result.teacher_absence = extractTeacherAbsence(text, senderName);
      break;
    case 'task_request':
      result.tasks = extractTasks(text);
      break;
  }

  return result;
}

// ── Извлечение: Посещаемость ────────────────────────────────

function extractAttendance(text: string): AttendanceExtracted {
  const result: AttendanceExtracted = {
    class_name: '',
  };

  // Извлекаем название класса: "1А", "9Б", "11В" и т.д.
  const classMatch = text.match(/(\d{1,2})\s*([а-яА-Я])\s*[-–—:]/i)
    || text.match(/(\d{1,2})\s*([а-яА-Я])\b/i);
  if (classMatch) {
    result.class_name = `${classMatch[1]}${classMatch[2].toUpperCase()}`;
  }

  // Извлекаем количество присутствующих
  // Формат: "25 детей" или "сегодня 21"
  const childrenMatch = text.match(/(\d+)\s*(детей|учеников|ребят|ученика)/i);
  const justNumberMatch = text.match(/[-–—:]\s*(\d+)/);
  const outOfMatch = text.match(/(\d+)\s*из\s*(\d+)/i);

  if (outOfMatch) {
    result.present_count = parseInt(outOfMatch[1]);
    result.total_students = parseInt(outOfMatch[2]);
    result.absent_count = result.total_students - result.present_count;
  } else if (childrenMatch) {
    result.present_count = parseInt(childrenMatch[1]);
  } else if (justNumberMatch) {
    result.present_count = parseInt(justNumberMatch[1]);
  }

  // Все присутствуют?
  const allPresentMatch = text.match(/все\s+(\d+)\s+присутствуют/i);
  if (allPresentMatch) {
    result.total_students = parseInt(allPresentMatch[1]);
    result.present_count = result.total_students;
    result.absent_count = 0;
  }

  // Извлекаем количество отсутствующих
  const absentMatch = text.match(/(\d+)\s*(болеют|болеет|отсутству|нет)/i);
  if (absentMatch) {
    result.absent_count = parseInt(absentMatch[1]);
  }

  // Если есть present и absent но нет total
  if (result.present_count && result.absent_count && !result.total_students) {
    result.total_students = result.present_count + result.absent_count;
  }

  // Извлекаем причину
  if (/болеют|болеет|болезн/i.test(text)) {
    result.reason = 'болезнь';
  } else if (/справк/i.test(text)) {
    result.reason = 'справка';
  } else if (/семейн/i.test(text)) {
    result.reason = 'семейные обстоятельства';
  }

  return result;
}

// ── Извлечение: Инцидент ────────────────────────────────────

function extractIncident(text: string): IncidentExtracted {
  // Извлекаем кабинет
  const roomMatch = text.match(/кабинет(е)?\s+(\d+)/i);
  const location = roomMatch ? `Кабинет ${roomMatch[2]}` : undefined;

  // Извлекаем суть (формируем заголовок)
  let title = text;
  if (text.length > 60) {
    title = text.slice(0, 57) + '...';
  }

  // Определяем приоритет
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  if (/срочн|пожар|травм|драк|эвакуац/i.test(text)) {
    priority = 'critical';
  } else if (/сломал|разбит|потоп|затопи/i.test(text)) {
    priority = 'high';
  }

  // Спецслова для формирования короткого title
  const incidentPatterns: [RegExp, string][] = [
    [/сломал(а|ась|ось|ся)?\s+(.{3,30})/i, 'Сломана $2'],
    [/разбит(о|а|ы)?\s+(.{3,30})/i, 'Разбито $2'],
    [/потоп\s*(.{0,30})/i, 'Потоп $1'],
    [/затопи(ло|ли)?\s*(.{0,30})/i, 'Затопление $2'],
    [/драк(а|у|и)/i, 'Драка'],
    [/травм(а|у|ы)/i, 'Травма'],
    [/пожар/i, 'Пожар'],
  ];

  for (const [pattern, replacement] of incidentPatterns) {
    const match = text.match(pattern);
    if (match) {
      title = text.replace(pattern, replacement).trim();
      if (title.length > 60) title = title.slice(0, 57) + '...';
      break;
    }
  }

  return {
    title,
    description: text,
    location,
    priority,
  };
}

// ── Извлечение: Отсутствие учителя ──────────────────────────

function extractTeacherAbsence(
  text: string,
  senderName: string
): TeacherAbsenceExtracted {
  const result: TeacherAbsenceExtracted = {
    teacher_name: senderName,
    date: new Date().toISOString().split('T')[0],
  };

  // Ищем упоминание конкретного учителя (ФИО в тексте)
  // Паттерн: "Фамилия Имя" с заглавных букв
  const nameMatch = text.match(
    /([А-ЯЁ][а-яё]+)\s+([А-ЯЁ][а-яё]+)(?:\s+заболел|\s+не выйдет|\s+отсутств)/i
  );
  if (nameMatch) {
    result.teacher_name = `${nameMatch[1]} ${nameMatch[2]}`;
  }

  // Ищем причину
  if (/заболел|больничн|болезн|болен/i.test(text)) {
    result.reason = 'болезнь';
  } else if (/отпуск/i.test(text)) {
    result.reason = 'отпуск';
  } else if (/отгул/i.test(text)) {
    result.reason = 'отгул';
  } else if (/семейн/i.test(text)) {
    result.reason = 'семейные обстоятельства';
  } else if (/не\s*(буду|выйду|смогу|приду)/i.test(text)) {
    result.reason = 'личные причины';
  }

  return result;
}

// ── Извлечение: Задачи ──────────────────────────────────────

function extractTasks(text: string): TaskExtracted[] {
  const tasks: TaskExtracted[] = [];

  // Разбиваем по точкам и переносам строк
  const sentences = text
    .split(/[.\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  for (const sentence of sentences) {
    // Ищем паттерн "Имя, сделай что-то"
    const assigneeMatch = sentence.match(
      /^([А-ЯЁ][а-яё]+),?\s+(.+)/i
    );

    if (assigneeMatch) {
      tasks.push({
        assignee_name: assigneeMatch[1],
        task_description: assigneeMatch[2].trim(),
      });
    } else {
      tasks.push({
        task_description: sentence,
      });
    }
  }

  // Если ничего не извлекли, просто создаём одну задачу
  if (tasks.length === 0) {
    tasks.push({ task_description: text });
  }

  return tasks;
}

// ── Утилиты ─────────────────────────────────────────────────

export function getMessageTypeLabel(type: MessageType): string {
  const labels: Record<MessageType, string> = {
    attendance: '📊 Посещаемость',
    incident: '🚨 Инцидент',
    teacher_absence: '🏥 Отсутствие учителя',
    task_request: '📋 Запрос / Поручение',
    unknown: '💬 Общее сообщение',
  };
  return labels[type] || '💬 Общее сообщение';
}
