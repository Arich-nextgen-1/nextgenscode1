// ============================================================
// Message Parser / Classifier — AI Zavuch
// ============================================================
// Определяет тип входящего сообщения по ключевым словам.
// Сейчас работает на regex-правилах.
//
// TODO: Позже заменить на AI-парсер (OpenAI / Claude):
//   const result = await openai.chat.completions.create({
//     messages: [{ role: 'system', content: CLASSIFICATION_PROMPT }, { role: 'user', content: messageText }],
//   });
// ============================================================

import type { ClassificationResult, MessageType } from '@/types/telegram';

/** Правила классификации — массив паттернов и их типов */
const RULES: { type: MessageType; patterns: RegExp[]; weight: number }[] = [
  {
    type: 'attendance',
    weight: 90,
    patterns: [
      /\d+[а-яА-Я]\s*[-–—:]\s*\d+/i,         // "1А - 25 детей"
      /присутству/i,                            // "присутствуют"
      /отсутству/i,                             // "отсутствуют"
      /все\s+\d+\s+присутствуют/i,              // "все 25 присутствуют"
      /\d+\s*(детей|учеников|ребят)/i,          // "25 детей"
      /болеют|болеет/i,                         // "2 болеют"
      /из\s+\d+/i,                              // "22 из 24"
      /посещаемость/i,                          // "посещаемость"
      /нет\s+\d+/i,                             // "нет 3"
    ],
  },
  {
    type: 'incident',
    weight: 85,
    patterns: [
      /сломал(а|ась|ось|ся|и)/i,               // "сломалась парта"
      /разбит|разбил/i,                         // "разбито окно"
      /авари[яи]/i,                             // "авария"
      /потоп|затопи/i,                          // "затопило"
      /кабинет(е)?\s+\d+/i,                     // "в кабинете 12"
      /срочн(о|ый|ая)/i,                        // "срочно"
      /инцидент/i,                              // прямое слово
      /пожар/i,                                 // "пожар"
      /драк(а|у|и)/i,                           // "драка"
      /травм(а|у|ы)/i,                          // "травма"
      /происшеств/i,                            // "происшествие"
    ],
  },
  {
    type: 'teacher_absence',
    weight: 80,
    patterns: [
      /не\s*(буду|выйду|смогу|приду)/i,        // "не буду сегодня"
      /заболел(а)?/i,                           // "заболел"
      /больничн/i,                              // "на больничном"
      /отпуск|отгул/i,                          // "отпуск"
      /меня\s+не\s+будет/i,                     // "меня не будет"
      /не\s+выйд(у|ет)/i,                       // "не выйдет сегодня"
      /отсутств(ую|ует)/i,                      // "отсутствую"
      /замен(а|у|ить)/i,                        // "нужна замена"
    ],
  },
  {
    type: 'task_request',
    weight: 75,
    patterns: [
      /подготов(ь|и|ить)/i,                     // "подготовь"
      /закаж(и|ите)/i,                          // "закажи"
      /сдела(й|ть)/i,                           // "сделай"
      /нужн(о|а|ы)/i,                           // "нужно"
      /организ(уй|овать)/i,                     // "организуй"
      /прош(у|е)\s+(вас\s+)?/i,                 // "прошу вас"
      /необходимо/i,                            // "необходимо"
      /до\s+(понедельник|вторник|сред|четверг|пятниц|суббот|воскресень)/i, // дедлайн
      /до\s+\d+/i,                              // "до 15 числа"
      /актов(ый|ого)\s+зал/i,                   // "актовый зал"
    ],
  },
];

/**
 * Классифицирует текст сообщения по типу.
 *
 * Как это работает:
 * 1. Проходим по каждому правилу
 * 2. Считаем, сколько паттернов совпали
 * 3. Берём правило с наибольшим количеством совпадений
 * 4. Возвращаем тип и уверенность
 */
export function classifyMessage(text: string): ClassificationResult {
  if (!text || text.trim().length === 0) {
    return { type: 'unknown', confidence: 0 };
  }

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
      // Чем больше паттернов совпало, тем увереннее мы в типе
      const score = matchCount * rule.weight;
      if (score > bestMatch.score) {
        bestMatch = { type: rule.type, score, weight: rule.weight };
      }
    }
  }

  if (bestMatch.type === 'unknown') {
    return { type: 'unknown', confidence: 30 };
  }

  // Уверенность: минимум weight правила, максимум 98
  const confidence = Math.min(98, bestMatch.weight + bestMatch.score / 10);

  return {
    type: bestMatch.type,
    confidence: Math.round(confidence),
  };
}

/**
 * Возвращает человекочитаемое название типа сообщения.
 */
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
