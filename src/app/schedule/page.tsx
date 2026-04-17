"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getScheduleForDay, getSubstitutions } from "@/services/schedule"
import type { LessonSlot, SubstitutionRequest } from "@/types"
import { CalendarDays, AlertTriangle, ArrowRight, UserX, Clock, MapPin, CheckCircle2 } from "lucide-react"

export default function SchedulePage() {
  const [slots, setSlots] = useState<LessonSlot[]>([])
  const [substitutions, setSubstitutions] = useState<SubstitutionRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScheduleData = async () => {
      setLoading(true)
      const daySlots = await getScheduleForDay('monday') // defaulting to monday for mock data demonstration
      const subs = await getSubstitutions()
      
      // Sort slots by period
      const sortedSlots = daySlots.sort((a, b) => a.period - b.period)
      
      setSlots(sortedSlots)
      setSubstitutions(subs)
      setLoading(false)
    }
    fetchScheduleData()
  }, [])

  // Aggregate absent teachers from substitutions
  const absentTeachers = substitutions.reduce((acc, sub) => {
    if (!acc.find(t => t.id === sub.absent_teacher_id)) {
      acc.push({
        id: sub.absent_teacher_id,
        name: sub.absent_teacher_name,
        reason: "Болезнь" // mock reason
      })
    }
    return acc
  }, [] as {id: string, name: string, reason: string}[])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Расписание и замены</h1>
        <p className="text-sm text-slate-500 mt-1">Рабочий график на день</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Left Column: Schedule Table */}
        <div className="flex-1 space-y-4">
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  Расписание уроков (Понедельник)
                </CardTitle>
                <Badge variant="outline" className="bg-white font-medium text-slate-600">Все классы</Badge>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-center w-12 border-r border-slate-100">№</th>
                    <th className="px-4 py-3">Время</th>
                    <th className="px-4 py-3">Предмет</th>
                    <th className="px-4 py-3">Класс</th>
                    <th className="px-4 py-3">Кабинет</th>
                    <th className="px-4 py-3">Преподаватель</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Загрузка расписания...</td>
                    </tr>
                  ) : slots.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Нет уроков в этот день</td>
                    </tr>
                  ) : (
                    slots.map((slot) => {
                      const isSubstituted = slot.status === 'substituted'
                      
                      return (
                        <tr key={slot.id} className={`hover:bg-slate-50 transition-colors ${isSubstituted ? 'bg-amber-50/30' : ''}`}>
                          <td className="px-4 py-3 text-center font-medium text-slate-500 border-r border-slate-100">{slot.period}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {slot.start_time} - {slot.end_time}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">{slot.subject}</td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-medium rounded px-2 hover:bg-slate-200 transition-colors shadow-sm">{slot.class_name}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {slot.room}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {isSubstituted ? (
                              <div className="flex flex-col">
                                <span className="font-semibold text-amber-700">{slot.substitute_teacher_name}</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 flex items-center gap-1 mt-0.5">
                                  <ArrowRight className="h-2.5 w-2.5" /> Замена назначена
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-800">{slot.teacher_name}</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Subs & Absentees */}
        <div className="w-full xl:w-[380px] shrink-0 space-y-6">
          {/* Approved Substitutions */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-slate-500" />
                Утвержденные замены
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 text-center text-sm text-slate-500">Загрузка...</div>
              ) : substitutions.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">Нет утвержденных замен</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {substitutions.map(sub => {
                    const statusText = sub.status === 'applied' ? 'Подтверждено' : 'Ожидает';
                    
                    return (
                      <div key={sub.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-medium rounded px-1.5 shadow-sm">{sub.affected_slots[0]?.class_name || 'Н/Д'}</Badge>
                            <span className="font-semibold text-slate-900 text-sm">{sub.affected_slots[0]?.subject || 'Предмет'}</span>
                          </div>
                          <Badge variant="outline" className={`font-semibold text-[9px] px-1.5 uppercase tracking-wider ${sub.status === 'applied' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm'}`}>
                            {statusText}
                          </Badge>
                        </div>

                        <div className="space-y-2 bg-slate-50/50 rounded-md p-3 border border-slate-100 mb-3 shadow-sm">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 flex items-center gap-1.5"><UserX className="h-3 w-3 text-slate-400" /> Отсутствует:</span>
                            <span className="font-medium text-slate-700 line-through decoration-slate-400">{sub.absent_teacher_name}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-slate-400" /> Заменяет:</span>
                            <span className="font-bold text-emerald-700">{sub.recommended_substitute_name}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            Каб. {sub.affected_slots[0]?.room || 'Н/Д'}
                          </div>
                          <div className="flex items-center gap-1.5 text-red-600/80">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Болезнь
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Absent Teachers Reference */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <UserX className="h-4 w-4 text-slate-500" />
                Справка: отсутствующие
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {loading ? (
                <div className="text-center text-sm text-slate-500 py-4">Загрузка...</div>
              ) : absentTeachers.length === 0 ? (
                <div className="text-center text-sm text-slate-500 py-4">Все преподаватели на месте</div>
              ) : (
                <div className="space-y-3">
                  {absentTeachers.map(teacher => (
                    <div key={teacher.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md border border-slate-100 shadow-sm">
                      <span className="font-semibold text-slate-900 text-sm">{teacher.name}</span>
                      <Badge variant="outline" className="bg-white text-slate-500 font-medium text-xs shadow-sm border-slate-200">{teacher.reason}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
