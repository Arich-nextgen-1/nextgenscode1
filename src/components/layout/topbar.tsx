"use client"

import { Bell, Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { mockKPI } from "@/data"

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white/50 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 subtle-shadow">
      <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-slate-700 md:hidden">
        <span className="sr-only">Открыть меню</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </Button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1 items-center" action="#" method="GET">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          <Input
            id="search-field"
            className="block h-9 w-full max-w-md pl-9 bg-slate-50 border-transparent focus-visible:bg-white transition-colors rounded-full"
            placeholder="Поиск учеников, сотрудников или задач..."
            type="search"
            name="search"
          />
        </form>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              AI Активен
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500 relative">
            <span className="sr-only">Показать уведомления</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            {mockKPI.unread_notifications > 0 && (
              <span className="absolute top-2 right-2.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
