"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockAttendanceChart } from "@/data"
import {
  Users, UserMinus, AlertTriangle, CheckCircle2, CalendarOff,
  Sparkles, BrainCircuit, ClipboardCheck, Mic, FileText, Send,
  Clock, MessageCircle, RefreshCw, Zap, ArrowRight, Loader2
} from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { FormattedDate } from "@/components/ui/formatted-date"

// ── Типы ────────────────────────────────────────────────────

interface DashboardStats {
  messages_total: number
  messages_processed: number
  messages_unprocessed: number
  attendance_today: number
  incidents_active: number
  tasks_active: number
  absences_today: number
  total_students: number
  present_today: number
  absent_today: number
  attendance_rate: number
}

interface RecentActivity {
  id: string
  sender_name: string
  message_text: string
  parsed_type: string
  confidence: number
  processed_at: string
  linked_entity_type: string
}

interface TelegramMsg {
  id: string
  from_name: string
  message: string
  sent_at: string
  type: string
  processed: boolean
  confidence: number
  processing_status: string
  linked_entity_type?: string
}

interface ProcessingResult {
  ok: boolean
  total_messages: number
  processed: number
  stats: {
    attendance: number
    incidents: number
    tasks: number
    teacher_absences: number
    unknown: number
    errors: number
  }
}

// ── Badge maps ──────────────────────────────────────────────

const telegramTypeBadge: Record<string, { label: string; className: string }> = {
  attendance: { label: 'Посещаемость', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  incident: { label: 'Инцидент', className: 'bg-red-50 text-red-700 border-red-200' },
  teacher_absence: { label: 'Отсутствие', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  task_request: { label: 'Задача', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  request: { label: 'Запрос', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  general: { label: 'Общее', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  unknown: { label: 'Не определено', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  classified: { label: 'Классифицировано', className: 'bg-sky-50 text-sky-700 border-sky-200' },
}

const activityIcon: Record<string, string> = {
  attendance: '📊',
  incident: '🚨',
  teacher_absence: '🏥',
  task_request: '📋',
  task: '📋',
  unknown: '💬',
}

// ── Компонент ───────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const [telegramFeed, setTelegramFeed] = useState<TelegramMsg[]>([])
  const [loading, setLoading] = useState(true)
  const [processingState, setProcessingState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null)

  // Загрузка данных
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, messagesRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/telegram/messages?limit=8'),
      ])

      const statsData = await statsRes.json()
      const messagesData = await messagesRes.json()

      if (statsData.ok) {
        setStats(statsData.stats)
        setActivity(statsData.recent_activity || [])
      }
      if (messagesData.ok) {
        setTelegramFeed(messagesData.messages || [])
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Обработка сообщений
  const handleProcessMessages = async () => {
    setProcessingState('loading')
    setProcessingResult(null)
    try {
      const res = await fetch('/api/process-messages', { method: 'POST' })
      const data = await res.json()
      setProcessingResult(data)
      setProcessingState('done')
      // Перезагружаем данные
      await fetchData()
      // Сбрасываем через 8 секунд
      setTimeout(() => {
        setProcessingState('idle')
        setProcessingResult(null)
      }, 8000)
    } catch (err) {
      console.error('Processing error:', err)
      setProcessingState('idle')
    }
  }

  // Quick actions (mock for others, real for process)
  const [reportState, setReportState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [substitutionState, setSubstitutionState] = useState<'idle' | 'loading' | 'done'>('idle')
  const handleQuickAction = async (set: React.Dispatch<React.SetStateAction<'idle' | 'loading' | 'done'>>) => {
    set('loading')
    await new Promise(r => setTimeout(r, 1400))
    set('done')
    setTimeout(() => set('idle'), 3500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Доброе утро, Директор</h1>
          <p className="text-slate-500 mt-1">Сводка AI по школе на сегодня.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1 px-3">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            AI Аналитика Активна
          </Badge>
            <FormattedDate 
              date={new Date()} 
              type="date" 
              options={{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }} 
              className="text-sm text-slate-500" 
            />
        </div>
      </div>

      {/* KPI Stats — Real Data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-emerald-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Присутствуют</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.present_today || 0}{' '}
              <span className="text-sm font-normal text-slate-500">/ {stats?.total_students || 0}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-emerald-600 font-medium">{stats?.attendance_rate || 0}%</span> посещаемость
            </p>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${stats?.attendance_rate || 0}%` }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:border-amber-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отсутствуют</CardTitle>
            <UserMinus className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats?.absent_today || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              по данным из Telegram
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-red-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные инциденты</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{loading ? '...' : stats?.incidents_active || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              Требует внимания
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные задачи</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats?.tasks_active || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              В работе и новые
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Panel — with REAL process button */}
      <Card className="border-slate-200 bg-slate-50/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0">Быстрые действия:</span>
            
            {/* ★ MAIN ACTION: Process Telegram Messages */}
            <Button
              size="sm"
              onClick={handleProcessMessages}
              disabled={processingState !== 'idle'}
              className={`h-8 text-xs font-semibold shadow-sm transition-all ${
                processingState === 'done'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {processingState === 'loading' ? (
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              ) : processingState === 'done' ? (
                <CheckCircle2 className="h-3 w-3 mr-1.5" />
              ) : (
                <Zap className="h-3 w-3 mr-1.5" />
              )}
              {processingState === 'done'
                ? `Обработано ${processingResult?.processed || 0} сообщений`
                : processingState === 'loading'
                ? 'Обработка...'
                : `Обработать сообщения${stats?.messages_unprocessed ? ` (${stats.messages_unprocessed})` : ''}`}
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={reportState !== 'idle'}
              onClick={() => handleQuickAction(setReportState)}
              className="h-8 border-slate-200 bg-white text-slate-700 hover:border-slate-300 text-xs"
            >
              {reportState === 'loading' ? <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" /> : reportState === 'done' ? <CheckCircle2 className="h-3 w-3 mr-1.5 text-emerald-600" /> : <FileText className="h-3 w-3 mr-1.5" />}
              {reportState === 'done' ? 'Отчёт сформирован' : 'Сформировать отчёт'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={substitutionState !== 'idle'}
              onClick={() => handleQuickAction(setSubstitutionState)}
              className="h-8 border-slate-200 bg-white text-slate-700 hover:border-slate-300 text-xs"
            >
              {substitutionState === 'loading' ? <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" /> : substitutionState === 'done' ? <CheckCircle2 className="h-3 w-3 mr-1.5 text-emerald-600" /> : <CalendarOff className="h-3 w-3 mr-1.5" />}
              {substitutionState === 'done' ? 'Замены проверены' : 'Проверить замены'}
            </Button>
          </div>

          {/* Processing result banner */}
          {processingResult && processingState === 'done' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex flex-wrap items-center gap-3 text-xs animate-in fade-in">
              <span className="font-semibold text-emerald-800">✅ Результат обработки:</span>
              {processingResult.stats.attendance > 0 && (
                <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200">
                  📊 Посещаемость: {processingResult.stats.attendance}
                </Badge>
              )}
              {processingResult.stats.incidents > 0 && (
                <Badge variant="outline" className="bg-white text-red-700 border-red-200">
                  🚨 Инциденты: {processingResult.stats.incidents}
                </Badge>
              )}
              {processingResult.stats.tasks > 0 && (
                <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">
                  📋 Задачи: {processingResult.stats.tasks}
                </Badge>
              )}
              {processingResult.stats.teacher_absences > 0 && (
                <Badge variant="outline" className="bg-white text-purple-700 border-purple-200">
                  🏥 Отсутствия: {processingResult.stats.teacher_absences}
                </Badge>
              )}
              {processingResult.stats.unknown > 0 && (
                <Badge variant="outline" className="bg-white text-slate-600 border-slate-200">
                  💬 Неопределённые: {processingResult.stats.unknown}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Chart */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Тренды посещаемости</CardTitle>
            <CardDescription>
              Сравнение ежедневной посещаемости за последнюю неделю
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockAttendanceChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                  />
                  <Area type="monotone" dataKey="present" name="Присутствуют" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Messages Stats */}
        <Card className="md:col-span-3 flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Статистика сообщений</CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-normal text-[10px]">
                Telegram Bot
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-5 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Всего</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.messages_total || 0}</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-medium">Обработано</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{stats?.messages_processed || 0}</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-[10px] uppercase tracking-wider text-amber-600 font-medium">Ожидают</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">{stats?.messages_unprocessed || 0}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Создано из сообщений сегодня</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                  <span className="text-base">📊</span>
                  <div>
                    <p className="text-xs text-slate-500">Посещаемость</p>
                    <p className="text-sm font-bold text-slate-900">{stats?.attendance_today || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                  <span className="text-base">🚨</span>
                  <div>
                    <p className="text-xs text-slate-500">Инциденты</p>
                    <p className="text-sm font-bold text-slate-900">{stats?.incidents_active || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                  <span className="text-base">📋</span>
                  <div>
                    <p className="text-xs text-slate-500">Задачи</p>
                    <p className="text-sm font-bold text-slate-900">{stats?.tasks_active || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                  <span className="text-base">🏥</span>
                  <div>
                    <p className="text-xs text-slate-500">Отсутствия</p>
                    <p className="text-sm font-bold text-slate-900">{stats?.absences_today || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Telegram Feed + AI Activity */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Telegram Feed — Real Data */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                Последние сообщения Telegram
              </CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-normal text-[10px]">
                {telegramFeed.filter(m => m.processed).length}/{telegramFeed.length} обработано
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {telegramFeed.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-slate-200" />
                Нет сообщений. Отправьте что-нибудь боту в Telegram.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {telegramFeed.slice(0, 6).map(msg => {
                  const badge = telegramTypeBadge[msg.type] || telegramTypeBadge.general
                  return (
                    <div key={msg.id} className="px-4 py-3 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-semibold text-slate-900 truncate">{msg.from_name}</span>
                        </div>
                        <FormattedDate 
                          date={msg.sent_at} 
                          type="time" 
                          className="text-[10px] text-slate-400 font-medium shrink-0" 
                        />
                      </div>
                      <p className="text-xs text-slate-600 leading-snug mb-2 line-clamp-2">«{msg.message}»</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium ${badge.className}`}>
                          {badge.label}
                        </Badge>
                        {msg.confidence > 0 && (
                          <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">
                            {msg.confidence}%
                          </span>
                        )}
                        {msg.processed ? (
                          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 ml-auto">
                            <CheckCircle2 className="h-3 w-3" /> Обработано
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1 ml-auto">
                            <Clock className="h-3 w-3" /> Ожидает
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Activity — Real Processed Data */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-indigo-500" />
              Что AI обработал
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activity.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <BrainCircuit className="h-8 w-8 mx-auto mb-2 text-slate-200" />
                Нет обработанных сообщений. Нажмите &quot;Обработать сообщения&quot;.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activity.slice(0, 8).map(item => (
                  <div key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
                    <span className="text-base leading-none shrink-0 mt-0.5">
                      {activityIcon[item.linked_entity_type] || activityIcon[item.parsed_type] || '💬'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-medium leading-snug truncate">
                        {item.sender_name}: «{item.message_text.slice(0, 50)}{item.message_text.length > 50 ? '...' : ''}»
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium ${(telegramTypeBadge[item.parsed_type] || telegramTypeBadge.general).className}`}>
                          {(telegramTypeBadge[item.parsed_type] || telegramTypeBadge.general).label}
                        </Badge>
                        {item.linked_entity_type && (
                          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Создано
                          </span>
                        )}
                        {item.confidence > 0 && (
                          <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">
                            {item.confidence}%
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.processed_at ? <FormattedDate date={item.processed_at} type="time" /> : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
