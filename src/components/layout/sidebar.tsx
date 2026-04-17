"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  ClipboardCheck, 
  AlertTriangle, 
  Mic, 
  FileText, 
  Settings,
  GraduationCap
} from "lucide-react"

const navigation = [
  { name: "Панель управления", href: "/", icon: LayoutDashboard },
  { name: "Посещаемость", href: "/attendance", icon: ClipboardCheck },
  { name: "Инциденты", href: "/tasks", icon: AlertTriangle },
  { name: "Голосовые команды", href: "/voice", icon: Mic },
  { name: "Расписание и замены", href: "/schedule", icon: CalendarDays },
  { name: "Сотрудники", href: "/staff", icon: Users },
  { name: "Приказы", href: "/regulations", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-white/50 backdrop-blur-md md:block md:w-64 md:shrink-0 h-screen sticky top-0 subtle-shadow">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 font-semibold text-xl text-slate-800">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            AI Zavuch
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-emerald-600" : "text-slate-400")} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">Директор</span>
              <span className="text-xs text-slate-500">Школа Aqbobek</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
