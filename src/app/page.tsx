"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockKPI, mockAIEvents, mockAttendanceChart, mockTasks, mockNotifications } from "@/data"
import { mockTelegramMessages } from "@/data/attendance"
import { Users, UserMinus, AlertTriangle, CheckCircle2, CalendarOff, Sparkles, ArrowRight, BrainCircuit, ClipboardCheck, Mic, FileText, Send, Clock, MessageCircle, RefreshCw } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatTime, timeAgo } from "@/lib/utils"
import type { DashboardAIAction } from "@/types"

// ── Mock service data ────────────────────────────────────────────
// TODO: connect backend here — replace with GET /api/dashboard/ai-actions
const mockAIActions: DashboardAIAction[] = [
  { id: 'da1', icon: '📊', label: 'Сформирован отчёт по посещаемости', detail: '7 из 8 классов обработано', time: '09:05', status: 'done' },
  { id: 'da2', icon: '✅', label: 'Создано 3 задачи по инцидентам', detail: 'Назначены ответственные, установлены дедлайны', time: '08:52', status: 'done' },
  { id: 'da3', icon: '🔁', label: 'Назначена замена: Данияр Бекович', detail: 'Вместо Ботагоз Дауреновой (3-4 урок)', time: '08:40', status: 'done' },
  { id: 'da4', icon: '💬', label: 'Обработано 8 сообщений из Telegram', detail: '6 отчётов о посещаемости, 2 инцидента', time: '08:30', status: 'done' },
  { id: 'da5', icon: '📋', label: 'Отчёт для столовой готов к отправке', detail: '160 порций на сегодня', time: '08:10', status: 'done' },
]
// ────────────────────────────────────────────────────────────────

const eventTypeMap: Record<string, string> = {
  attendance_parsed: 'Посещаемость обработана',
  substitution_suggested: 'Предложена замена',
  task_created: 'Создана задача',
  voice_parsed: 'Голос обработан',
}

const priorityMap: Record<string, string> = {
  critical: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
}

const telegramTypeBadge: Record<string, { label: string; className: string }> = {
  attendance: { label: 'Посещаемость', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  incident: { label: 'Инцидент', className: 'bg-red-50 text-red-700 border-red-200' },
  request: { label: 'Запрос', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  general: { label: 'Общее', className: 'bg-slate-100 text-slate-600 border-slate-200' },
}

export default function DashboardPage() {
  const urgentTasks = mockTasks.filter(t => t.priority === 'critical' || t.priority === 'high').slice(0, 3)
  const telegramFeed = mockTelegramMessages.slice(0, 5)

  const [reportState, setReportState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [substitutionState, setSubstitutionState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [tasksState, setTasksState] = useState<'idle' | 'loading' | 'done'>('idle')

  const handleQuickAction = async (
    set: React.Dispatch<React.SetStateAction<'idle' | 'loading' | 'done'>>
  ) => {
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
          <span className="text-sm text-slate-500">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-emerald-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Присутствуют</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockKPI.present_today} <span className="text-sm font-normal text-slate-500">/ {mockKPI.total_students}</span></div>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-emerald-600 font-medium">+{mockKPI.attendance_rate}%</span> посещаемость
            </p>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${mockKPI.attendance_rate}%` }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:border-amber-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отсутствуют</CardTitle>
            <UserMinus className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockKPI.absent_today}</div>
            <p className="text-xs text-slate-500 mt-1">
              3 по болезни, 8 без причины
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-red-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные инциденты</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockKPI.active_incidents}</div>
            <p className="text-xs text-slate-500 mt-1">
              Требует внимания
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-200 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Замены</CardTitle>
            <CalendarOff className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockKPI.substitutions_today}</div>
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-emerald-600 font-medium">100%</span> решено с помощью AI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <Card className="border-slate-200 bg-slate-50/50">
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0">Быстрые действия:</span>
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
          <Button
            size="sm"
            variant="outline"
            disabled={tasksState !== 'idle'}
            onClick={() => handleQuickAction(setTasksState)}
            className="h-8 border-slate-200 bg-white text-slate-700 hover:border-slate-300 text-xs"
          >
            {tasksState === 'loading' ? <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" /> : tasksState === 'done' ? <CheckCircle2 className="h-3 w-3 mr-1.5 text-emerald-600" /> : <ClipboardCheck className="h-3 w-3 mr-1.5" />}
            {tasksState === 'done' ? 'Задачи созданы' : 'Создать задачи'}
          </Button>
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

        {/* Urgent Actions */}
        <Card className="md:col-span-3 flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Срочные действия</CardTitle>
              <Badge variant="destructive" className="px-1.5 py-0">Требуется действие</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="divide-y">
              {urgentTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{task.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                    </div>
                    <Badge variant={task.priority === 'critical' ? 'destructive' : 'warning'}>
                      {priorityMap[task.priority] || task.priority}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {task.assignee_name}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                      Показать <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: AI Actions + Telegram Feed + AI Events */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* What AI Did Today */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-slate-500" />
                Что AI сделал сегодня
              </CardTitle>
              <Badge variant="outline" className="bg-white text-slate-500 font-normal text-[10px]">
                {mockAIActions.length} операций
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {mockAIActions.map(item => (
                <div key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
                  <span className="text-base leading-none shrink-0 mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 font-medium leading-snug">{item.label}</p>
                    {item.detail && (
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.detail}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0 mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />{item.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Telegram Feed */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                Новые сообщения Telegram
              </CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-normal text-[10px]">
                {telegramFeed.filter(m => m.processed).length}/{telegramFeed.length} обработано
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {telegramFeed.map(msg => {
                const badge = telegramTypeBadge[msg.type] || telegramTypeBadge.general
                return (
                  <div key={msg.id} className="px-4 py-3 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-slate-900 truncate">{msg.from_name}</span>
                        {msg.from_class && (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium text-[10px] shrink-0">{msg.from_class}</Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {new Date(msg.sent_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug mb-2 line-clamp-2">«{msg.message}»</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium ${badge.className}`}>
                        {badge.label}
                      </Badge>
                      {msg.processed ? (
                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Обработано AI
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Ожидает
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Events Stream */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Поток событий AI
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {mockAIEvents.map((event, index) => (
                <div key={event.id} className="flex gap-3 relative">
                  {index !== mockAIEvents.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-slate-100"></div>
                  )}
                  <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 ring-4 ring-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 space-y-1 pb-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none text-slate-900">
                        {eventTypeMap[event.type] || event.type}
                      </p>
                      <span className="text-xs text-slate-500">{timeAgo(event.created_at)}</span>
                    </div>
                    <p className="text-xs text-slate-600">{event.description}</p>
                    {event.confidence && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {event.confidence}% уверенность
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
