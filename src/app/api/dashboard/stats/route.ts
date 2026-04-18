// ============================================================
// Dashboard Stats — GET /api/dashboard/stats
// ============================================================
// Возвращает реальную статистику из Supabase для dashboard KPI.
// ============================================================

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase не настроен' }, { status: 500 });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // Параллельно запрашиваем все счётчики
    const [
      messagesTotal,
      messagesProcessed,
      messagesUnprocessed,
      attendanceToday,
      incidentsActive,
      tasksActive,
      absencesToday,
    ] = await Promise.all([
      supabase.from('telegram_messages').select('*', { count: 'exact', head: true }),
      supabase.from('telegram_messages').select('*', { count: 'exact', head: true }).eq('processed', true),
      supabase.from('telegram_messages').select('*', { count: 'exact', head: true }).eq('processed', false),
      supabase.from('attendance').select('*', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`),
      supabase.from('incidents').select('*', { count: 'exact', head: true }).neq('status', 'resolved'),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).in('status', ['new', 'in_progress']),
      supabase.from('teacher_absences').select('*', { count: 'exact', head: true }).eq('absent_date', today),
    ]);

    // Суммируем посещаемость
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('present_count, absent_count, total_students')
      .gte('created_at', `${today}T00:00:00`);

    let totalStudents = 0;
    let presentToday = 0;
    let absentToday = 0;

    if (attendanceData) {
      for (const row of attendanceData) {
        totalStudents += row.total_students || 0;
        presentToday += row.present_count || 0;
        absentToday += row.absent_count || 0;
      }
    }

    const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

    // Последние обработанные сообщения (для activity feed)
    const { data: recentProcessed } = await supabase
      .from('telegram_messages')
      .select('id, sender_name, message_text, parsed_type, confidence, processed_at, linked_entity_type')
      .eq('processed', true)
      .order('processed_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      ok: true,
      stats: {
        messages_total: messagesTotal.count || 0,
        messages_processed: messagesProcessed.count || 0,
        messages_unprocessed: messagesUnprocessed.count || 0,
        attendance_today: attendanceToday.count || 0,
        incidents_active: incidentsActive.count || 0,
        tasks_active: tasksActive.count || 0,
        absences_today: absencesToday.count || 0,
        total_students: totalStudents,
        present_today: presentToday,
        absent_today: absentToday,
        attendance_rate: attendanceRate,
      },
      recent_activity: recentProcessed || [],
    });
  } catch (error: any) {
    console.error('[Stats API] Error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
