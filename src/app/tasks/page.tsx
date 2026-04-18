"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getIncidents } from "@/services/incidents"
import type { Incident } from "@/types"
import {
  Search, Filter, AlertTriangle, MapPin, Clock, User, FileText,
  MessageCircle, CheckCircle2, PlusCircle, RefreshCw
} from "lucide-react"
import { FormattedDate } from "@/components/ui/formatted-date"

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [taskStates, setTaskStates] = useState<Record<string, 'idle' | 'loading' | 'done'>>({})

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true)
      const data = await getIncidents()
      setIncidents(data)
      setLoading(false)
    }
    fetchIncidents()
  }, [])

  const selectedIncident = incidents.find(i => i.id === selectedId)

  const filteredIncidents = incidents.filter(i =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.room?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.assignee_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // TODO: connect backend here — POST /api/tasks/from-incident
  const handleCreateTask = async (incidentId: string) => {
    setTaskStates(s => ({ ...s, [incidentId]: 'loading' }))
    await new Promise(r => setTimeout(r, 1400))
    setTaskStates(s => ({ ...s, [incidentId]: 'done' }))
  }

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'critical': return <Badge variant="destructive" className="font-medium text-[10px] px-1.5 uppercase tracking-wider">Критический</Badge>
      case 'high': return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none font-medium text-[10px] px-1.5 uppercase tracking-wider">Высокий</Badge>
      case 'medium': return <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none font-medium text-[10px] px-1.5 uppercase tracking-wider">Средний</Badge>
      case 'low': return <Badge variant="outline" className="font-medium text-[10px] px-1.5 uppercase tracking-wider text-slate-500">Низкий</Badge>
      default: return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <Badge variant="outline" className="bg-slate-100 text-slate-700 font-medium">Новый</Badge>
      case 'in_progress': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">В работе</Badge>
      case 'waiting': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-medium">Ожидает</Badge>
      case 'done': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Решен</Badge>
      default: return null
    }
  }

  const getTaskStatusBlock = (incident: Incident) => {
    const state = taskStates[incident.id] || 'idle'
    if (state === 'loading') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-md border border-slate-100">
          <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin" />
          <span className="text-xs text-slate-500">Создание задачи...</span>
        </div>
      )
    }
    if (state === 'done' || incident.task_status === 'auto_created') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-md border border-emerald-100">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <span className="text-xs font-semibold text-emerald-700">Задача создана автоматически</span>
            {incident.task_assignee && (
              <p className="text-[10px] text-emerald-600 mt-0.5">Назначена: {incident.task_assignee}</p>
            )}
          </div>
        </div>
      )
    }
    return (
      <Button
        size="sm"
        onClick={() => handleCreateTask(incident.id)}
        className="w-full h-8 bg-slate-900 text-white hover:bg-slate-800 text-xs"
      >
        <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
        Создать задачу
      </Button>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Инциденты</h1>
        <p className="text-sm text-slate-500 mt-1">Журнал происшествий и нарушений</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: List */}
        <div className="flex-1 space-y-4">
          <Card className="border-slate-200 shadow-sm p-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск инцидента..." 
                  className="pl-9 h-10 border-slate-200 text-sm w-full bg-white shadow-sm"
                />
              </div>
              <Button variant="outline" className="h-10 border-slate-200 bg-white text-slate-600 shadow-sm shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-10 text-slate-500 text-sm border border-slate-200 shadow-sm rounded-lg bg-white">Загрузка данных...</div>
            ) : filteredIncidents.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm border border-slate-200 shadow-sm rounded-lg bg-white">Ничего не найдено</div>
            ) : (
              filteredIncidents.map(incident => {
                const isSelected = selectedId === incident.id;
                
                return (
                  <Card 
                    key={incident.id} 
                    onClick={() => setSelectedId(incident.id)}
                    className={`cursor-pointer transition-colors border shadow-sm hover:border-slate-300 ${isSelected ? 'ring-2 ring-slate-900 border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`}
                  >
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-slate-900 text-sm leading-tight">{incident.title}</h3>
                        <div className="flex gap-2 shrink-0">
                          {getPriorityBadge(incident.priority)}
                          {getStatusBadge(incident.status)}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{incident.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <FormattedDate date={incident.detected_at} type="time" />
                        </div>
                        {incident.room && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {incident.room}
                          </div>
                        )}
                        {incident.source_channel === 'telegram' && (
                          <div className="flex items-center gap-1.5 text-blue-500">
                            <MessageCircle className="h-3.5 w-3.5" />
                            Telegram
                          </div>
                        )}
                        {/* Task status mini-badge in list */}
                        {(incident.task_status === 'auto_created' || taskStates[incident.id] === 'done') ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Задача создана
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="h-3.5 w-3.5" /> Без задачи
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail Panel */}
        <div className="w-full lg:w-[450px] shrink-0">
          <Card className="border-slate-200 shadow-sm sticky top-24 min-h-[500px] flex flex-col rounded-lg overflow-hidden bg-white">
            {!selectedIncident ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <AlertTriangle className="h-10 w-10 text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-600">Выберите инцидент из списка</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Нажмите на карточку инцидента, чтобы просмотреть детали.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{selectedIncident.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Зафиксировано: <FormattedDate date={selectedIncident.detected_at} />
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 items-end">
                    {getPriorityBadge(selectedIncident.priority)}
                    {getStatusBadge(selectedIncident.status)}
                  </div>
                </div>

                <div className="p-5 flex-1 space-y-5">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Описание</h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-md border border-slate-100">
                      {selectedIncident.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Местоположение</h4>
                      <p className="text-sm text-slate-900 font-medium flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {selectedIncident.room || 'Не указано'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Ответственный</h4>
                      <p className="text-sm text-slate-900 font-medium flex items-center gap-1.5">
                        <User className="h-4 w-4 text-slate-400" />
                        {selectedIncident.assignee_name || 'Не назначен'}
                      </p>
                    </div>
                  </div>

                  {/* Source message block */}
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5" /> Источник сообщения
                    </h4>
                    <div className="bg-slate-50 rounded-md border border-slate-100 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-medium">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {selectedIncident.source_channel === 'telegram' ? 'Telegram' : 'Ручной ввод'}
                        </Badge>
                        {selectedIncident.source_sender && (
                          <span className="text-xs text-slate-600 font-medium">{selectedIncident.source_sender}</span>
                        )}
                        {selectedIncident.source_time && (
                          <FormattedDate 
                            date={selectedIncident.source_time} 
                            type="time" 
                            className="text-xs text-slate-400 ml-auto" 
                          />
                        )}
                      </div>
                      <div className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-100 border-l-2 border-l-blue-300 italic">
                        «{selectedIncident.source_message}»
                      </div>
                    </div>
                  </div>

                  {/* Task status block */}
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Статус задачи</h4>
                    {getTaskStatusBlock(selectedIncident)}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex gap-3">
                    <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800 shadow-sm text-sm">Взять в работу</Button>
                    <Button variant="outline" className="flex-1 shadow-sm border-slate-200 text-sm">Изменить статус</Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
