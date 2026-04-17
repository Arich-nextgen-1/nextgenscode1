"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockStaff } from "@/data"
import { Search, Filter, Phone, Mail, UserPlus, MoreVertical } from "lucide-react"

const roleMap: Record<string, string> = {
  principal: 'Директор',
  vice_principal: 'Завуч',
  teacher: 'Учитель',
  teacher_assistant: 'Ассистент учителя',
  counselor: 'Психолог',
  librarian: 'Библиотекарь',
  nurse: 'Медсестра',
  administrator: 'Администратор'
}

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Сотрудники</h1>
          <p className="text-slate-500 mt-1">Управление сотрудниками школы и их квалификациями</p>
        </div>
        <Button className="bg-slate-900 text-white hover:bg-slate-800">
          <UserPlus className="mr-2 h-4 w-4" /> Добавить сотрудника
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Поиск сотрудников..." className="pl-9 bg-white" />
        </div>
        <Button variant="outline" className="gap-2 bg-white">
          <Filter className="h-4 w-4" /> Фильтры
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockStaff.map(staff => (
          <Card key={staff.id} className="overflow-hidden hover:shadow-md transition-shadow group">
            <CardContent className="p-0">
              <div className="p-5 flex flex-col items-center text-center border-b border-slate-100 relative">
                <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
                <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl mb-4 border-4 border-white shadow-sm">
                  {staff.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{staff.full_name}</h3>
                <p className="text-sm text-slate-500 mt-0.5 mb-3">{roleMap[staff.role] || staff.role}</p>
                
                <div className="flex gap-2">
                  {staff.status === 'active' ? (
                    <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-none">Активно</Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-50 text-red-700 border-none">Отсутствует</Badge>
                  )}
                  {staff.availability === 'busy' && (
                    <Badge variant="warning" className="bg-amber-50 text-amber-700 border-none">Занят</Badge>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 space-y-3">
                {staff.subject && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Предмет</span>
                    <span className="font-medium text-slate-900">{staff.subject}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Категория</span>
                  <span className="font-medium text-slate-900">{staff.qualification === 'highest' ? 'Высшая' : staff.qualification === 'first' ? 'Первая' : 'Нет'}</span>
                </div>
                <div className="pt-3 border-t border-slate-200/60 flex justify-center gap-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
