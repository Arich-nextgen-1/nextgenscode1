import type { LessonSlot, SubstitutionRequest } from '@/types';

export const mockScheduleSlots: LessonSlot[] = [
  // 1А
  { id: 'ls1', day: 'monday', period: 1, start_time: '08:00', end_time: '08:40', subject: 'Математика', teacher_id: 's1', teacher_name: 'Айгерим Нурланова', class_name: '1А', room: '101', status: 'normal' },
  { id: 'ls2', day: 'monday', period: 2, start_time: '08:50', end_time: '09:30', subject: 'Казахский язык', teacher_id: 's2', teacher_name: 'Назкен Сейткалиева', class_name: '1А', room: '101', status: 'normal' },
  { id: 'ls3', day: 'monday', period: 3, start_time: '09:50', end_time: '10:30', subject: 'Окружающий мир', teacher_id: 's17', teacher_name: 'Ботагоз Дауренова', class_name: '1А', room: '101', status: 'substituted', substitute_teacher_id: 's5', substitute_teacher_name: 'Данияр Бекович' },
  { id: 'ls4', day: 'monday', period: 4, start_time: '10:40', end_time: '11:20', subject: 'Рисование', teacher_id: 's6', teacher_name: 'Маржан Ахметова', class_name: '1А', room: '101', status: 'normal' },
  { id: 'ls5', day: 'monday', period: 1, start_time: '08:00', end_time: '08:40', subject: 'Русский язык', teacher_id: 's4', teacher_name: 'Гульнара Омарова', class_name: '2А', room: '202', status: 'normal' },
  { id: 'ls6', day: 'monday', period: 2, start_time: '08:50', end_time: '09:30', subject: 'Математика', teacher_id: 's11', teacher_name: 'Куаныш Ергалиев', class_name: '2А', room: '202', status: 'normal' },
  { id: 'ls7', day: 'monday', period: 3, start_time: '09:50', end_time: '10:30', subject: 'Музыка', teacher_id: 's7', teacher_name: 'Серик Тлеулов', class_name: '2А', room: '202', status: 'normal' },
  { id: 'ls8', day: 'tuesday', period: 1, start_time: '08:00', end_time: '08:40', subject: 'Математика', teacher_id: 's1', teacher_name: 'Айгерим Нурланова', class_name: '1А', room: '101', status: 'normal' },
  { id: 'ls9', day: 'tuesday', period: 2, start_time: '08:50', end_time: '09:30', subject: 'Физкультура', teacher_id: 's3', teacher_name: 'Болат Жаксыбеков', class_name: '1А', room: 'Спортзал', status: 'normal' },
  { id: 'ls10', day: 'tuesday', period: 3, start_time: '09:50', end_time: '10:30', subject: 'Казахский язык', teacher_id: 's2', teacher_name: 'Назкен Сейткалиева', class_name: '1А', room: '101', status: 'normal' },
  { id: 'ls11', day: 'wednesday', period: 1, start_time: '08:00', end_time: '08:40', subject: 'Русский язык', teacher_id: 's4', teacher_name: 'Гульнара Омарова', class_name: '3В', room: '301', status: 'normal' },
  { id: 'ls12', day: 'wednesday', period: 2, start_time: '08:50', end_time: '09:30', subject: 'Математика', teacher_id: 's1', teacher_name: 'Айгерим Нурланова', class_name: '3В', room: '301', status: 'normal' },
  { id: 'ls13', day: 'wednesday', period: 3, start_time: '09:50', end_time: '10:30', subject: 'Окружающий мир', teacher_id: 's17', teacher_name: 'Ботагоз Дауренова', class_name: '4Б', room: '401', status: 'substituted', substitute_teacher_id: 's5', substitute_teacher_name: 'Данияр Бекович' },
  { id: 'ls14', day: 'wednesday', period: 4, start_time: '10:40', end_time: '11:20', subject: 'Окружающий мир', teacher_id: 's17', teacher_name: 'Ботагоз Дауренова', class_name: '3А', room: '302', status: 'substituted', substitute_teacher_id: 's5', substitute_teacher_name: 'Данияр Бекович' },
  { id: 'ls15', day: 'thursday', period: 1, start_time: '08:00', end_time: '08:40', subject: 'Математика', teacher_id: 's11', teacher_name: 'Куаныш Ергалиев', class_name: '2Б', room: '205', status: 'normal' },
  { id: 'ls16', day: 'thursday', period: 2, start_time: '08:50', end_time: '09:30', subject: 'Технология', teacher_id: 's15', teacher_name: 'Жанар Оспанова', class_name: '2Б', room: '205', status: 'normal' },
  { id: 'ls17', day: 'friday', period: 1, start_time: '08:00', end_time: '08:40', subject: 'Казахский язык', teacher_id: 's12', teacher_name: 'Меруерт Байжанова', class_name: '4А', room: '402', status: 'normal' },
  { id: 'ls18', day: 'friday', period: 2, start_time: '08:50', end_time: '09:30', subject: 'Рисование', teacher_id: 's19', teacher_name: 'Камила Абдрахманова', class_name: '4А', room: '402', status: 'normal' },
];

export const mockSubstitutionRequest: SubstitutionRequest = {
  id: 'sub1',
  absent_teacher_id: 's17',
  absent_teacher_name: 'Ботагоз Дауренова',
  date: new Date().toISOString().split('T')[0],
  affected_slots: mockScheduleSlots.filter((s) => s.teacher_id === 's17'),
  recommended_substitute_id: 's5',
  recommended_substitute_name: 'Данияр Бекович',
  status: 'applied',
  ai_recommendation:
    'Данияр Бекович подходит по квалификации (Окружающий мир), не занят в 3-4 период, имеет свободные слоты. Рекомендуется.',
  qualification_match: 92,
  created_at: new Date(Date.now() - 600000).toISOString(),
};
