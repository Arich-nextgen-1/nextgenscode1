"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockKPI, mockAIEvents, mockAttendanceChart, mockTasks, mockIncidents } from "@/data"
import { Users, UserMinus, AlertTriangle, CheckCircle2, CalendarOff, Sparkles, ArrowRight, BrainCircuit, ClipboardCheck, Mic, FileText } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatTime, timeAgo } from "@/lib/utils"

const eventTypeMap: Record<string, string> = {
  attendance_parsed: 'Посещаемость обработана',
  substitution_suggested: 'Предложена замена',
  task_created: 'Создана задача',
  voice_parsed: 'Голос обработан',
  compliance_checked: 'Проверка соответствия',
};

const priorityMap: Record<string, string> = {
  critical: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

export default function DashboardPage() {
  const urgentTasks = mockTasks.filter(t => t.priority === 'critical' || t.priority === 'high').slice(0, 3)

  return (
    <div className="space-y-6">
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Events Stream */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-500" />
              Поток событий AI
            </CardTitle>
            <CardDescription>События в реальном времени от вашего AI-помощника</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAIEvents.map((event, index) => (
                <div key={event.id} className="flex gap-4 relative">
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

        {/* Quick Links / Status */}
        <Card>
          <CardHeader>
            <CardTitle>Статус системы</CardTitle>
            <CardDescription>Все модули работают нормально</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <ClipboardCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Парсинг посещаемости</p>
                    <p className="text-xs text-slate-500">7/8 классов обработано</p>
                  </div>
                </div>
                <Badge variant="success" className="bg-emerald-100 text-emerald-800">В норме</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Mic className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Парсер голосовых команд</p>
                    <p className="text-xs text-slate-500">Whisper API подключен</p>
                  </div>
                </div>
                <Badge variant="success" className="bg-emerald-100 text-emerald-800">Онлайн</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">RAG Соответствие</p>
                    <p className="text-xs text-slate-500">3 документа проиндексировано</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-indigo-700 bg-indigo-50 border-indigo-200">Готово</Badge>
              </div>
            </div>
            
            <div className="mt-6">
              <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
                <Mic className="mr-2 h-4 w-4" /> Дать голосовую команду
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
