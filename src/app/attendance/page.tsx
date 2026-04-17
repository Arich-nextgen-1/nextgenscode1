"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getAttendanceOverview } from "@/services/attendance"
import type { AttendanceRecord } from "@/types"
import { Search, Filter, Users, UserCheck, UserMinus, FileText, CheckCircle2, Clock, Info } from "lucide-react"

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true)
      const data = await getAttendanceOverview()
      setRecords(data)
      setLoading(false)
    }
    fetchAttendance()
  }, [])

  const selectedRecord = useMemo(() => 
    records.find(r => r.id === selectedClassId), 
  [records, selectedClassId])

  const summary = useMemo(() => {
    return records.reduce((acc, curr) => {
      acc.total += curr.total_students || 0;
      acc.present += curr.present || 0;
      acc.absent += curr.absent || 0;
      if (curr.status === 'parsed') acc.received += 1;
      return acc;
    }, { total: 0, present: 0, absent: 0, received: 0 })
  }, [records])

  const filteredRecords = records.filter(r => 
    r.class_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Посещаемость</h1>
        <p className="text-sm text-slate-500 mt-1">Данные за сегодня по всем классам</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm rounded-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-100 rounded-md flex items-center justify-center text-slate-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Всего учеников</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-none mt-1">{loading ? "..." : summary.total}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm rounded-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Присутствуют</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-none mt-1">{loading ? "..." : summary.present}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm rounded-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-red-50 rounded-md flex items-center justify-center text-red-600">
              <UserMinus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Отсутствуют</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-none mt-1">{loading ? "..." : summary.absent}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm rounded-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-50 rounded-md flex items-center justify-center text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Отчетов получено</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-none mt-1">{loading ? "..." : `${summary.received} / ${records.length}`}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: List */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по классу или учителю..." 
                className="pl-9 h-10 border-slate-200 text-sm w-full bg-white shadow-sm"
              />
            </div>
            <Button variant="outline" className="h-10 border-slate-200 bg-white text-slate-600 shadow-sm">
              <Filter className="h-4 w-4 mr-2" />
              Фильтр
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-center py-10 text-slate-500 text-sm">Загрузка данных...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-slate-500 text-sm">Ничего не найдено</div>
            ) : (
              filteredRecords.map(record => {
                const percent = record.total_students > 0 ? Math.round((record.present / record.total_students) * 100) : 0;
                const isSelected = selectedClassId === record.id;
                
                return (
                  <Card 
                    key={record.id} 
                    onClick={() => setSelectedClassId(record.id)}
                    className={`cursor-pointer transition-colors border shadow-sm hover:border-slate-300 ${isSelected ? 'ring-2 ring-slate-900 border-slate-900' : 'border-slate-200'}`}
                  >
                    <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start space-y-0">
                      <div>
                        <CardTitle className="text-lg font-bold text-slate-900">{record.class_name}</CardTitle>
                        <p className="text-xs text-slate-500 mt-1">{record.teacher_name}</p>
                      </div>
                      <Badge variant="outline" className={record.status === 'parsed' ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium" : "bg-amber-50 text-amber-700 border-amber-200 font-medium"}>
                        {record.status === 'parsed' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {record.status === 'parsed' ? 'Получено' : 'Ожидается'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="flex items-end justify-between mt-2">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Посещаемость</p>
                          <p className="text-xl font-semibold text-slate-900">{percent}%</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-xs text-slate-600">Присутствуют: <span className="font-medium text-slate-900">{record.present}</span></p>
                          <p className="text-xs text-slate-600">Отсутствуют: <span className="font-medium text-slate-900">{record.absent}</span></p>
                          <p className="text-[10px] text-slate-400 mt-1">Всего: {record.total_students}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail Panel */}
        <div className="w-full lg:w-[400px] shrink-0">
          <Card className="border-slate-200 shadow-sm sticky top-24 min-h-[400px] flex flex-col rounded-lg overflow-hidden">
            {!selectedRecord ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Info className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">Выберите класс из списка</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Нажмите на карточку класса, чтобы просмотреть подробности отсутствия.</p>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 border-b border-slate-100 p-5">
                  <h3 className="text-lg font-bold text-slate-900">Класс {selectedRecord.class_name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{selectedRecord.teacher_name}</p>
                </div>
                
                <div className="p-5 border-b border-slate-100 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Всего</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedRecord.total_students}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Присутствуют</p>
                    <p className="text-lg font-semibold text-emerald-600">{selectedRecord.present}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Отсутствуют</p>
                    <p className="text-lg font-semibold text-red-600">{selectedRecord.absent}</p>
                  </div>
                </div>

                <div className="flex-1 p-5 bg-white">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">Список отсутствующих</h4>
                  
                  {selectedRecord.absent === 0 || !selectedRecord.absent_students || selectedRecord.absent_students.length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-lg">
                      <p className="text-sm text-slate-500 font-medium">Все присутствуют</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedRecord.absent_students.map((student, idx) => (
                        <div key={idx} className="flex flex-col p-3 border border-slate-100 rounded-md bg-slate-50/50">
                          <p className="text-sm font-medium text-slate-900">{student.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] uppercase text-slate-400 font-medium">Причина:</span>
                            <span className="text-xs text-slate-700">{student.reason || 'нет'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>

      </div>
    </div>
  )
}
